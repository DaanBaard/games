/* ---------- game data ---------- */
let ROOM_W=1000,ROOM_H=600;
const WALL=40,WALLT=118;
const AB=[
  {id:'wide',r:0,max:5},{id:'long',r:0,max:5},{id:'bright',r:0,max:5},{id:'boots',r:0,max:4},{id:'magnet',r:0,max:3},{id:'heart',r:0,max:3},{id:'dashcd',r:0,max:3},
  {id:'jump',r:1,max:4},{id:'strobe',r:1,max:4},{id:'aura',r:1,max:4},{id:'fire',r:1,max:4},{id:'chill',r:1,max:3},{id:'bomb',r:1,max:3},{id:'candle',r:1,max:3},{id:'salt',r:1,max:3},{id:'sugar',r:1,max:3},{id:'lucky',r:1,max:3},
  {id:'twin',r:2,max:3},{id:'prism',r:2,max:3},{id:'angel',r:2,max:1}];
const SNACK={id:'snack',r:0,max:99};
const ABI={};AB.forEach(a=>ABI[a.id]=a);ABI.snack=SNACK;

/* ghost types — col: body tint, eye: glow colour in the dark */
const GT={
  wisp:{hp:14,spd:64,r:15,xp:1,cost:1,candy:.55,eye:'#9fd8ff',col:'#cfe2f0'},
  sheet:{hp:42,spd:44,r:23,xp:2,cost:2,candy:1,eye:'#ffd27a',col:'#ddd6cc'},
  flitter:{hp:10,spd:118,r:13,xp:1,cost:1.2,candy:.6,eye:'#ffb0d8',col:'#e6d8e8'},
  mote:{hp:5,spd:104,r:8,xp:1,cost:2,candy:.25,eye:'#fff0a8',col:'#f2ead0',group:4},
  peeker:{hp:22,spd:72,r:17,xp:2,cost:1.6,candy:.8,eye:'#b8ffe6',col:'#dfe6e2'},
  mimic:{hp:24,spd:96,r:15,xp:2,cost:1.6,candy:1.6,eye:'#ffb347',col:'#e8dcc2'},
  moaner:{hp:30,spd:52,r:20,xp:2,cost:2,candy:1,eye:'#c6ff9a',col:'#c9d8c6'},
  wailer:{hp:40,spd:50,r:21,xp:3,cost:2.6,candy:1.3,eye:'#c9f1ff',col:'#dfe8f2'},
  drinker:{hp:38,spd:46,r:22,xp:3,cost:2.4,candy:1.2,eye:'#e8f4ff',col:'#2a2733'},
  pumpkin:{hp:46,spd:52,r:22,xp:3,cost:2.6,candy:1.2,eye:'#ffb02e',col:'#3a2f2a'},
  shade:{hp:34,spd:80,r:18,xp:2,cost:2,candy:1,eye:'#ff4a3a',col:'#1e1a24'},
  mini:{hp:10,spd:84,r:11,xp:1,cost:0,candy:.3,eye:'#9fd8ff',col:'#cfe2f0'},
  golden:{hp:22,spd:150,r:14,xp:3,cost:0,candy:0,eye:'#fff2c0',col:'#ffd56a'},
};
const BOOK=['wisp','sheet','flitter','mote','peeker','mimic','moaner','wailer','drinker','pumpkin','shade','golden'];

/* furniture footprints [w,h] — everything here blocks movement and light */
const FURN={
  table:[120,74],longtable:[300,96],armchair:[66,62],sheetchair:[72,66],sheetsofa:[150,70],bookcase:[150,44],piano:[150,86],grandclock:[56,44],cabinet:[96,46],
  crate:[60,60],boxes:[82,62],trunk:[96,56],rocking:[64,64],dresser:[112,50],mirror:[58,30],post:[34,34],cratesrow:[60,60],
  tomb:[124,62],sarcophagus:[150,70],coffin:[60,140],urn:[44,44],pillar:[58,58],candelabra:[40,40],pew:[180,40],
  gear:[96,96],biggear:[190,190],pendulum:[64,64],bellframe:[120,120],ironcol:[42,42],workbench:[140,60],
  planter:[96,96],planterrow:[160,70],fountain:[160,160],statue:[64,64],bench:[124,42],pumpkins:[86,62]};

/* layouts — dimensions and generator name */
const LAY={
  scatter:{w:1000,h:600},pillars:{w:1180,h:700},aisles:{w:1080,h:680},centerpiece:{w:1040,h:660},
  cluttered:{w:920,h:580},ring:{w:1100,h:680},corridor:{w:1500,h:440},open:{w:820,h:520}};

