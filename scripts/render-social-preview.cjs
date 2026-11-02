// Render actual game drawing functions to code-native SVG paths (no game loop,
// network, simulated scores or third-party art). Introduction, not a screenshot.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ja=JSON.parse(fs.readFileSync(path.join(root,'locales/ja.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
class SvgContext{
 constructor(){this.nodes=[];this.stack=[];this.transform='';this.fillStyle='#000';this.strokeStyle='#000';this.lineWidth=1;this.lineJoin='miter';this.globalAlpha=1;this.shape='';}
 save(){this.stack.push(Object.fromEntries(['transform','fillStyle','strokeStyle','lineWidth','lineJoin','globalAlpha'].map(k=>[k,this[k]])));}
 restore(){Object.assign(this,this.stack.pop());}translate(x,y){this.transform+=` translate(${x} ${y})`;}scale(x,y){this.transform+=` scale(${x} ${y})`;}
 beginPath(){this.shape='';}moveTo(x,y){this.shape+=`M${x} ${y} `;}lineTo(x,y){this.shape+=`L${x} ${y} `;}bezierCurveTo(a,b,c,d,e,f){this.shape+=`C${a} ${b} ${c} ${d} ${e} ${f} `;}closePath(){this.shape+='Z ';}
 ellipse(x,y,rx,ry,rotation,start,end){assert.equal(start,0);assert.equal(end,Math.PI*2);const dx=rx*Math.cos(rotation),dy=rx*Math.sin(rotation);this.shape=`M${x-dx} ${y-dy} A${rx} ${ry} ${rotation*180/Math.PI} 1 0 ${x+dx} ${y+dy} A${rx} ${ry} ${rotation*180/Math.PI} 1 0 ${x-dx} ${y-dy} Z`;}
 arc(x,y,r,start,end){this.ellipse(x,y,r,r,0,start,end);}
 paint(stroke){this.nodes.push(`<path d="${this.shape}" transform="${this.transform}" fill="${stroke?'none':esc(this.fillStyle)}" stroke="${stroke?esc(this.strokeStyle):'none'}" stroke-width="${this.lineWidth}" stroke-linejoin="${this.lineJoin}" opacity="${this.globalAlpha}"/>`);}
 fill(){this.paint(false);}stroke(){this.paint(true);}
}
const names=['drawSmallEnemy','drawLargeEnemy','drawChestnutLoot','drawPlayer'],source=names.map(name=>{const match=html.match(new RegExp('    function '+name+'\\([^]*?^    \\}','m'));assert.ok(match,name+' drawing source');return match[0];}).join('\n');
const context=vm.createContext({Math,gameTime:1,player:{x:0,y:0,invincibleUntil:0},visualRandom:()=>.5});vm.runInContext(source,context);
function sprite(name,x,y,scale,type){const ctx=new SvgContext();ctx.translate(x,y);ctx.scale(scale,scale);if(name==='drawPlayer')context[name](ctx);else context[name](ctx,0,0,type);assert.equal(ctx.stack.length,0);return ctx.nodes.join('');}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0c0822"/><stop offset=".45" stop-color="#241338"/><stop offset=".72" stop-color="#4a2438"/><stop offset=".9" stop-color="#7a3c26"/><stop offset="1" stop-color="#9c5530"/></linearGradient></defs><rect width="1200" height="630" fill="#100c22"/><g font-family="Noto Sans CJK JP, sans-serif"><text x="60" y="203" fill="#fff2bd" font-size="74" font-weight="900">'+esc(ja.gameTitle)+'</text><text x="64" y="272" fill="#ffffff" font-size="28">戦利品を集め、そのプレイで強くなる。</text><text x="64" y="323" fill="#d2c8e8" font-size="27">30ウェーブ突破を目指すシューティング</text><rect x="64" y="376" width="454" height="65" rx="15" fill="#322445" stroke="#ffe08a"/><text x="291" y="418" text-anchor="middle" fill="#ffe08a" font-size="25">倒す → 拾う → 機体を強化</text><rect x="620" y="40" width="520" height="550" rx="24" fill="url(#sky)" stroke="#79628c"/></g>';
for(const [x,y,s]of[[710,100,24],[1020,180,28],[735,385,25]])svg+=`<g fill="white" opacity=".06"><circle cx="${x}" cy="${y}" r="${s}"/><circle cx="${x+s}" cy="${y+s*.2}" r="${s*.8}"/><circle cx="${x-s}" cy="${y+s*.2}" r="${s*.8}"/></g>`;
svg+=sprite('drawLargeEnemy',880,138,1.8)+sprite('drawSmallEnemy',720,225,2.2)+sprite('drawSmallEnemy',1040,235,2.2)+sprite('drawChestnutLoot',770,335,1.6,'small')+sprite('drawChestnutLoot',980,355,1.6,'small')+sprite('drawPlayer',880,490,3);
for(const y of[410,370,330])svg+=`<rect x="876" y="${y}" width="8" height="19" rx="4" fill="rgba(255,210,60,.55)"/><rect x="878" y="${y+2}" width="4" height="15" rx="2" fill="white"/>`;
for(const [x,y]of[[730,295],[1018,305]])svg+=`<circle cx="${x}" cy="${y}" r="5" fill="#ff5a28" stroke="white"/>`;
svg+='</svg>\n';fs.writeFileSync(path.join(root,'assets/social-preview.svg'),svg);
