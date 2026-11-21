// يولّد صور الهوية في README: banner.png و stats.png و footer.png
// الاستخدام:
//   FONTS_DIR=<node_modules/@fontsource/> ICONS_DIR=<node_modules/> NODE_PATH=<مسار playwright> node assets/brand/make_brand.js
// FONTS_DIR: حزم @fontsource/cairo و @fontsource/playfair-display
// ICONS_DIR: حزم @phosphor-icons/core و simple-icons
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=__dirname, FD=process.env.FONTS_DIR, ICONS=process.env.ICONS_DIR;
const G='#C9A24B', GL='#E8C066';
const b64=p=>fs.readFileSync(path.join(FD,p)).toString('base64');
const AR='U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F',LA='U+0000-05FF,U+2000-206F,U+2190-2BFF';
const ff=(f,w,p,u)=>`@font-face{font-family:${f};font-weight:${w};src:url(data:font/woff2;base64,${b64(p)});unicode-range:${u}}`;

let GID=0;
const grad=()=>{const id='g'+(GID++);return [id,`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".4" stop-color="#E8C066"/><stop offset=".75" stop-color="#C9A24B"/><stop offset="1" stop-color="#8F6A1F"/></linearGradient></defs>`]};
// أيقونة Phosphor بتدرّج ذهبي (أو لون محدد)
function ic(name,size,color='gold',weight='duotone'){
  let s=fs.readFileSync(path.join(ICONS,'@phosphor-icons/core/assets',weight,`${name}-${weight}.svg`),'utf8');
  let fill=color,defs='';if(color==='gold'){const [id,d]=grad();fill=`url(#${id})`;defs=d;}
  s=s.replace('fill="currentColor"',`fill="${fill}" width="${size}" height="${size}"`).replace(/opacity="0.2"/g,'opacity="0.38"');
  return s.replace(/(<svg[^>]*>)/,`$1${defs}`);
}
// شعار من Simple Icons بتدرّج ذهبي (أو لون محدد)
function logo(name,size,color='gold'){
  let s=fs.readFileSync(path.join(ICONS,'simple-icons/icons',name+'.svg'),'utf8');
  let fill=color,defs='';if(color==='gold'){const [id,d]=grad();fill=`url(#${id})`;defs=d;}
  return s.replace('<svg ',`<svg width="${size}" height="${size}" fill="${fill}" `).replace(/(<svg[^>]*>)/,`$1${defs}`);
}