const CH=[
  {floor:'parquet',wallf:'damask',paper:'#4a1e26',paper2:'#5e2a30',trim:'#2a1810',dark:.93,amb:'creak',
   tint:'rgba(70,40,20,.10)',lay:['scatter','centerpiece','aisles','pillars','open'],
   small:['armchair','sheetchair','grandclock','cabinet','table'],big:['piano','sheetsofa','table'],center:['longtable','piano'],aisle:'bookcase',pillar:'pillar',
   pool:{wisp:6,sheet:3,flitter:2,mote:1},
   mini:{name:'Mama Mist',look:'mama',pat:['summon','charge','wail'],col:'#d8d3e2',eye:'#ffcf8a'},
   boss:{name:'The Hollow Butler',look:'butler',pat:['ring','summon','charge','dark'],col:'#d6d2cc',eye:'#ffa070'},
   rooms:6},
  {floor:'boards',wallf:'timber',paper:'#3a2c20',paper2:'#4a3826',trim:'#20160e',dark:.93,amb:'wind',
   tint:'rgba(60,50,30,.10)',lay:['cluttered','aisles','pillars','corridor','scatter'],
   small:['crate','boxes','trunk','rocking','sheetchair','mirror'],big:['dresser','trunk','sheetsofa'],center:['sheetsofa','dresser'],aisle:'cratesrow',pillar:'post',
   pool:{wisp:5,sheet:2,flitter:3,peeker:2,mimic:2,mote:2},
   mini:{name:'Cobweb Countess',look:'countess',pat:['summon','teleport','wail'],col:'#dfe2e6',eye:'#c7a6ff'},
   boss:{name:'Moth Matron',look:'moth',pat:['spiral','summon','teleport','clones'],col:'#e2d6c4',eye:'#ffd36b'}},
  {floor:'flagstone',wallf:'stone',paper:'#2a2f38',paper2:'#343a44',trim:'#14161b',dark:.95,amb:'drip',
   tint:'rgba(20,40,50,.12)',lay:['pillars','aisles','centerpiece','corridor','scatter'],
   small:['urn','candelabra','tomb','coffin'],big:['tomb','sarcophagus'],center:['sarcophagus','tomb'],aisle:'pew',pillar:'pillar',
   pool:{wisp:4,sheet:3,flitter:2,peeker:1,moaner:2,wailer:2,drinker:1},
   mini:{name:'Mossy Moaner',look:'mossy',pat:['ring','summon','wail'],col:'#c9dccd',eye:'#c6ff9a'},
   boss:{name:'Old Grumbleghast',look:'grumble',pat:['ring','teleport','charge','summon','dark'],col:'#d6dbe2',eye:'#8fe9ff'}},
  {floor:'iron',wallf:'brick',paper:'#4a2a22',paper2:'#5a3428',trim:'#1a1210',dark:.94,amb:'tick',
   tint:'rgba(70,50,20,.10)',lay:['centerpiece','scatter','pillars','corridor','cluttered'],
   small:['gear','crate','pendulum','grandclock','workbench'],big:['workbench','bellframe'],center:['biggear','bellframe'],aisle:'workbench',pillar:'ironcol',
   pool:{wisp:3,sheet:2,flitter:3,moaner:2,pumpkin:2,shade:2,mimic:1,wailer:1},
   mini:{name:'Cog Ghoul',look:'cog',pat:['charge','spiral','clones'],col:'#e2d8c2',eye:'#ffcf3a'},
   boss:{name:'Tick-Tock Wraith',look:'clock',pat:['spiral','ring','charge','summon','dark','wail'],col:'#dcd8e6',eye:'#ff8ad8'}},
  {floor:'terracotta',wallf:'glass',paper:'#1d2a30',paper2:'#26363c',trim:'#11181c',dark:.9,amb:'crickets',
   tint:'rgba(30,50,70,.12)',lay:['aisles','centerpiece','pillars','scatter','open'],
   small:['planter','urn','statue','pumpkins','bench'],big:['planterrow','bench'],center:['fountain','planter'],aisle:'planterrow',pillar:'ironcol',
   pool:{wisp:3,sheet:2,flitter:2,peeker:2,moaner:2,pumpkin:2,shade:3,drinker:2,wailer:1,mote:1},
   mini:{name:'Lily Lurker',look:'lily',pat:['teleport','ring','summon','wail'],col:'#d6eadc',eye:'#ffa6d0'},
   boss:{name:'The Moon Widow',look:'widow',pat:['spiral','ring','teleport','summon','charge','clones','dark'],col:'#d8d6e6',eye:'#b6f3ff'}},
];

/* room types and twists */
const RT={waves:{w:30,from:1},swarm:{w:13,from:2},ritual:{w:14,from:2},survive:{w:11,from:3},hunt:{w:8,from:2},poltergeist:{w:12,from:2},shrine:{w:6,from:3}};
const TWISTS=['fog','flicker','storm','haunt','cold','dark'];

const SHOP=[{id:'hearts',max:2,cost:[180,520],icon:'heart'},{id:'power',max:5,cost:[40,90,160,260,400],icon:'bright'},{id:'range',max:5,cost:[40,90,160,260,400],icon:'long'},
  {id:'speed',max:3,cost:[60,150,300],icon:'boots'},{id:'bonus',max:5,cost:[50,120,220,350,500],icon:'candy'},{id:'magnet',max:3,cost:[40,100,200],icon:'magnet'},{id:'reroll',max:3,cost:[80,200,400],icon:'coin'}];
