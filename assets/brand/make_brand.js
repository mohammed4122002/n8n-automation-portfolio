// يولّد صور README: banner.png و stats.png و footer.png (تصميم V3 بصورة Mohammed Abu Saada)
// الاستخدام:
//   FONTS_DIR=<node_modules/@fontsource/> ICONS_DIR=<node_modules/> AVATAR=<avatar.jpg> PORTRAIT=<portrait.jpg> \
//   NODE_PATH=<مسار playwright> node assets/brand/make_brand.js
const {ic,logo,banner,footer,render,GL}=require('./brandkit.js');
const chip=(i,t)=>`<span class="chip">${ic(i,26,'gold','fill')}${t}</span>`;
const pages={
 banner:[1280,640,banner({
  titleTop:`<span style="color:#C9A24B">n8n</span>`, titleBottom:'Automation Portfolio',
  sub:'أتمتة عملية، <mark>خطوة بخطوة</mark> · 30 workflow جاهز',
  chips:chip('robot','AI Agents')+chip('magnifying-glass','RAG')+chip('lightning','Automation'),
  hub:logo('n8n',70), orbitLogos:['gmail','googlesheets','telegram','googledrive','googlegemini'], bignum:'30'})],
 stats:[1280,300,`<div dir="rtl" style="position:absolute;inset:0;padding:36px 44px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">
${[['30','مشروع جاهز','stack'],['10+','خدمة متصلة','plugs-connected'],['AI','OpenAI · Gemini','brain'],['1-Click','استيراد وتشغيل','cursor-click']].map(([n,t,icn],i)=>{const gold=i%2==1;
return `<div style="border-radius:26px;padding:24px 26px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;
${gold?'background:linear-gradient(150deg,#F6DE9C 0%,#E8C066 45%,#D4AE57 100%);color:#111;border:1px solid rgba(255,255,255,.6)':'background:linear-gradient(150deg,#363636 0%,#1c1c1c 60%,#111 100%);color:#fff;border:1px solid rgba(232,192,102,.3)'};box-shadow:0 18px 40px rgba(30,22,5,.28)">
<div class="mini" style="width:74px;height:74px;border-radius:22px;display:flex;align-items:center;justify-content:center">${ic(icn,42)}</div>
<div><div style="font-weight:800;font-size:60px;line-height:1.05;direction:ltr;text-align:right;${gold?'':`color:${GL}`}">${n}</div><div style="font-weight:800;font-size:24px;margin-top:4px">${t}</div></div></div>`}).join('')}</div>`],
 footer:[1280,220,footer()]};
render(pages,__dirname);