const css=[ff('C',400,'cairo/files/cairo-arabic-400-normal.woff2',AR),ff('C',800,'cairo/files/cairo-arabic-800-normal.woff2',AR),ff('C',400,'cairo/files/cairo-latin-400-normal.woff2',LA),ff('C',800,'cairo/files/cairo-latin-800-normal.woff2',LA),ff('P',700,'playfair-display/files/playfair-display-latin-700-normal.woff2',LA),ff('P',800,'playfair-display/files/playfair-display-latin-800-normal.woff2',LA)].join('')+`
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow:hidden}svg{display:block;flex:none}
body{font-family:C,sans-serif;color:#111;position:relative;background:
radial-gradient(ellipse 500px 200px at 12% 15%,#fff 0,rgba(255,255,255,0) 70%),
radial-gradient(ellipse 600px 220px at 85% 25%,rgba(255,255,255,.9) 0,rgba(255,255,255,0) 70%),
radial-gradient(ellipse 700px 300px at 90% 100%,rgba(255,214,140,.75) 0,rgba(255,214,140,0) 70%),
radial-gradient(ellipse 600px 260px at 0% 100%,rgba(170,200,130,.45) 0,rgba(170,200,130,0) 70%),
linear-gradient(180deg,#bcd9f2 0%,#dcebf6 45%,#fbf1dc 100%)}
.brand{display:flex;align-items:center;gap:20px;direction:ltr}
.mono{font-family:P,serif;font-weight:800;font-size:76px;line-height:.9;letter-spacing:-5px;position:relative;padding-right:24px}
.mono i{position:absolute;right:-2px;top:-12px;font-style:normal;color:${G};font-size:28px;letter-spacing:0}
.sep{width:2px;height:60px;background:${G}}.nm{font-family:P,serif;font-weight:700;font-size:28px;line-height:1.1}
.rl{font-weight:800;font-size:17px;letter-spacing:3px;margin-top:6px}.rl b{color:${G}}
.tag{text-align:center;font-weight:800;letter-spacing:7px;direction:ltr}.tag b{color:${G};margin:0 12px}
.glossy{background:radial-gradient(circle at 30% 18%,#4d4d4d 0,#1a1a1a 55%,#050505 100%);
 box-shadow:0 0 0 5px #D9B25E,0 0 0 13px rgba(201,162,75,.22),0 0 70px 16px rgba(255,200,90,.42),0 40px 70px rgba(30,20,5,.5),inset 0 3px 0 rgba(255,255,255,.2)}
.mini{background:radial-gradient(circle at 30% 20%,#444,#121212 65%,#050505);box-shadow:0 0 0 3px #D9B25E,0 16px 32px rgba(0,0,0,.3)}
.rays{position:absolute;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,214,130,.34) 0deg 5deg,rgba(255,255,255,0) 5deg 15deg);
 -webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 28%,transparent 60%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 28%,transparent 60%)}
.halo{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,1) 0,rgba(255,215,130,.55) 38%,rgba(255,255,255,0) 70%)}
.orbit{position:absolute;border-radius:50%;border:2px solid rgba(201,162,75,.35)}
.spk{position:absolute;filter:drop-shadow(0 2px 6px rgba(201,162,75,.6))}`;

const brand=`<div class="brand"><div class="mono"><span>M</span><span style="color:${G}">A</span><i>✦</i></div><div class="sep"></div><div><div class="nm">Mohammed Abu Saada</div><div class="rl">AI Agent <b>•</b> AI Engineer</div></div></div>`;

// ── البانر ──
const services=[['gmail','Gmail'],['googlesheets','Sheets'],['googledrive','Drive'],['telegram','Telegram'],['googlegemini','Gemini']];
const sc={x:930,y:330}; // مركز المشهد
const ring=services.map(([n],i)=>{const a=-Math.PI/2+i*2*Math.PI/services.length,r=215;
  return `<div class="mini" style="position:absolute;left:${sc.x+r*Math.cos(a)-46}px;top:${sc.y+r*Math.sin(a)-46}px;width:92px;height:92px;border-radius:26px;display:flex;align-items:center;justify-content:center">${logo(n,44)}</div>`}).join('');
const lines=services.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/services.length,r=215;
  return `<line x1="${sc.x}" y1="${sc.y}" x2="${sc.x+r*Math.cos(a)}" y2="${sc.y+r*Math.sin(a)}" stroke="${G}" stroke-width="3" stroke-dasharray="8 10" opacity=".7"/>`}).join('');
