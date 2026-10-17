/* ---------- UI ---------- */
const SCREENS=['load','home','panel','cards','pause','over','adwait'];
function show(id){for(const s of SCREENS)$(s).classList.toggle('on',s===id||(id==='panel'&&s==='home'))}
const img=(k,cls)=>'<img class="'+(cls||'ic')+'" src="'+iconURL(k)+'" alt="">';
const pips=(cur,max,nxt)=>{let h='<div class="pips">';for(let i=0;i<max;i++)h+='<i class="pip'+(i<cur?' on':(nxt&&i===cur?' new':''))+'"></i>';return h+'</div>'};
function buildLogo(el){el.innerHTML='';'HORRORZ'.split('').forEach((ch,i)=>{const s=document.createElement('span');s.textContent=ch;if(i===4)s.className='o';if(i===6)s.className='z';el.appendChild(s)})}
function detectLang(){let l=null;try{if(window.PokiSDK&&PokiSDK.getLanguage)l=PokiSDK.getLanguage()}catch(e){}if(!l)l=navigator.language||'en';l=String(l).slice(0,2).toLowerCase();return LANGS.includes(l)?l:'en'}
function toast(icon,title,text){const d=document.createElement('div');d.className='toast';d.innerHTML=img(icon,'')+'<div><b>'+title+'</b><span>'+text+'</span></div>';$('toasts').appendChild(d);setTimeout(()=>d.remove(),3500)}
function missionText(m){return t('ms_'+m.id,{n:m.n})}
function missionReadyFx(m){toast('scroll',t('missions'),missionText(m))}

/* ---- home ---- */
function goHome(){
  state='home';gpStop();MUS.mode='calm';trans=null;banner=null;hint=null;
  setupDemo(S.selCh);buildHome();show('home');
}
function buildHome(){
  $('hCandy').textContent=S.candy;
  const ch=S.selCh,locked=ch>=S.unlocked;
  let info;
  if(locked)info=img('lock')+' '+t('locked');
  else if(S.clear[ch])info='<span class="crown">'+img('crown')+' '+t('cleared')+'</span> · '+t('best',{n:S.best[ch]});
  else if(S.best[ch])info=t('best',{n:S.best[ch]});else info=t('newCh');
  $('chapCard').className='chapCard'+(locked?' locked':'');
  $('chapCard').innerHTML='<div class="cn">'+t('chapter',{n:ch+1})+'</div><div class="cname">'+t('ch'+ch)+'</div><div class="cinfo">'+info+'</div>';
  $('chPrev').disabled=ch<=0;$('chNext').disabled=ch>=4;
  $('playBtn').textContent=t('play');$('playBtn').disabled=locked;$('playBtn').classList.toggle('pulse',!locked);
  const nOk=!!S.clear[0];$('nightBtn').disabled=!nOk;
  $('nightBtn').textContent=nOk?t('nightmare')+(S.nightBest?' · '+t('nightBest',{n:S.nightBest}):''):t('nightLocked');
  const canShop=SHOP.some(it=>S.shop[it.id]<it.max&&S.candy>=it.cost[S.shop[it.id]]);
  const items=[['shop','cart',t('upgrades'),canShop?'!':''],['wardrobe','shirt',t('wardrobe'),''],['missions','scroll',t('missions'),missionsClaimable()||''],['gift','gift',t('gift'),giftReady()?'!':''],['trophies','trophy',t('trophies'),''],['book','book',t('ghostbook'),'']];
  $('nav').innerHTML=items.map(([id,ic,lb,b])=>'<button class="nb" data-p="'+id+'">'+img(ic,'')+'<span>'+lb+'</span>'+(b?'<span class="badge">'+b+'</span>':'')+'</button>').join('');
  $('nav').querySelectorAll('.nb').forEach(b=>b.onclick=()=>{SFX.click();openPanel(b.dataset.p)});
  $('ver').textContent='v'+VERSION;
}
function changeCh(d){const n=clamp(S.selCh+d,0,4);if(n===S.selCh)return;S.selCh=n;save();SFX.click();setupDemo(n);buildHome()}

