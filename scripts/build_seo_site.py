#!/usr/bin/env python3
"""Build a crawlable, static GitHub Pages site from the project READMEs."""

import argparse
import html
import json
import re
import shutil
from pathlib import Path, PurePosixPath
from urllib.parse import quote
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = "mohammed4122002/n8n-automation-portfolio"
DEFAULT_BASE_URL = "https://mohammed4122002.github.io/n8n-automation-portfolio"
SITE_TITLE = "أتمتة n8n بالعربية | 30 مشروعًا عمليًا"
SITE_DESCRIPTION = (
    "مكتبة عربية تضم 30 مشروع أتمتة مفتوح المصدر لـ n8n: "
    "سير عمل جاهزة، ملفات JSON، صور، وشروحات خطوة بخطوة."
)
SOCIAL_IMAGE_PROJECT = "30-learning-recovery"
TOKEN_RE = re.compile(
    r"(!?)\[([^\]]*)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*"
)


def clean_description(text):
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[`*_>#]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > 160:
        shortened = text[:157].rsplit(" ", 1)[0].rstrip("،؛,: ")
        return shortened + "..."
    return text


def heading_id(text):
    text = re.sub(r"[^\w\s\-]", "", text, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s\-]+", "-", text)


def copy_project_image(project_dir, relative_path, output_dir, base_url):
    source = (project_dir / relative_path).resolve()
    if not source.is_file() or ROOT not in source.parents:
        return ""
    relative = source.relative_to(project_dir.resolve()).as_posix()
    destination = output_dir / "assets" / "projects" / project_dir.name / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    encoded = "/".join(quote(part) for part in PurePosixPath(relative).parts)
    return base_url.rstrip("/") + "/assets/projects/" + project_dir.name + "/" + encoded


def render_inline(text, project_dir, output_dir, base_url):
    chunks = []
    position = 0
    for match in TOKEN_RE.finditer(text):
        chunks.append(html.escape(text[position : match.start()]))
        image, label, target, code, strong, emphasis = match.groups()
        if code is not None:
            chunks.append("<code>" + html.escape(code) + "</code>")
        elif strong is not None:
            chunks.append("<strong>" + html.escape(strong) + "</strong>")
        elif emphasis is not None:
            chunks.append("<em>" + html.escape(emphasis) + "</em>")
        else:
            label = html.escape(label)
            if image:
                local = target.startswith("./") or target.startswith("../")
                if local:
                    image_url = copy_project_image(
                        project_dir, target, output_dir, base_url
                    )
                else:
                    image_url = target
                if image_url:
                    chunks.append(
                        '<img src="'
                        + html.escape(image_url, quote=True)
                        + '" alt="'
                        + label
                        + '" loading="lazy">'
                    )
                else:
                    chunks.append(label)
            elif target.startswith("#"):
                chunks.append(
                    '<a href="' + html.escape(target, quote=True) + '">' + label + "</a>"
                )
            elif target.startswith(("https://", "http://", "mailto:")):
                chunks.append(
                    '<a href="'
                    + html.escape(target, quote=True)
                    + '" rel="noopener noreferrer">'
                    + label
                    + "</a>"
                )
            elif target.startswith("./") or target.startswith("../"):
                relative = (project_dir / target).resolve()
                if relative.is_file() and ROOT in relative.parents:
                    repo_path = quote(relative.relative_to(ROOT).as_posix(), safe="/")
                    href = (
                        "https://github.com/"
                        + REPOSITORY
                        + "/blob/main/"
                        + repo_path
                    )
                    chunks.append('<a href="' + href + '">' + label + "</a>")
                else:
                    chunks.append(label)
            else:
                chunks.append(label)
        position = match.end()
    chunks.append(html.escape(text[position:]))
    return "".join(chunks)


def markdown_to_html(markdown, project_dir, output_dir, base_url):
    lines = markdown.splitlines()
    rendered = []
    paragraph = []
    list_type = None
    table_rows = []
    in_code = False
    code_lines = []

    def flush_paragraph():
        if paragraph:
            rendered.append(
                "<p>"
                + render_inline(
                    " ".join(line.strip() for line in paragraph),
                    project_dir,
                    output_dir,
                    base_url,
                )
                + "</p>"
            )
            paragraph.clear()

    def flush_list():
        nonlocal list_type
        if list_type:
            rendered.append("</" + list_type + ">")
            list_type = None

    def flush_table():
        if not table_rows:
            return
        rows = table_rows[:1] + table_rows[2:] if len(table_rows) > 1 else table_rows
        rendered.append('<div class="table-wrap"><table>')
        for row_index, row in enumerate(rows):
            cells = [cell.strip() for cell in row.strip().strip("|").split("|")]
            tag = "th" if row_index == 0 else "td"
            rendered.append(
                "<tr>"
                + "".join(
                    "<"
                    + tag
                    + ">"
                    + render_inline(cell, project_dir, output_dir, base_url)
                    + "</"
                    + tag
                    + ">"
                    for cell in cells
                )
                + "</tr>"
            )
        rendered.append("</table></div>")
        table_rows.clear()

    for line in lines:
        stripped = line.strip()
        if in_code:
            if stripped.startswith("```"):
                rendered.append(
                    "<pre><code>"
                    + html.escape("\n".join(code_lines))
                    + "</code></pre>"
                )
                code_lines.clear()
                in_code = False
            else:
                code_lines.append(line)
            continue
        if stripped.startswith("```"):
            flush_paragraph()
            flush_list()
            flush_table()
            in_code = True
            continue
        if stripped.startswith("|") and "|" in stripped[1:]:
            flush_paragraph()
            flush_list()
            table_rows.append(stripped)
            continue
        flush_table()
        heading = re.match(r"^(#{1,6})\s+(.+?)\s*#*$", stripped)
        if heading:
            flush_paragraph()
            flush_list()
            level = len(heading.group(1))
            if level == 1:
                continue
            title = heading.group(2)
            rendered.append(
                f'<h{level} id="{html.escape(heading_id(title), quote=True)}">'
                + render_inline(title, project_dir, output_dir, base_url)
                + f"</h{level}>"
            )
            continue
        if not stripped or stripped == "---":
            flush_paragraph()
            flush_list()
            continue
        list_match = re.match(r"^(\d+\.\s+|[-*]\s+)(.+)$", stripped)
        if list_match:
            flush_paragraph()
            requested_type = "ol" if list_match.group(1)[0].isdigit() else "ul"
            if list_type != requested_type:
                flush_list()
                list_type = requested_type
                rendered.append("<" + list_type + ">")
            rendered.append(
                "<li>"
                + render_inline(
                    list_match.group(2), project_dir, output_dir, base_url
                )
                + "</li>"
            )
            continue
        flush_list()
        if stripped.startswith(">"):
            flush_paragraph()
            rendered.append(
                "<blockquote><p>"
                + render_inline(stripped[1:].strip(), project_dir, output_dir, base_url)
                + "</p></blockquote>"
            )
            continue
        paragraph.append(stripped)

    flush_paragraph()
    flush_list()
    flush_table()
    if in_code:
        rendered.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
    return "\n".join(rendered)


def page_shell(title, description, canonical, social_image, content, base_url):
    return f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description, quote=True)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="{html.escape(canonical, quote=True)}">
  <link rel="alternate" hreflang="ar" href="{html.escape(canonical, quote=True)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:site_name" content="{html.escape(SITE_TITLE, quote=True)}">
  <meta property="og:title" content="{html.escape(title, quote=True)}">
  <meta property="og:description" content="{html.escape(description, quote=True)}">
  <meta property="og:url" content="{html.escape(canonical, quote=True)}">
  <meta property="og:image" content="{html.escape(social_image, quote=True)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(title, quote=True)}">
  <meta name="twitter:description" content="{html.escape(description, quote=True)}">
  <meta name="twitter:image" content="{html.escape(social_image, quote=True)}">
  <link rel="sitemap" type="application/xml" href="{base_url}/sitemap.xml">
  <style>
    :root {{ color-scheme: light; --ink:#172033; --muted:#58647a; --accent:#ee654f; --line:#e4e8ef; --paper:#fff; --wash:#f5f7fb; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; color:var(--ink); background:var(--wash); font:17px/1.85 system-ui,-apple-system,"Segoe UI",sans-serif; }}
    a {{ color:#a8322b; text-underline-offset:3px; }}
    .wrap {{ width:min(940px,calc(100% - 32px)); margin:auto; }}
    header {{ padding:20px 0; border-bottom:1px solid var(--line); background:var(--paper); }}
    header a {{ font-weight:700; text-decoration:none; }}
    main {{ padding:34px 0 70px; }}
    article,.card {{ padding:clamp(20px,4vw,42px); background:var(--paper); border:1px solid var(--line); border-radius:18px; box-shadow:0 12px 36px #1720330b; }}
    h1 {{ margin:.2em 0; font-size:clamp(2rem,6vw,3.3rem); line-height:1.3; }}
    h2 {{ margin-top:1.8em; padding-bottom:.3em; border-bottom:1px solid var(--line); }}
    h3 {{ margin-top:1.5em; }}
    .lead {{ color:var(--muted); font-size:1.12rem; }}
    .actions {{ display:flex; flex-wrap:wrap; gap:12px; margin:24px 0; }}
    .button {{ display:inline-block; padding:9px 16px; border:1px solid var(--line); border-radius:10px; text-decoration:none; font-weight:650; }}
    .button.primary {{ color:white; background:var(--accent); border-color:var(--accent); }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; margin-top:24px; }}
    .project-card {{ padding:20px; border:1px solid var(--line); border-radius:14px; background:white; }}
    .project-card h2 {{ margin:0 0 8px; border:0; font-size:1.15rem; }}
    .project-card p {{ margin:0 0 12px; color:var(--muted); font-size:.96rem; }}
    .project-card a {{ font-weight:650; }}
    img {{ display:block; max-width:100%; height:auto; margin:20px auto; border-radius:12px; }}
    ul,ol {{ padding-right:1.5em; }}
    li {{ margin:.3em 0; }}
    blockquote {{ margin:1.5em 0; padding:8px 18px; border-right:4px solid var(--accent); color:var(--muted); background:var(--wash); }}
    code,pre {{ direction:ltr; text-align:left; font: .9em/1.65 ui-monospace,SFMono-Regular,Consolas,monospace; }}
    code {{ padding:.12em .35em; background:#edf0f5; border-radius:4px; }}
    pre {{ overflow:auto; padding:16px; border-radius:10px; background:#172033; color:#f3f5f8; }}
    pre code {{ padding:0; background:none; color:inherit; }}
    .table-wrap {{ overflow-x:auto; }}
    table {{ width:100%; border-collapse:collapse; }}
    th,td {{ padding:8px 10px; border:1px solid var(--line); text-align:right; }}
    footer {{ padding:24px 0; color:var(--muted); border-top:1px solid var(--line); background:white; }}
    @media(prefers-reduced-motion:no-preference) {{ a {{ transition:color .15s ease; }} a:hover {{ color:var(--accent); }} }}
  </style>
</head>
<body>
  <header><div class="wrap"><a href="{base_url}/">{html.escape(SITE_TITLE)}</a></div></header>
  <main class="wrap">{content}</main>
  <footer><div class="wrap">مشاريع n8n مفتوحة المصدر — <a href="https://github.com/{REPOSITORY}">المستودع على GitHub</a></div></footer>
</body>
</html>
"""


def discover_projects():
    projects = []
    for directory in sorted(ROOT.glob("[0-9][0-9]-*")):
        readme = directory / "README.md"
        workflows = sorted(directory.glob("*.json"))
        if not readme.is_file() or not workflows:
            continue
        markdown = readme.read_text(encoding="utf-8")
        lines = markdown.splitlines()
        title = next(
            (line[2:].strip() for line in lines if line.startswith("# ")),
            directory.name.replace("-", " "),
        )
        description = ""
        for line in lines:
            stripped = line.strip()
            if stripped and not stripped.startswith(("#", "<", "![", "- ")):
                description = clean_description(stripped)
                break
        image = next(
            (
                path
                for path in sorted((directory / "screenshots").glob("*"))
                if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
            ),
            None,
        )
        projects.append(
            {
                "directory": directory,
                "slug": directory.name,
                "title": title,
                "description": description,
                "markdown": markdown,
                "workflows": workflows,
                "image": image,
            }
        )
    return projects


def build(output_dir, base_url):
    output_dir.mkdir(parents=True, exist_ok=True)
    projects = discover_projects()
    if not projects:
        raise RuntimeError("No project folders with README.md and workflow JSON found.")
    base_url = base_url.rstrip("/")
    cover = ROOT / SOCIAL_IMAGE_PROJECT / "screenshots" / "workflow-overview.png"
    cover_url = (
        "https://raw.githubusercontent.com/"
        + REPOSITORY
        + "/main/"
        + quote(cover.relative_to(ROOT).as_posix(), safe="/")
    )
    index_url = base_url + "/"
    cards = []
    for project in projects:
        page_url = base_url + "/projects/" + project["slug"] + "/"
        cards.append(
            '<article class="project-card"><h2><a href="'
            + page_url
            + '">'
            + html.escape(project["title"])
            + "</a></h2><p>"
            + html.escape(project["description"])
            + '</p><a href="'
            + page_url
            + '">تفاصيل المشروع والملفات ←</a></article>'
        )
        project_dir = output_dir / "projects" / project["slug"]
        project_dir.mkdir(parents=True, exist_ok=True)
        workflow_links = []
        for workflow in project["workflows"]:
            raw_url = (
                "https://raw.githubusercontent.com/"
                + REPOSITORY
                + "/main/"
                + quote(workflow.relative_to(ROOT).as_posix(), safe="/")
            )
            workflow_links.append(
                '<a class="button primary" href="'
                + raw_url
                + '">تحميل '
                + html.escape(workflow.name)
                + "</a>"
            )
        readme_url = (
            "https://github.com/"
            + REPOSITORY
            + "/blob/main/"
            + quote((project["directory"] / "README.md").relative_to(ROOT).as_posix(), safe="/")
        )
        project_image_url = ""
        if project["image"]:
            project_image_url = copy_project_image(
                project["directory"],
                "./" + project["image"].relative_to(project["directory"]).as_posix(),
                output_dir,
                base_url,
            )
        actions = (
            '<nav class="actions">'
            + "".join(workflow_links)
            + '<a class="button" href="'
            + readme_url
            + '">الشرح الأصلي على GitHub</a></nav>'
        )
        image_html = (
            '<img src="'
            + html.escape(project_image_url, quote=True)
            + '" alt="مخطط '
            + html.escape(project["title"], quote=True)
            + ' في n8n" loading="eager">'
            if project_image_url
            else ""
        )
        body = (
            '<article><nav aria-label="مسار التنقل"><a href="'
            + base_url
            + '/">الرئيسية</a> / '
            + html.escape(project["title"])
            + "</nav>"
            + "<h1>"
            + html.escape(project["title"])
            + "</h1><p class=\"lead\">"
            + html.escape(project["description"])
            + "</p>"
            + actions
            + image_html
            + '<div class="project-content">'
            + markdown_to_html(
                project["markdown"], project["directory"], output_dir, base_url
            )
            + "</div>"
            + actions
            + "</article>"
        )
        canonical = page_url
        structured_data = {
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            "name": project["title"],
            "description": project["description"],
            "url": canonical,
            "codeRepository": readme_url,
            "programmingLanguage": ["JSON", "JavaScript"],
            "runtimePlatform": "n8n",
            "applicationCategory": "BusinessApplication",
            "inLanguage": "ar",
        }
        body += (
            '<script type="application/ld+json">'
            + json.dumps(structured_data, ensure_ascii=False).replace("</", "<\\/")
            + "</script>"
        )
        document = page_shell(
            project["title"] + " | n8n",
            project["description"],
            canonical,
            project_image_url or cover_url,
            body,
            base_url,
        )
        (project_dir / "index.html").write_text(document, encoding="utf-8")

    index_body = (
        '<section class="card"><h1>'
        + html.escape(SITE_TITLE)
        + '</h1><p class="lead">مشاريع عربية عملية ومفتوحة المصدر '
        "لتعلّم أتمتة البريد، البيانات، المبيعات، المخزون، التعليم، والذكاء الاصطناعي باستخدام n8n.</p>"
        '<p>استكشف '
        + str(len(projects))
        + " مشروعًا مع ملفات workflow بصيغة JSON، صور توضيحية، ومتطلبات وخطوات تشغيل قابلة للتجربة.</p>"
        '<p><a class="button primary" href="https://github.com/'
        + REPOSITORY
        + '">المستودع على GitHub</a></p></section><section class="grid" aria-label="مشاريع n8n">'
        + "".join(cards)
        + "</section>"
    )
    index_data = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": SITE_TITLE,
        "description": SITE_DESCRIPTION,
        "url": index_url,
        "inLanguage": "ar",
        "numberOfItems": len(projects),
    }
    index_body += (
        '<script type="application/ld+json">'
        + json.dumps(index_data, ensure_ascii=False).replace("</", "<\\/")
        + "</script>"
    )
    (output_dir / "index.html").write_text(
        page_shell(SITE_TITLE, SITE_DESCRIPTION, index_url, cover_url, index_body, base_url),
        encoding="utf-8",
    )

    sitemap = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for url in [index_url] + [
        base_url + "/projects/" + project["slug"] + "/" for project in projects
    ]:
        url_element = ET.SubElement(sitemap, "url")
        ET.SubElement(url_element, "loc").text = url
    ET.indent(sitemap, space="  ")
    (output_dir / "sitemap.xml").write_bytes(
        ET.tostring(sitemap, encoding="utf-8", xml_declaration=True)
    )
    (output_dir / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: " + base_url + "/sitemap.xml\n",
        encoding="utf-8",
    )
    (output_dir / "404.html").write_text(
        page_shell(
            "الصفحة غير موجودة | " + SITE_TITLE,
            "تعذر العثور على الصفحة المطلوبة. تصفح فهرس مشاريع n8n.",
            base_url + "/404.html",
            cover_url,
            '<article><h1>الصفحة غير موجودة</h1><p><a href="'
            + base_url
            + '/">تصفح جميع المشاريع</a></p></article>',
            base_url,
        ),
        encoding="utf-8",
    )
    print(f"Built {len(projects)} project pages at {output_dir}")
    print(f"Sitemap: {output_dir / 'sitemap.xml'}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()
    build(args.output.resolve(), args.base_url)


if __name__ == "__main__":
    main()