const banner=`<div style="position:absolute;inset:0">
<div class="rays" style="left:${sc.x-460}px;top:${sc.y-460}px;width:920px;height:920px"></div>
<div class="halo" style="left:${sc.x-260}px;top:${sc.y-260}px;width:520px;height:520px"></div>
<div class="orbit" style="left:${sc.x-215}px;top:${sc.y-215}px;width:430px;height:430px"></div>
<svg width="1280" height="640" style="position:absolute;inset:0">${lines}</svg>
<div class="glossy" style="position:absolute;left:${sc.x-110}px;top:${sc.y-110}px;width:220px;height:220px;border-radius:58px;display:flex;align-items:center;justify-content:center;transform:perspective(900px) rotateY(-10deg)">${logo('n8n',130)}</div>
${ring}
<div class="spk" style="left:${sc.x-250}px;top:70px">${ic('sparkle',30,'gold','fill')}</div>
<div class="spk" style="left:${sc.x+230}px;top:560px">${ic('sparkle',24,'gold','fill')}</div>
<div class="spk" style="left:${sc.x+260}px;top:90px">${ic('sparkle',20,'gold','fill')}</div>
<div style="position:absolute;left:64px;top:48px">${brand}</div>
<div style="position:absolute;left:64px;top:170px;width:700px">
 <div style="font-weight:800;font-size:96px;line-height:1;direction:ltr"><span style="color:${G}">n8n</span></div>
 <div style="font-weight:800;font-size:62px;line-height:1.1;direction:ltr;margin-top:6px">Automation Portfolio</div>
 <div dir="rtl" style="font-weight:800;font-size:29px;margin-top:20px;white-space:nowrap;display:inline-block">أتمتة عملية، خطوة بخطوة · 30 workflow جاهز</div>
 <div style="display:flex;gap:12px;margin-top:24px">${['AI Agents','RAG','Automation'].map((t,i)=>`<span style="display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px;padding:8px 20px 8px 10px;border-radius:99px;background:linear-gradient(150deg,#2a2a2a,#0d0d0d);color:#fff;border:1px solid rgba(232,192,102,.4);box-shadow:0 8px 18px rgba(0,0,0,.2)">${ic(['robot','magnifying-glass','lightning'][i],26,'gold','fill')}${t}</span>`).join('')}</div>
</div>
<div class="tag" style="position:absolute;left:64px;bottom:40px;font-size:20px;text-align:left">INNOVATE<b>•</b>AUTOMATE<b>•</b>TRANSFORM</div></div>`;

// ── الإحصائيات ──
const stats=`<div dir="rtl" style="position:absolute;inset:0;padding:36px 44px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">
${[['30','مشروع جاهز','stack'],['10+','خدمة متصلة','plugs-connected'],['AI','OpenAI · Gemini','brain'],['1-Click','استيراد وتشغيل','cursor-click']].map(([n,t,icn],i)=>{const gold=i%2==1;
return `<div style="position:relative;border-radius:26px;padding:24px 26px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;
${gold?'background:linear-gradient(150deg,#F6DE9C 0%,#E8C066 45%,#D4AE57 100%);color:#111;border:1px solid rgba(255,255,255,.6)':'background:linear-gradient(150deg,#363636 0%,#1c1c1c 60%,#111 100%);color:#fff;border:1px solid rgba(232,192,102,.3)'};box-shadow:0 18px 40px rgba(30,22,5,.28)">
<div class="mini" style="width:74px;height:74px;border-radius:22px;display:flex;align-items:center;justify-content:center">${ic(icn,42,'gold','duotone')}</div>
<div><div style="font-weight:800;font-size:60px;line-height:1.05;direction:ltr;text-align:right;${gold?'':`color:${GL}`}">${n}</div><div style="font-weight:800;font-size:24px;margin-top:4px">${t}</div></div></div>`}).join('')}</div>`;

// ── التذييل ──
const footer=`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px">
<div class="halo" style="left:390px;top:-150px;width:500px;height:500px;opacity:.6"></div>
<div style="position:relative">${brand}</div><div class="tag" style="position:relative;font-size:21px">INNOVATE<b>•</b>AUTOMATE<b>•</b>TRANSFORM</div></div>`;

const pages={banner:[1280,640,banner],stats:[1280,300,stats],footer:[1280,220,footer]};
(async()=>{const br=await chromium.launch();
for(const [n,[w,h,body]] of Object.entries(pages)){const pg=await br.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
 await pg.setContent(`<html><style>${css}</style><body style="width:${w}px;height:${h}px">${body}</body></html>`);await pg.evaluate(()=>document.fonts.ready);
 await pg.screenshot({path:path.join(OUT,n+'.png')});await pg.close();}
await br.close();})();
