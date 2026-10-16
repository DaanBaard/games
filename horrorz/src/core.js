'use strict';
const VERSION='__VERSION__';
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist2=(ax,ay,bx,by)=>{const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy};
function angDiff(a,b){let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;else if(d<-Math.PI)d+=TAU;return d}
function wpick(list){let s=0;for(const e of list)s+=Math.max(0,e[1]);let r=Math.random()*s;for(const e of list){r-=Math.max(0,e[1]);if(r<=0)return e[0]}return list[list.length-1][0]}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function srng(seed){let s=(seed>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const TEST=/[?&]test=1/.test(location.search), THUMB=/[?&]thumb=1/.test(location.search);

/* ---------- Poki SDK (with offline fallback) ---------- */
const SDK_STUB={init:()=>Promise.resolve(),gameLoadingFinished(){},gameplayStart(){},gameplayStop(){},commercialBreak:()=>Promise.resolve(),rewardedBreak:()=>new Promise(r=>setTimeout(()=>r(true),500))};
let SDK=window.PokiSDK||SDK_STUB;
let gpOn=false,inAd=false,adMuted=false;
function gpStart(){if(!gpOn){gpOn=true;try{SDK.gameplayStart()}catch(e){}}}
function gpStop(){if(gpOn){gpOn=false;try{SDK.gameplayStop()}catch(e){}}}
function measure(c,w,a){try{if(window.PokiSDK&&PokiSDK.measure)PokiSDK.measure(c,w,a)}catch(e){}}
function setAdMute(b){adMuted=b;applyVolume()}
function commercial(){gpStop();inAd=true;setAdMute(true);let p;try{p=SDK.commercialBreak(()=>setAdMute(true))}catch(e){p=null}
  return Promise.resolve(p).catch(()=>{}).then(()=>{inAd=false;setAdMute(false)})}
function rewarded(){gpStop();inAd=true;setAdMute(true);let p;try{p=SDK.rewardedBreak({size:'medium',onStart:()=>setAdMute(true)})}catch(e){p=false}
  return Promise.resolve(p).catch(()=>false).then(ok=>{inAd=false;setAdMute(false);return !!ok})}

/* ---------- save ---------- */
const SAVE_KEY='horrorz_save_v1';
function defSave(){return{candy:0,total:0,first:true,muted:false,music:true,shake:true,lang:null,
  shop:{hearts:0,power:0,range:0,speed:0,bonus:0,magnet:0,reroll:0},
  skins:['lumi'],skin:'lumi',beams:['warm'],beam:'warm',
  best:[0,0,0,0,0],clear:[0,0,0,0,0],unlocked:1,nightBest:0,selCh:0,
  seen:{},popped:{},trophies:{},
  st:{pops:0,runs:0,golden:0,maxCombo:0,bosses:0,flawless:0,maxed:0},
  daily:{day:'',list:[],bonus:false},gift:{last:'',n:0},tut:0}}
let S=defSave();
function mergeSave(dst,src){for(const k in src){const v=src[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&dst[k]&&typeof dst[k]==='object'&&!Array.isArray(dst[k]))mergeSave(dst[k],v);else dst[k]=v}}
function loadSave(){if(THUMB)return;try{const raw=localStorage.getItem(SAVE_KEY);if(raw)mergeSave(S,JSON.parse(raw))}catch(e){}}
function save(){if(THUMB)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}

/* ---------- audio (all synthesised) ---------- */
let AC=null,master=null,sfxG=null,musG=null,noiseBuf=null,musDelay=null;
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume().catch(()=>{});return}
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain();master.connect(AC.destination);
    const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=5;comp.connect(master);
    sfxG=AC.createGain();sfxG.connect(comp);
    musG=AC.createGain();musG.connect(comp);
    musDelay=AC.createDelay(1);musDelay.delayTime.value=.34;const fb=AC.createGain();fb.gain.value=.32;const wet=AC.createGain();wet.gain.value=.35;
    musDelay.connect(fb);fb.connect(musDelay);musDelay.connect(wet);wet.connect(musG);
    noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    applyVolume();
  }catch(e){AC=null}
}
function applyVolume(){if(!AC)return;master.gain.value=adMuted?0:1;sfxG.gain.value=S.muted?0:.6;musG.gain.value=(S.muted||!S.music)?0:.3}
function osc(f,dur,type,vol,slide,t0,dest,delaySend){
  if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t0+dur);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.006);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);
  o.connect(g);g.connect(dest||sfxG);if(delaySend&&musDelay)g.connect(musDelay);o.start(t0);o.stop(t0+dur+.03)}
function tone(f,dur,type,vol,slide,delay){if(!AC||S.muted)return;osc(f,dur,type,vol,slide,AC.currentTime+(delay||0),sfxG)}
function noise(dur,vol,freq,ft,delay,dest){if(!AC||(S.muted&&dest!==musG))return;const t0=AC.currentTime+(delay||0);
  const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=ft||'lowpass';f.frequency.value=freq||1200;
  const g=AC.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t0);s.stop(t0+dur+.02)}