/* ---- panels ---- */
let panelKind=null;
function openPanel(kind){panelKind=kind;renderPanel();show('panel')}
function closePanel(){panelKind=null;buildHome();show('home')}
function candyLine(){return '<div class="sec" style="display:flex;justify-content:space-between"><span></span><span style="color:#ffcf3a;font-size:18px">'+img('candy')+' '+S.candy+'</span></div>'}
function renderPanel(){
  const b=$('pBody');let h='';
  switch(panelKind){
    case 'shop':$('pTitle').textContent=t('upgrades');h=candyLine();
      for(const it of SHOP){const lv=S.shop[it.id],mx=lv>=it.max,cost=mx?0:it.cost[lv];
        h+='<div class="row">'+img(it.icon,'ri')+'<div class="rt"><div class="rn">'+t('sh_'+it.id)+'</div><div class="rd">'+t('shd_'+it.id)+'</div>'+pips(lv,it.max)+'</div>'+
          (mx?'<button class="btn small ghost" disabled>'+t('max')+'</button>':'<button class="btn small" data-buy="'+it.id+'"'+(S.candy<cost?' disabled':'')+'>'+img('candy')+' '+cost+'</button>')+'</div>'}
      break;
    case 'wardrobe':$('pTitle').textContent=t('wardrobe');h=candyLine()+'<div class="sec">'+t('costumes')+'</div><div class="grid">';
      for(const sk of SKINS){const own=skinOwned(sk),sel=S.skin===sk.id;let st;
        if(sel)st=t('equipped');else if(own)st=t('equip');else if(sk.cost)st=img('candy')+' '+sk.cost;else if(sk.tr)st=t('viaTrophy',{t:t('tr_'+sk.tr)});else st=t('viaGift');
        h+='<div class="tile'+(sel?' sel':'')+(own?'':' lock')+'" data-skin="'+sk.id+'">'+img('sk_'+sk.id,'')+'<div class="tn">'+t('sk_'+sk.id)+'</div><div class="ts">'+st+'</div></div>'}
      h+='</div><div class="sec">'+t('beams')+'</div><div class="grid">';
      for(const bm of BEAMS){const own=beamOwned(bm),sel=S.beam===bm.id;let st;
        if(sel)st=t('inUse');else if(own)st=t('use');else if(bm.cost)st=img('candy')+' '+bm.cost;else st=t('viaTrophy',{t:t('tr_'+bm.tr)});
        h+='<div class="tile'+(sel?' sel':'')+(own?'':' lock')+'" data-beam="'+bm.id+'">'+img('bm_'+bm.id,'')+'<div class="tn">'+t('bm_'+bm.id)+'</div><div class="ts">'+st+'</div></div>'}
      h+='</div>';break;
    case 'missions':{ensureDaily();$('pTitle').textContent=t('missions');h='<div class="sec">'+t('missionsNew')+'</div>';
      for(let i=0;i<S.daily.list.length;i++){const m=S.daily.list[i],p=Math.min(m.p,m.n),done=m.p>=m.n;
        h+='<div class="row'+(m.c?' done':'')+'">'+img('scroll','ri')+'<div class="rt"><div class="rn">'+missionText(m)+'</div><div class="rd">'+p+' / '+m.n+' · '+img('candy')+' '+m.rw+'</div><div class="bar"><i style="width:'+(p/m.n*100)+'%"></i></div></div>'+
          (m.c?'<button class="btn small ghost" disabled>'+t('claimed')+'</button>':'<button class="btn small mint" data-claim="'+i+'"'+(done?'':' disabled')+'>'+t('claim')+'</button>')+'</div>'}
      const all=S.daily.list.every(m=>m.c);
      h+='<div class="row'+(S.daily.bonus?' done':'')+'">'+img('chest','ri')+'<div class="rt"><div class="rn">'+t('missionsAll')+'</div></div>'+(S.daily.bonus?'<button class="btn small ghost" disabled>'+t('claimed')+'</button>':'<button class="btn small mint" data-bonus="1"'+(all?'':' disabled')+'>'+t('claim')+'</button>')+'</div>';break}
    case 'gift':{$('pTitle').textContent=t('gift');const idx=S.gift.n%7,ready=giftReady();h='<div class="days">';
      for(let i=0;i<7;i++){const g=GIFTS[i];const got=i<idx||(i===idx&&!ready);h+='<div class="day'+(got?' got':'')+(i===idx&&ready?' now':'')+'">'+t('day',{n:i+1})+(typeof g==='number'?img('candy','')+g:img('sk_skelly',''))+'</div>'}
      h+='</div><div style="text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center">'+(ready?'<button class="btn big" data-gift="1">'+img('gift')+' '+t('giftClaim')+'</button>':'<div class="rn">'+t('giftDone')+'</div>')+'<div class="rd" style="color:#a99cc9;font-size:13px">'+t('giftNote')+'</div></div>';break}
    case 'trophies':{$('pTitle').textContent=t('trophies')+' ('+Object.keys(S.trophies).length+'/'+TROPHIES.length+')';
      for(const tr of TROPHIES){const ok=!!S.trophies[tr.id];h+='<div class="row'+(ok?'':' done')+'">'+img(ok?'trophy':'lock','ri')+'<div class="rt"><div class="rn">'+t('tr_'+tr.id)+'</div><div class="rd">'+t('trd_'+tr.id)+'</div></div></div>'}break}
    case 'book':{$('pTitle').textContent=t('ghostbook');h='<div class="grid">';
      for(const tp of BOOK){const seen=!!S.seen[tp]||!!S.popped[tp];h+='<div class="tile'+(seen?'':' lock')+'">'+img(seen?'gh_'+tp:'ghx_'+tp,'')+'<div class="tn">'+(seen?t('gh_'+tp):t('unknown'))+'</div><div class="ts">'+(seen?t('ghd_'+tp)+'<br><b>'+t('popped',{n:S.popped[tp]||0})+'</b>':'')+'</div></div>'}
      h+='</div><div class="sec" style="text-align:center">'+t('bosses',{n:S.st.bosses})+'</div>';break}
    case 'settings':{$('pTitle').textContent=t('settings');
      h='<div class="setrow"><button class="btn ghost small" data-tog="muted">'+t('sound')+': '+(S.muted?t('off'):t('on'))+'</button><button class="btn ghost small" data-tog="music">'+t('music')+': '+(S.music?t('on'):t('off'))+'</button><button class="btn ghost small" data-tog="shake">'+t('shake')+': '+(S.shake?t('on'):t('off'))+'</button></div>';
      h+='<div class="sec">'+t('language')+'</div><div class="langs">'+LANGS.map((l,i)=>'<button class="btn ghost small'+(i===LI?' sel':'')+'" data-lang="'+l+'">'+LANG_NAMES[i]+'</button>').join('')+'</div>';
      h+='<div class="sec" style="margin-top:18px;opacity:.5">Horrorz v'+VERSION+'</div>';break}
  }
  b.innerHTML=h;
  b.querySelectorAll('[data-buy]').forEach(el=>el.onclick=()=>{const it=SHOP.find(x=>x.id===el.dataset.buy),lv=S.shop[it.id],cost=it.cost[lv];if(lv>=it.max||S.candy<cost)return;S.candy-=cost;S.shop[it.id]++;save();SFX.coin();renderPanel()});
  b.querySelectorAll('[data-skin]').forEach(el=>el.onclick=()=>{const sk=SKIN[el.dataset.skin];if(skinOwned(sk)){S.skin=sk.id;SFX.click()}else if(sk.cost&&S.candy>=sk.cost){S.candy-=sk.cost;S.skins.push(sk.id);S.skin=sk.id;SFX.coin()}else return;save();renderPanel()});
  b.querySelectorAll('[data-beam]').forEach(el=>el.onclick=()=>{const bm=BEAMS.find(x=>x.id===el.dataset.beam);if(beamOwned(bm)){S.beam=bm.id;SFX.click()}else if(bm.cost&&S.candy>=bm.cost){S.candy-=bm.cost;S.beams.push(bm.id);S.beam=bm.id;SFX.coin()}else return;save();renderPanel()});
  b.querySelectorAll('[data-claim]').forEach(el=>el.onclick=()=>{const m=S.daily.list[+el.dataset.claim];if(m.c||m.p<m.n)return;m.c=true;addCandy(m.rw);SFX.coin();save();renderPanel()});
  b.querySelectorAll('[data-bonus]').forEach(el=>el.onclick=()=>{if(S.daily.bonus)return;S.daily.bonus=true;addCandy(60);SFX.jackpot();save();renderPanel()});
  b.querySelectorAll('[data-gift]').forEach(el=>el.onclick=()=>{if(!giftReady())return;const g=GIFTS[S.gift.n%7];
    if(typeof g==='number'){addCandy(g);toast('gift',t('gift'),t('gotCandy',{n:g}))}else{if(!S.skins.includes(g)){S.skins.push(g);toast('sk_'+g,t('newSkin'),t('sk_'+g))}else{addCandy(150);toast('gift',t('gift'),t('gotCandy',{n:150}))}}
    S.gift.n++;S.gift.last=todayKey();SFX.jackpot();save();renderPanel()});
  b.querySelectorAll('[data-tog]').forEach(el=>el.onclick=()=>{const k2=el.dataset.tog;S[k2]=!S[k2];save();applyVolume();updMuteBtn();renderPanel()});
  b.querySelectorAll('[data-lang]').forEach(el=>el.onclick=()=>{S.lang=el.dataset.lang;setLang(S.lang);save();applyTexts();renderPanel()});
}
function addCandy(n){S.candy+=n;S.total+=n;checkTrophies()}