const SKINS=[
  {id:'lumi',coat:'#c99a2e',trim:'#7a5a18',cost:0},
  {id:'pumpkin',coat:'#b8612a',trim:'#6e3412',cost:120},
  {id:'witch',coat:'#4a3a62',trim:'#2a1f3c',cost:260},
  {id:'dino',coat:'#4f7a4a',trim:'#2e4a2c',cost:420},
  {id:'astro',coat:'#d4d8de',trim:'#7c8494',cost:680},
  {id:'vamp',coat:'#26202c',trim:'#7a1e2c',tr:'ch3'},
  {id:'skelly',coat:'#222228',trim:'#d8d4c8',gift:true},
  {id:'golden',coat:'#c9a03a',trim:'#7a5a12',tr:'golden10'},
];
const SKIN={};SKINS.forEach(s=>SKIN[s.id]=s);
const BEAMS=[{id:'warm',c:[255,226,170],cost:0},{id:'mint',c:[170,255,220],cost:100},{id:'pink',c:[255,180,210],cost:150},{id:'violet',c:[205,180,255],cost:220},{id:'ice',c:[190,228,255],cost:320},{id:'gold',c:[255,206,120],tr:'combo50'}];
const MPOOL=[{id:'pop',n:[100,180,260],rw:[30,45,60]},{id:'room',n:[5,7,9],rw:[30,45,60]},{id:'combo',n:[12,20,30],rw:[30,45,60]},{id:'golden',n:[1],rw:[50]},{id:'boss',n:[1],rw:[50]},
  {id:'dash',n:[25,50],rw:[25,40]},{id:'cards',n:[2,4],rw:[35,55]},{id:'candy',n:[120,250],rw:[30,50]},{id:'clean',n:[3,5],rw:[35,55]},
  {id:'ritual',n:[1,2],rw:[35,55]},{id:'kinds',n:[5,7],rw:[30,45]}];
const TROPHIES=[
  {id:'first',ok:()=>S.st.pops>=1},{id:'pop100',ok:()=>S.st.pops>=100},{id:'pop1000',ok:()=>S.st.pops>=1000},
  {id:'combo20',ok:()=>S.st.maxCombo>=20},{id:'combo50',ok:()=>S.st.maxCombo>=50},
  {id:'ch1',ok:()=>!!S.clear[0]},{id:'ch2',ok:()=>!!S.clear[1]},{id:'ch3',ok:()=>!!S.clear[2]},{id:'ch4',ok:()=>!!S.clear[3]},{id:'ch5',ok:()=>!!S.clear[4]},
  {id:'golden1',ok:()=>S.st.golden>=1},{id:'golden10',ok:()=>S.st.golden>=10},{id:'flawless',ok:()=>!!S.st.flawless},
  {id:'night10',ok:()=>S.nightBest>=10},{id:'rich',ok:()=>S.total>=2000},{id:'maxed',ok:()=>!!S.st.maxed},
  {id:'allrooms',ok:()=>Object.keys(RT).every(k=>S.st.rtypes&&S.st.rtypes[k])},{id:'book',ok:()=>BOOK.every(k=>S.seen[k]||S.popped[k])}];
const GIFTS=[20,30,40,60,80,100,'skelly'];
const CANDYCOLS=['#b8324a','#d9a12a','#3f8f6e','#3c6ea8','#7a4a9a','#c4642a'];

/* ---------- meta helpers ---------- */
function skinOwned(sk){return S.skins.includes(sk.id)||(sk.tr&&S.trophies[sk.tr])}
function beamOwned(b){return S.beams.includes(b.id)||(b.tr&&S.trophies[b.tr])}
function beamCol(){const b=BEAMS.find(x=>x.id===S.beam)||BEAMS[0];return b.c}
function ensureDaily(){
  const k=todayKey();if(S.daily.day===k&&S.daily.list.length)return;
  const r=srng(hashStr('hz'+k));const pool=MPOOL.slice();const list=[];
  while(list.length<3&&pool.length){const m=pool.splice(Math.floor(r()*pool.length),1)[0];const ti=Math.floor(r()*m.n.length);list.push({id:m.id,n:m.n[ti],rw:m.rw[ti],p:0,c:false})}
  S.daily={day:k,list,bonus:false};save();
}
function mProg(id,v,mode){if(!S.daily.list)return;for(const m of S.daily.list){if(m.id!==id||m.c)continue;if(mode==='max')m.p=Math.max(m.p,v);else m.p+=v;if(m.p>=m.n&&!m.ready){m.ready=true;missionReadyFx(m)}}}
function missionsClaimable(){ensureDaily();let n=S.daily.list.filter(m=>m.p>=m.n&&!m.c).length;if(!S.daily.bonus&&S.daily.list.every(m=>m.c))n++;return n}
function giftReady(){return S.gift.last!==todayKey()}
function checkTrophies(){for(const tr of TROPHIES){if(!S.trophies[tr.id]&&tr.ok()){S.trophies[tr.id]=1;measure('trophy',tr.id,'reached');toast('trophy',t('trophyGet'),t('tr_'+tr.id));
  const sk=SKINS.find(s=>s.tr===tr.id);if(sk)setTimeout(()=>toast('sk_'+sk.id,t('newSkin'),t('sk_'+sk.id)),900);save()}}}