const lastSfx={};
function canPlay(k,ms){const n=performance.now();if(lastSfx[k]&&n-lastSfx[k]<ms)return false;lastSfx[k]=n;return true}
const ST=s=>Math.pow(2,s/12);
const SFX={
  pop(i){if(!canPlay('pop',25))return;const f=480*ST(Math.min(i||0,30)*.6);tone(f,.13,'triangle',.22,f*1.9);tone(f*2,.08,'sine',.1,f*3.2,.02);noise(.07,.1,3500,'highpass')},
  candy(i){if(!canPlay('candy',28))return;const f=990*ST([0,2,4,7,9,12,14,16,19,21,24][i%11]);tone(f,.1,'sine',.1,f*1.01)},
  soul(){if(!canPlay('soul',45))return;tone(1500,.05,'sine',.04,1900)},
  hurt(){tone(240,.28,'square',.14,80);noise(.22,.22,700)},
  dash(){noise(.16,.14,2000,'bandpass');tone(320,.12,'sine',.07,700)},
  level(){[0,4,7,12,16].forEach((s,i)=>tone(523*ST(s),.2,'triangle',.17,null,i*.06))},
  card(){tone(760,.06,'triangle',.1,980)},
  pick(){tone(660,.1,'triangle',.16,990);tone(990,.18,'sine',.12,1480,.06)},
  door(){tone(150,.45,'sawtooth',.05,110);noise(.4,.07,500)},
  clear(){[0,3,7,10,12,15].forEach((s,i)=>tone(392*ST(s),.25,'triangle',.13,null,i*.07))},
  boo(){if(!canPlay('boo',80))return;tone(420,.14,'square',.06,190)},
  shot(){if(!canPlay('shot',60))return;tone(300,.2,'sine',.07,150)},
  tele(){if(!canPlay('tele',90))return;tone(180,.45,'sine',.06,520)},
  fizz(){if(!canPlay('fizz',50))return;noise(.12,.08,5000,'highpass')},
  boss(){tone(90,1.3,'sawtooth',.13,45);tone(135,1.3,'triangle',.1,68);noise(1,.1,350)},
  bigpop(){tone(200,.6,'triangle',.26,900);noise(.6,.22,2200);[0,4,7,12,16,19].forEach((s,i)=>tone(523*ST(s),.3,'triangle',.13,null,.1+i*.07))},
  win(){[0,4,7,12,7,12,16,19,24].forEach((s,i)=>tone(392*ST(s),.32,'triangle',.15,null,i*.11))},
  jackpot(){[0,4,7,12,16,19,24,28].forEach((s,i)=>{tone(784*ST(s),.15,'square',.06,null,i*.045);tone(784*ST(s),.2,'sine',.08,null,i*.045)})},
  coin(){tone(1046,.08,'square',.08);tone(1568,.22,'square',.08,null,.07)},
  click(){tone(520,.05,'triangle',.08,720)},
  near(){if(!canPlay('near',150))return;tone(1400,.09,'sine',.07,2000)},
  combo(l){[0,4,7,11].slice(0,2+l).forEach((s,i)=>tone(659*ST(s+l*2),.14,'triangle',.12,null,i*.05))},
  chest(i){tone(330*ST(i*2),.08,'square',.06)},
  lose(){[7,3,0,-5].forEach((s,i)=>tone(330*ST(s),.35,'triangle',.13,null,i*.16))},
  strobe(){if(!canPlay('strobe',100))return;noise(.18,.1,6000,'highpass');tone(1800,.12,'sine',.05,900)},
};
/* music: small procedural spooky loop (A harmonic minor) */
const MUS={next:0,step:0,mode:'calm'};
const PROG=[[0,3,7],[-4,0,3],[5,8,12],[-5,-1,2]];
const n2f=s=>220*ST(s);
function musicTick(){
  if(!AC||S.muted||!S.music||adMuted||AC.state!=='running')return;
  const now=AC.currentTime;if(MUS.next<now-.3)MUS.next=now+.05;
  const fast=MUS.mode==='boss',sd=60/(fast?128:98)/4;
  while(MUS.next<now+.2){
    const st=MUS.step%64,bar=(st/16)|0,s=st%16,ch=PROG[bar],tt=MUS.next;
    if(s===0||s===10||(fast&&s%4===0))osc(n2f(ch[0]-24),sd*(fast?2.5:6),'triangle',.2,null,tt,musG);
    if(s%2===0){const idx=[0,1,2,1,0,2,1,2][s>>1];osc(n2f(ch[idx]+(s>=8?12:0)),sd*1.8,'sine',.075,null,tt,musG,true)}
    if((s===6||s===14)&&Math.random()<.45)osc(n2f(ch[2]+24),.5,'sine',.04,null,tt,musG,true);
    if(fast&&s%2===1)noise(.03,.035,7000,'highpass',tt-now,musG);
    if(fast&&s%8===4)noise(.09,.07,900,'lowpass',tt-now,musG);
    MUS.next+=sd;MUS.step++;
  }
}