/* ---- level-up cards ---- */
let cardList=[],cardsAt=0;
function rollCards(boost){
  const avail=AB.filter(a=>(R.ab[a.id]||0)<a.max&&!(a.id==='angel'&&R.angelUsed));const out=[];
  for(let i=0;i<3;i++){
    const rar=wpick([[0,64-boost*40],[1,29+boost*25],[2,7+boost*15+L('lucky')*2]]);
    let c=avail.filter(a=>a.r===rar&&!out.includes(a));if(!c.length)c=avail.filter(a=>!out.includes(a));
    out.push(c.length?pick(c):SNACK)}
  return out}
function openCards(){
  state='cards';R.pendingCards=Math.max(0,R.pendingCards-1);R.cardTitle=R.cardBoost>0?'pickPower':'levelUp';
  cardList=rollCards(R.cardBoost);R.cardBoost=0;renderCards();show('cards');SFX.card();cardsAt=performance.now();
  stick.on=false;for(const kk in KEY)KEY[kk]=false;
}
function openShrine(){
  state='cards';R.cardTitle='shrineTitle';const o=['power','heal','candy','luck'].filter(x=>!(x==='power'&&P.hearts<=1)&&!(x==='heal'&&P.hearts>=P.maxH));
  o.sort(()=>Math.random()-.5);cardList=o.slice(0,3).map(id=>({id,r:id==='power'?2:1,offer:true}));renderCards();show('cards');SFX.chime();cardsAt=performance.now();stick.on=false;for(const kk in KEY)KEY[kk]=false;
}
function renderCards(){
  $('cTitle').textContent=t(R.cardTitle);
  const offer=cardList.length&&cardList[0].offer;$('rerollBtn').style.display=offer?'none':'';
  if(offer){$('cardRow').innerHTML=cardList.map((a,i)=>'<div class="card r'+a.r+' offer" data-i="'+i+'"><span class="ck">'+(i+1)+'</span>'+img('of_'+a.id,'')+'<div class="cnm">'+t('of_'+a.id)+'</div><div class="cd">'+t('ofd_'+a.id)+'</div></div>').join('');
    $('cardRow').querySelectorAll('.card').forEach(el=>el.onclick=()=>pickCard(+el.dataset.i));$('adRerollBtn').style.display='none';return}
  $('cardRow').innerHTML=cardList.map((a,i)=>{const cur=R.ab[a.id]||0;return '<div class="card r'+a.r+'" data-i="'+i+'"><span class="ck">'+(i+1)+'</span>'+img(a.id,'')+'<div class="cr">'+t('rar'+a.r)+'</div><div class="cnm">'+t('ab_'+a.id)+'</div><div class="cd">'+t('abd_'+a.id)+'</div>'+(a.max<99&&a.max>1?pips(cur,a.max,true):'')+'</div>'}).join('');
  $('cardRow').querySelectorAll('.card').forEach(el=>el.onclick=()=>pickCard(+el.dataset.i));
  $('rerollBtn').innerHTML=img('reroll')+' '+t('reroll',{n:R.rerolls});$('rerollBtn').disabled=R.rerolls<=0;
  $('adRerollBtn').style.display=R.adReroll?'':'none';$('adRerollBtn').innerHTML=img('reroll')+' '+t('adReroll')+'<span class="ad">&#9654;</span>';
}
function pickCard(i){
  if(state!=='cards'||performance.now()-cardsAt<280)return;const a=cardList[i];if(!a)return;
  if(a.offer){SFX.pick();BURSTS.push({x:P.x,y:P.y,r:200,t:0,dur:.6,col:'255,210,150'});
    if(a.id==='power'){P.hearts=Math.max(1,P.hearts-1);flash(160,20,30,.3);R.pendingCards++;R.cardBoost=1}
    else if(a.id==='heal'){P.hearts=P.maxH}
    else if(a.id==='candy'){const n=14+R.room*2;for(let j=0;j<n;j++)addDrop(j%4?'candy':'big',room.altar.x,room.altar.y,j%4?2:5)}
    else if(a.id==='luck'){R.rerolls+=2}
    state='run';show(null);roomCleared();if(R.pendingCards>0)R.wantCards=true;return}
  if(a.id==='snack'){R.candy+=25;P.hearts=Math.min(P.maxH,P.hearts+1)}
  else{R.ab[a.id]=(R.ab[a.id]||0)+1;if(a.r>=1)mProg('cards',1);if(R.ab[a.id]>=a.max&&a.max>1)S.st.maxed=1;calcStats();if(a.id==='heart')P.hearts=Math.min(P.maxH,P.hearts+1)}
  SFX.pick();BURSTS.push({x:P.x,y:P.y,r:160,t:0,dur:.5,col:a.r===2?'200,120,255':a.r===1?'90,200,255':'255,240,190'});
  if(R.pendingCards>0){openCards();return}
  state='run';show(null);
}

