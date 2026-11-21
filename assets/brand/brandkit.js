// أدوات مشتركة لصور README بهوية Mohammed Abu Saada (تصميم V3)
// المتغيرات: FONTS_DIR (@fontsource) و ICONS_DIR (@phosphor-icons/core و simple-icons) و AVATAR و PORTRAIT (صور jpg)
const fs=require('fs'),path=require('path');
const FD=process.env.FONTS_DIR, ICONS=process.env.ICONS_DIR;
const G='#C9A24B', GL='#E8C066';
const b64f=p=>fs.readFileSync(p).toString('base64');
const b64=p=>b64f(path.join(FD,p));
const AR='U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F',LA='U+0000-05FF,U+2000-206F,U+2190-2BFF';
const ff=(f,w,p,u)=>`@font-face{font-family:${f};font-weight:${w};src:url(data:font/woff2;base64,${b64(p)});unicode-range:${u}}`;
let GID=0;
const grad=()=>{const id='g'+(GID++);return [id,`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".4" stop-color="#E8C066"/><stop offset=".75" stop-color="#C9A24B"/><stop offset="1" stop-color="#8F6A1F"/></linearGradient></defs>`]};
function ic(name,size,color='gold',weight='duotone'){
  let s=fs.readFileSync(path.join(ICONS,'@phosphor-icons/core/assets',weight,`${name}-${weight}.svg`),'utf8');
  let fill=color,defs='';if(color==='gold'){const [id,d]=grad();fill=`url(#${id})`;defs=d;}
  s=s.replace('fill="currentColor"',`fill="${fill}" width="${size}" height="${size}"`).replace(/opacity="0.2"/g,'opacity="0.38"');
  return s.replace(/(<svg[^>]*>)/,`$1${defs}`);
}
function logo(name,size,color='gold'){
  let s=fs.readFileSync(path.join(ICONS,'simple-icons/icons',name+'.svg'),'utf8');
  let fill=color,defs='';if(color==='gold'){const [id,d]=grad();fill=`url(#${id})`;defs=d;}
  return s.replace('<svg ',`<svg width="${size}" height="${size}" fill="${fill}" `).replace(/(<svg[^>]*>)/,`$1${defs}`);
}
const AV=`data:image/jpeg;base64,${b64f(process.env.AVATAR)}`, PT=`data:image/jpeg;base64,${b64f(process.env.PORTRAIT)}`;

const CSS=[ff('C',400,'cairo/files/cairo-arabic-400-normal.woff2',AR),ff('C',800,'cairo/files/cairo-arabic-800-normal.woff2',AR),ff('C',400,'cairo/files/cairo-latin-400-normal.woff2',LA),ff('C',800,'cairo/files/cairo-latin-800-normal.woff2',LA),ff('P',700,'playfair-display/files/playfair-display-latin-700-normal.woff2',LA),ff('P',800,'playfair-display/files/playfair-display-latin-800-normal.woff2',LA)].join('')+`
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow:hidden}svg{display:block;flex:none}
body{font-family:C,sans-serif;color:#111;position:relative;background:
radial-gradient(ellipse 500px 200px at 12% 15%,#fff 0,rgba(255,255,255,0) 70%),
radial-gradient(ellipse 600px 220px at 85% 25%,rgba(255,255,255,.9) 0,rgba(255,255,255,0) 70%),
radial-gradient(ellipse 700px 300px at 90% 100%,rgba(255,214,140,.75) 0,rgba(255,214,140,0) 70%),
radial-gradient(ellipse 600px 260px at 0% 100%,rgba(170,200,130,.45) 0,rgba(170,200,130,0) 70%),
linear-gradient(180deg,#bcd9f2 0%,#dcebf6 45%,#fbf1dc 100%)}
.brand{display:flex;align-items:center;gap:20px;direction:ltr}
.avatar{flex:none;width:84px;height:84px;border-radius:50%;padding:4px;background:linear-gradient(145deg,#FFF1C4,#E8C066 40%,#C9A24B 70%,#8F6A1F);box-shadow:0 0 20px rgba(255,200,90,.45),0 8px 18px rgba(0,0,0,.22)}
.avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid #fff;display:block}
.sep{width:2px;height:60px;background:${G}}.nm{font-family:P,serif;font-weight:700;font-size:30px;line-height:1.1}
.rl{font-weight:800;font-size:17px;letter-spacing:3px;margin-top:6px}.rl b{color:${G}}
.tag{font-weight:800;letter-spacing:7px;direction:ltr}.tag b{color:${G};margin:0 12px}
mark{color:inherit;background:linear-gradient(180deg,transparent 56%,rgba(232,192,102,.9) 56%,rgba(232,192,102,.9) 92%,transparent 92%);padding:0 6px}
.glossy{background:radial-gradient(circle at 30% 18%,#4d4d4d 0,#1a1a1a 55%,#050505 100%);
 box-shadow:0 0 0 5px #D9B25E,0 0 0 13px rgba(201,162,75,.22),0 0 60px 12px rgba(255,200,90,.4),0 30px 60px rgba(30,20,5,.5),inset 0 3px 0 rgba(255,255,255,.2)}
.mini{background:radial-gradient(circle at 30% 20%,#444,#121212 65%,#050505);box-shadow:0 0 0 3px #D9B25E,0 14px 28px rgba(0,0,0,.3)}
.rays{position:absolute;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,214,130,.34) 0deg 5deg,rgba(255,255,255,0) 5deg 15deg);
 -webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 28%,transparent 60%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 28%,transparent 60%)}
.halo{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,226,150,1) 0,rgba(255,215,130,.55) 38%,rgba(255,255,255,0) 70%)}
.orbit{position:absolute;border-radius:50%;border:2px dashed rgba(201,162,75,.45)}
.arch{position:absolute;padding:7px;background:linear-gradient(160deg,#FFF1C4,#E8C066 35%,#C9A24B 65%,#8F6A1F);
 box-shadow:0 0 0 12px rgba(201,162,75,.18),0 0 80px 18px rgba(255,200,90,.45),0 36px 70px rgba(30,20,5,.45)}
.arch img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block;background:#000}
.chip{display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px;padding:8px 20px 8px 10px;border-radius:99px;background:linear-gradient(150deg,#2a2a2a,#0d0d0d);color:#fff;border:1px solid rgba(232,192,102,.4);box-shadow:0 8px 18px rgba(0,0,0,.2)}
.bignum{position:absolute;font-weight:800;line-height:.8;color:transparent;-webkit-text-stroke:3px rgba(201,162,75,.3);direction:ltr}`;