/* ---- pause ---- */
function pauseGame(){if(state!=='run')return;state='pause';gpStop();buildPause();show('pause')}
function resumeGame(){if(state!=='pause')return;state='run';show(null);gpStart();lastT=performance.now()}
function buildPause(){
  $('paTitle').textContent=t('paused');$('resumeBtn').textContent=t('resume');$('quitBtn').textContent=t('home');
  $('sndToggle').textContent=t('sound')+': '+(S.muted?t('off'):t('on'));$('musToggle').textContent=t('music')+': '+(S.music?t('on'):t('off'));
  $('pauseBuild').innerHTML=Object.keys(R.ab).map(id=>'<div class="bi">'+img(id,'')+t('ab_'+id)+' '+R.ab[id]+'</div>').join('');
}

/* ---- results ---- */
function bankCandy(){const b=Math.round(R.candy*P.candyMul);R.earned+=R.candy;R.candy=0;R.banked=(R.banked||0)+b;addCandy(b);return b}
function nextGoal(){const g=[];
  for(const it of SHOP){const lv=S.shop[it.id];if(lv<it.max)g.push([it.cost[lv],t('sh_'+it.id)])}
  for(const sk of SKINS)if(!skinOwned(sk)&&sk.cost)g.push([sk.cost,t('sk_'+sk.id)]);
  for(const bm of BEAMS)if(!beamOwned(bm)&&bm.cost)g.push([bm.cost,t('bm_'+bm.id)]);
  g.sort((a,b)=>a[0]-b[0]);return{afford:g.some(x=>x[0]<=S.candy),next:g.find(x=>x[0]>S.candy)}}
function showOver(win,firstClear){
  state='over';gpStop();trans=null;
  const gained=bankCandy();
  let bonus=0;if(win&&firstClear){bonus=50*(R.ch+1);addCandy(bonus);R.banked+=bonus}
  checkTrophies();save();
  const story=R.mode==='story';
  let near='';
  if(!win){
    if(story){const nb=R.room<=5?5:10,toB=nb-R.room;if(toB>0&&toB<=2)near=t('nearBoss',{n:toB});else if(10-R.room<=3)near=t('nearEnd',{n:10-R.room+1})}
    if(!near&&R.prevBest>R.room&&R.prevBest-R.room<=3)near=t('nearBest',{n:R.prevBest-R.room+1});
  }
  const rec=R.room>R.prevBest&&R.prevBest>0;
  const goal=nextGoal();
  let goalH='';
  if(goal.afford)goalH='<div class="goal rec">'+img('cart')+' '+t('canBuy')+'</div>';
  else if(goal.next)goalH='<div class="goal">'+t('toUnlock',{a:S.candy,b:goal.next[0],name:goal.next[1]})+'<div class="bar"><i style="width:'+(S.candy/goal.next[0]*100)+'%"></i></div></div>';
  const mDone=S.daily.list.filter(m=>m.p>=m.n&&!m.c).length;
  const box=$('overBox');
  box.innerHTML=
    '<div class="sub">'+(story?t('chapter',{n:R.ch+1})+' · '+t('ch'+R.ch):t('nightmare'))+'</div>'+
    '<h2>'+(win?t('chClear'):t('fainted'))+'</h2>'+
    '<div class="big">'+(story?t('roomOf',{n:R.room,m:10}):t('reachedNight',{n:R.room}))+'</div>'+
    (rec?'<div class="rec">'+img('star')+' '+t('newRecord')+'</div>':'')+(near?'<div class="near">'+near+'</div>':'')+
    (win&&firstClear&&R.ch<4?'<div class="rec">'+t('unlockCh')+'</div>':'')+
    '<div class="stats"><div class="st">'+t('pops')+'<b>'+R.pops+'</b></div><div class="st">'+t('bestCombo')+'<b>×'+R.maxCombo+'</b></div><div class="st">'+t('level')+'<b>'+R.lvl+'</b></div></div>'+
    '<div class="sub">'+t('candyEarned')+'</div><div class="earn">'+img('candy')+' <span id="earnN">0</span></div>'+
    (P.candyMul>1.001?'<div class="sub" style="font-size:11px">'+t('bonusPct',{n:Math.round((P.candyMul-1)*100)})+'</div>':'')+
    goalH+(mDone?'<div class="goal rec">'+img('scroll')+' '+t('missionsReady',{n:mDone})+'</div>':'')+
    '<div class="btns">'+
      '<div class="crow">'+(!win&&!R.revived?'<button class="btn mint" id="revBtn">'+t('revive')+'<span class="ad">&#9654;</span></button>':'')+
      (!R.doubled&&R.banked>0?'<button class="btn ghost" id="dblBtn">'+t('double')+'<span class="ad">&#9654;</span></button>':'')+'</div>'+
      '<button class="btn big pulse" id="overMain">'+(win&&R.ch<4&&R.mode==='story'?t('next'):t('again'))+'</button>'+
      '<button class="btn ghost small" id="overHome">'+t('home')+'</button>'+
    '</div>';
  show('over');
  countUp($('earnN'),R.banked);
  const rv=$('revBtn');if(rv)rv.onclick=()=>{rv.disabled=true;rewarded().then(ok=>{if(!ok){toast('heart',t('revive'),t('noAd'));rv.disabled=false;return}
    R.revived=true;P.hearts=P.maxH;P.inv=2.5;slowT=0;freezeT=0;state='run';show(null);scareAll(320,1);gpStart();lastT=performance.now()})};
  const db=$('dblBtn');if(db)db.onclick=()=>{db.disabled=true;rewarded().then(ok=>{if(!ok){toast('candy',t('double'),t('noAd'));db.disabled=false;return}
    R.doubled=true;addCandy(R.banked);R.banked*=2;save();SFX.jackpot();countUp($('earnN'),R.banked);db.remove()})};
  $('overMain').onclick=()=>{if(win&&R.ch<4&&R.mode==='story'){S.selCh=R.ch+1;save();startFlow('story',R.ch+1)}else startFlow(R.mode,R.ch)};
  $('overHome').onclick=()=>{SFX.click();goHome()};
}
function countUp(el,to){if(!el)return;const from=+el.textContent||0,t0=performance.now();const step=()=>{const p=Math.min(1,(performance.now()-t0)/700);el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};step()}