const brand=`<div class="brand"><div class="avatar"><img src="${AV}"></div><div class="sep"></div><div><div class="nm">Mohammed Abu Saada</div><div class="rl">AI Agent <b>•</b> AI Engineer</div></div></div>`;

// بانر: نص على اليسار، وعلى اليمين صورتك بالقوس + مربع رئيسي + شعارات تدور حولها
function banner({titleTop,titleBottom,sub,chips,hub,orbitLogos,bignum}){
  const cx=1010,cy=330,R=238;
  const angs=[198,236,270,304,342];
  const orb=orbitLogos.slice(0,5).map((l,i)=>{const a=angs[i]*Math.PI/180;
    return `<div class="mini" style="position:absolute;left:${cx+R*Math.cos(a)-38}px;top:${cy+R*Math.sin(a)-38}px;width:76px;height:76px;border-radius:22px;display:flex;align-items:center;justify-content:center">${l.startsWith('ph:')?ic(l.slice(3),38):logo(l,36)}</div>`}).join('');
  return `<div style="position:absolute;inset:0">
<div class="rays" style="left:${cx-450}px;top:${cy-450}px;width:900px;height:900px"></div>
<div class="halo" style="left:${cx-250}px;top:${cy-250}px;width:500px;height:500px"></div>
${bignum?`<div class="bignum" style="left:${cx-330}px;top:${cy-300}px;font-size:420px">${bignum}</div>`:''}
<div class="orbit" style="left:${cx-R}px;top:${cy-R}px;width:${2*R}px;height:${2*R}px"></div>
<div class="arch" style="left:${cx-150}px;top:${cy-195}px;width:300px;height:400px;border-radius:150px 150px 30px 30px"><img src="${PT}" style="border-radius:143px 143px 23px 23px"></div>
<div class="glossy" style="position:absolute;left:${cx-210}px;top:${cy+110}px;width:120px;height:120px;border-radius:34px;display:flex;align-items:center;justify-content:center">${hub}</div>
${orb}
<div style="position:absolute;left:64px;top:46px">${brand}</div>
<div style="position:absolute;left:64px;top:190px;width:700px">
 <div style="font-weight:800;font-size:92px;line-height:1;direction:ltr">${titleTop}</div>
 <div style="font-weight:800;font-size:60px;line-height:1.15;direction:ltr;margin-top:8px">${titleBottom}</div>
 <div dir="rtl" style="font-weight:800;font-size:29px;margin-top:22px;white-space:nowrap;display:inline-block">${sub}</div>
 <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">${chips}</div>
</div>
<div class="tag" style="position:absolute;left:64px;bottom:40px;font-size:20px">INNOVATE<b>•</b>AUTOMATE<b>•</b>TRANSFORM</div></div>`;
}
function footer(){
  return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px">
<div class="halo" style="left:390px;top:-150px;width:500px;height:500px;opacity:.6"></div>
<div style="position:relative">${brand.replace('width:84px;height:84px','')}</div><div class="tag" style="position:relative;font-size:21px">INNOVATE<b>•</b>AUTOMATE<b>•</b>TRANSFORM</div></div>`;
}
async function render(pages,OUT){
  const {chromium}=require('playwright');const br=await chromium.launch();
  for(const [n,[w,h,body]] of Object.entries(pages)){const pg=await br.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
    await pg.setContent(`<html><style>${CSS}</style><body style="width:${w}px;height:${h}px">${body}</body></html>`);await pg.evaluate(()=>document.fonts.ready);
    await pg.screenshot({path:path.join(OUT,n+'.png')});await pg.close();}
  await br.close();
}
module.exports={ic,logo,banner,footer,render,G,GL};