/* ---- run start ---- */
function startFlow(mode,ch,skipAd){
  initAudio();state='ad';show('adwait');
  const pb=mode==='story'?S.best[ch]:S.nightBest;
  const go=()=>{demo=null;startRun(mode,ch);R.prevBest=pb;state='run';show(null);if(acted)gpStart();else pendingGp=true;lastT=performance.now()};
  if(skipAd)go();else commercial().then(go);
}

/* ---- texts & buttons ---- */
function updMuteBtn(){$('muteBtn').innerHTML='<span style="opacity:'+(S.muted?.35:1)+'">&#9835;</span>'}
function applyTexts(){buildHome();updMuteBtn();if(state==='pause')buildPause()}
function bindUI(){
  $('playBtn').onclick=()=>{if(S.selCh<S.unlocked){SFX.click();startFlow('story',S.selCh)}};
  $('nightBtn').onclick=()=>{if(S.clear[0]){SFX.click();startFlow('night',0)}};
  $('chPrev').onclick=()=>changeCh(-1);$('chNext').onclick=()=>changeCh(1);
  $('setBtn').onclick=()=>{SFX.click();openPanel('settings')};
  $('pClose').onclick=()=>{SFX.click();closePanel()};
  $('panel').addEventListener('pointerdown',e=>{if(e.target===$('panel'))closePanel()});
  $('pauseBtn').onclick=()=>pauseGame();
  $('muteBtn').onclick=()=>{initAudio();S.muted=!S.muted;save();applyVolume();updMuteBtn()};
  $('resumeBtn').onclick=()=>resumeGame();
  $('quitBtn').onclick=()=>{bankCandy();save();goHome()};
  $('sndToggle').onclick=()=>{S.muted=!S.muted;save();applyVolume();updMuteBtn();buildPause()};
  $('musToggle').onclick=()=>{S.music=!S.music;save();applyVolume();buildPause()};
  $('rerollBtn').onclick=()=>{if(R.rerolls<=0)return;R.rerolls--;cardList=rollCards(0);SFX.card();renderCards();cardsAt=performance.now()-200};
  $('adRerollBtn').onclick=()=>{if(!R.adReroll)return;$('adRerollBtn').disabled=true;rewarded().then(ok=>{$('adRerollBtn').disabled=false;if(!ok){toast('reroll',t('adReroll'),t('noAd'));return}R.adReroll=false;cardList=rollCards(.3);SFX.card();renderCards();cardsAt=performance.now()-200})};
  document.querySelectorAll('img[data-icon]').forEach(el=>el.src=iconURL(el.dataset.icon));
}

/* ---- input ---- */
let acted=false,pendingGp=false;
function userActed(){acted=true;if(pendingGp&&state==='run'){pendingGp=false;gpStart()}}
addEventListener('keydown',e=>{
  initAudio();userActed();KEY[e.code]=true;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(state==='run'){if(!e.repeat&&['Space','ShiftLeft','ShiftRight','KeyK','KeyJ'].includes(e.code))wantDash=true;if(e.code==='Escape'||e.code==='KeyP')pauseGame()}
  else if(state==='cards'){const n={Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2}[e.code];if(n!=null)pickCard(n);if(e.code==='KeyR')$('rerollBtn').click()}
  else if(state==='pause'){if(e.code==='Escape'||e.code==='KeyP')resumeGame()}
  else if(state==='home'){if(e.code==='Enter'&&!panelKind)$('playBtn').click();if(e.code==='Escape'&&panelKind)closePanel();if(!panelKind&&e.code==='ArrowLeft')changeCh(-1);if(!panelKind&&e.code==='ArrowRight')changeCh(1)}
  else if(state==='over'){if(e.code==='Enter'&&$('overMain'))$('overMain').click()}
});
addEventListener('keyup',e=>{KEY[e.code]=false});
function releaseAll(){for(const kk in KEY)KEY[kk]=false;stick.on=false;stick.dx=stick.dy=0}
addEventListener('blur',()=>{releaseAll();if(state==='run')pauseGame()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();if(state==='run')pauseGame()}});
cv.addEventListener('pointerdown',e=>{
  initAudio();userActed();
  if(e.pointerType==='touch'||e.pointerType==='pen'){touchMode=true;if(state!=='run')return;e.preventDefault();
    const db=dashBtn();if(Math.hypot(e.clientX-db.x,e.clientY-db.y)<db.r+16){wantDash=true;return}
    if(!stick.on){stick.on=true;stick.id=e.pointerId;stick.ox=e.clientX;stick.oy=e.clientY;stick.dx=stick.dy=0}else wantDash=true}
  else{touchMode=false;mouse.x=e.clientX;mouse.y=e.clientY;mouse.last=performance.now();if(state==='run')wantDash=true}
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.pointerType==='pen'){if(stick.on&&e.pointerId===stick.id){let dx=e.clientX-stick.ox,dy=e.clientY-stick.oy;const d=Math.hypot(dx,dy),R0=56;
    if(d>R0+20){stick.ox=e.clientX-dx/d*(R0+20);stick.oy=e.clientY-dy/d*(R0+20);dx=e.clientX-stick.ox;dy=e.clientY-stick.oy}
    const m=Math.min(1,Math.hypot(dx,dy)/R0),a=Math.atan2(dy,dx);stick.dx=m<.12?0:Math.cos(a)*m;stick.dy=m<.12?0:Math.sin(a)*m}}
  else{mouse.x=e.clientX;mouse.y=e.clientY;mouse.last=performance.now();touchMode=false}
});
const endPtr=e=>{if(stick.on&&e.pointerId===stick.id){stick.on=false;stick.dx=stick.dy=0}};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('resize',()=>{resize();if(room)room.cv=null});
addEventListener('wheel',e=>{if(state==='run')e.preventDefault()},{passive:false});

/* ---- main loop ---- */
let lastT=0,hudOn=null,perfT=0,perfN=0;
function frame(ts){
  const raw=Math.max(0,(ts-lastT)/1000)||0;const dt=Math.min(.05,raw);lastT=ts;
  if(!window.LOWQ&&(state==='run'||state==='home')&&raw<.5){perfT+=raw;perfN++;if(perfT>4){if(perfT/perfN>.034){window.LOWQ=true;resize();if(room)room.cv=null}perfT=0;perfN=0}}
  if(!inAd){
    if(state==='run'){
      if(trans){trans.t+=dt;if(!trans.fired&&trans.t>=trans.dur/2){trans.fired=true;trans.mid()}if(trans.t>=trans.dur)trans=null}
      else update(dt);
    }else if(state==='dying'){update(dt);R.deathT-=dt;if(R.deathT<=0)showOver(false)}
    else if(state==='home'&&demo)updDemo(dt);
  }
  const want=state==='run'||state==='dying';if(want!==hudOn){hudOn=want;$('hudBtns').classList.toggle('on',want)}
  render(dt);musicTick();
  requestAnimationFrame(frame);
}

/* ---- boot ---- */
function thumbSetup(){
  document.body.classList.add('thumb');setupDemo(0);state='home';show('home');
  P.x=430;P.y=430;demo.t=0;k=W/640;camX=560;camY=300;
  G=[];const tps=['sheet','wisp','flitter','pumpkin','wisp','sheet'];const pos=[[650,330],[730,390],[600,250],[800,260],[420,250],[330,330]];
  tps.forEach((tp,i)=>{const g=mkGhost(tp,pos[i][0],pos[i][1],{spawnT:0});g.alpha=1;g.hp=1e9;g.spd=0;g.wa=0;g.fear=i<2?g.hp*.5:0;G.push(g)});
  updDemo=function(dt){gtime+=dt;camX=560;camY=300;P.aim=Math.atan2(340-P.y,690-P.x);R={beams:[{a:P.aim,len:330,ang:.36,dps:0,main:true}],ab:{},combo:0,lamp:1,drain:0};
    for(const g of G){g.lit=!!inBeam(R.beams[0],g.x,g.y,g.r)}};
  for(let i=0;i<14;i++)DROPS.push({kind:i%4?'candy':'big',x:690+rand(-60,60),y:360+rand(-40,50),vx:0,vy:0,z:rand(0,30),vz:0,val:1,t:0,mag:false,col:pick(CANDYCOLS),rot:rand(0,6)});
  BURSTS.push({x:700,y:340,r:180,t:.05,dur:9e9,col:'160,240,255'});sparks(700,340,'#9ff3ff',30,260);for(const f of FX)f.dur=9e9;
}
function boot(){
  loadSave();setLang(S.lang||detectLang());resize();
  buildLogo($('logo'));buildLogo($('logoL'));bindUI();updMuteBtn();
  $('lfill').style.width='55%';
  if(TEST)window.T={get R(){return R},openShrine,get P(){return P},get G(){return G},get state(){return state},get room(){return room},get S(){return S},startFlow,pickCard,goHome,openPanel,showOver,update,hurtPlayer,popGhost,setSkip:v=>{window.__skip=v}};
  Promise.resolve(window.__pokiReady).catch(()=>{}).then(()=>{if(window.PokiSDK)SDK=window.PokiSDK;return SDK.init()}).catch(()=>{}).then(()=>{
    if(!S.lang){setLang(detectLang())}
    $('lfill').style.width='100%';try{SDK.gameLoadingFinished()}catch(e){}
    ensureDaily();checkTrophies();
    if(!THUMB){let ci=0;const warm=()=>{if(ci>=5)return;if(state!=='home'){setTimeout(warm,1500);return}const c2=CH[ci++];try{floorTex(c2.floor);wallTex(c2.wallf,c2);capTex(c2)}catch(e){}setTimeout(warm,250)};setTimeout(warm,1200)}
    requestAnimationFrame(t0=>{lastT=t0;requestAnimationFrame(frame)});
    console.log('Horrorz v'+VERSION);
    if(THUMB){thumbSetup();return}
    if(S.first){S.first=false;save();startFlow('story',0,true)}else goHome();
  });
}
boot();
