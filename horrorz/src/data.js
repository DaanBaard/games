/* ---------- game data ---------- */
const ROOM_W=1000,ROOM_H=600,WALL=44;
const AB=[
  {id:'wide',r:0,max:5},{id:'long',r:0,max:5},{id:'bright',r:0,max:5},{id:'boots',r:0,max:4},{id:'magnet',r:0,max:3},{id:'heart',r:0,max:3},{id:'dashcd',r:0,max:3},
  {id:'jump',r:1,max:4},{id:'strobe',r:1,max:4},{id:'aura',r:1,max:4},{id:'fire',r:1,max:4},{id:'chill',r:1,max:3},{id:'bomb',r:1,max:3},{id:'candle',r:1,max:3},{id:'salt',r:1,max:3},{id:'sugar',r:1,max:3},{id:'lucky',r:1,max:3},
  {id:'twin',r:2,max:3},{id:'prism',r:2,max:3},{id:'angel',r:2,max:1}];
const SNACK={id:'snack',r:0,max:99};
const ABI={};AB.forEach(a=>ABI[a.id]=a);ABI.snack=SNACK;

const GT={
  wisp:{hp:14,spd:64,r:15,xp:1,cost:1,candy:.55,eye:'#9ff3ff',col:'#dff4ff'},
  sheet:{hp:42,spd:44,r:23,xp:2,cost:2,candy:1,eye:'#ffe46b',col:'#ece4ff'},
  flitter:{hp:10,spd:118,r:13,xp:1,cost:1.2,candy:.6,eye:'#ff9ad5',col:'#f9e0fb'},
  peeker:{hp:22,spd:72,r:17,xp:2,cost:1.6,candy:.8,eye:'#7dffcf',col:'#d6fff0'},
  moaner:{hp:30,spd:52,r:20,xp:2,cost:2,candy:1,eye:'#ffb347',col:'#d6f4f2'},
  pumpkin:{hp:46,spd:52,r:22,xp:3,cost:2.6,candy:1.2,eye:'#ffd23f',col:'#f0e8ff'},
  shade:{hp:34,spd:80,r:18,xp:2,cost:2,candy:1,eye:'#ff7bf2',col:'#9a7ad6'},
  mini:{hp:10,spd:84,r:11,xp:1,cost:0,candy:.3,eye:'#9ff3ff',col:'#dff4ff'},
  golden:{hp:22,spd:150,r:14,xp:3,cost:0,candy:0,eye:'#ffffff',col:'#ffd54a'},
};
const BOOK=['wisp','sheet','flitter','peeker','moaner','pumpkin','shade','golden'];
const FURN={table:[110,70],armchair:[70,66],bookcase:[130,44],piano:[140,80],clock:[52,52],crate:[62,62],trunk:[92,56],rocking:[66,66],dresser:[110,48],boxes:[84,62],
  tomb:[120,58],urn:[46,46],pillar:[56,56],candelabra:[44,44],bench:[120,42],gear:[82,82],pendulum:[60,60],planter:[88,88],fountain:[100,100],pumpkins:[84,60]};
const CH=[
  {floor:'wood',fa:'#4b3424',fb:'#402b1d',wall:'#241a36',paper:'#33264f',stripe:'#3b2c5c',dark:.9,rug:'#5a2140',
   furn:['table','armchair','bookcase','piano','clock'],pool:{wisp:6,sheet:2,flitter:2},
   mini:{name:'Mama Mist',look:'mama',pat:['summon','charge'],col:'#efe6ff',eye:'#ffcf6b'},
   boss:{name:'The Hollow Butler',look:'butler',pat:['ring','summon','charge'],col:'#e8e2ff',eye:'#ff9d5c'}},
  {floor:'boards',fa:'#57483a',fb:'#4b3e31',wall:'#2a2131',paper:'#3a2f40',stripe:'#43374a',dark:.92,rug:'#2f4a5a',
   furn:['crate','trunk','rocking','dresser','boxes'],pool:{wisp:5,sheet:2,flitter:3,peeker:2},
   mini:{name:'Cobweb Countess',look:'countess',pat:['summon','teleport'],col:'#e9eef4',eye:'#c7a6ff'},
   boss:{name:'Moth Matron',look:'moth',pat:['spiral','summon','teleport'],col:'#f2e6d8',eye:'#ffd36b'}},
  {floor:'stone',fa:'#3a3f4a',fb:'#333843',wall:'#1b2230',paper:'#232c3c',stripe:'#283246',dark:.93,rug:'#3a2d22',
   furn:['tomb','urn','pillar','candelabra','bench'],pool:{wisp:4,sheet:3,flitter:2,peeker:2,moaner:2},
   mini:{name:'Mossy Moaner',look:'mossy',pat:['ring','summon'],col:'#d8f0e2',eye:'#ffb347'},
   boss:{name:'Old Grumbleghast',look:'grumble',pat:['ring','teleport','charge','summon'],col:'#e4e8f0',eye:'#8fe9ff'}},
  {floor:'brass',fa:'#4a3828',fb:'#3f3022',wall:'#2a2026',paper:'#382a30',stripe:'#43323a',dark:.93,rug:'#4a3a12',
   furn:['gear','pendulum','crate','bench','clock'],pool:{wisp:3,sheet:2,flitter:3,moaner:2,pumpkin:3,peeker:1},
   mini:{name:'Cog Ghoul',look:'cog',pat:['charge','spiral'],col:'#f0e6d0',eye:'#ffcf3a'},
   boss:{name:'Tick-Tock Wraith',look:'clock',pat:['spiral','ring','charge','summon'],col:'#efe8ff',eye:'#ff8ad8'}},
  {floor:'tiles',fa:'#2d4747',fb:'#283f40',wall:'#16252e',paper:'#1d313b',stripe:'#233a45',dark:.94,rug:'#2a3d24',
   furn:['planter','fountain','bench','urn','pumpkins'],pool:{wisp:3,sheet:2,flitter:2,peeker:2,moaner:2,pumpkin:2,shade:3},
   mini:{name:'Lily Lurker',look:'lily',pat:['teleport','ring','summon'],col:'#e2fff0',eye:'#ff9ad5'},
   boss:{name:'The Moon Widow',look:'widow',pat:['spiral','ring','teleport','summon','charge'],col:'#e6e4ff',eye:'#b6f3ff'}},
];
const SHOP=[{id:'hearts',max:2,cost:[180,520],icon:'heart'},{id:'power',max:5,cost:[40,90,160,260,400],icon:'bright'},{id:'range',max:5,cost:[40,90,160,260,400],icon:'long'},
  {id:'speed',max:3,cost:[60,150,300],icon:'boots'},{id:'bonus',max:5,cost:[50,120,220,350,500],icon:'candy'},{id:'magnet',max:3,cost:[40,100,200],icon:'magnet'},{id:'reroll',max:3,cost:[80,200,400],icon:'coin'}];
const SKINS=[
  {id:'lumi',coat:'#ffd23f',trim:'#d99a14',cost:0},
  {id:'pumpkin',coat:'#ff8a2a',trim:'#c4570f',cost:120},
  {id:'witch',coat:'#8b5cf6',trim:'#5b34b8',cost:260},
  {id:'dino',coat:'#58cf6c',trim:'#2f9a45',cost:420},
  {id:'astro',coat:'#e9eef8',trim:'#8f9bb5',cost:680},
  {id:'vamp',coat:'#2e2440',trim:'#c23a5c',tr:'ch3'},
  {id:'skelly',coat:'#2b2b3a',trim:'#f1efe6',gift:true},
  {id:'golden',coat:'#ffcf3a',trim:'#e09b00',tr:'golden10'},
];
const SKIN={};SKINS.forEach(s=>SKIN[s.id]=s);
const BEAMS=[{id:'warm',c:[255,228,160],cost:0},{id:'mint',c:[150,255,215],cost:100},{id:'pink',c:[255,165,212],cost:150},{id:'violet',c:[196,166,255],cost:220},{id:'ice',c:[175,228,255],cost:320},{id:'gold',c:[255,206,95],tr:'combo50'}];
const MPOOL=[{id:'pop',n:[100,180,260],rw:[30,45,60]},{id:'room',n:[5,7,9],rw:[30,45,60]},{id:'combo',n:[12,20,30],rw:[30,45,60]},{id:'golden',n:[1],rw:[50]},{id:'boss',n:[1],rw:[50]},
  {id:'dash',n:[25,50],rw:[25,40]},{id:'cards',n:[2,4],rw:[35,55]},{id:'candy',n:[120,250],rw:[30,50]},{id:'clean',n:[3,5],rw:[35,55]}];
const TROPHIES=[
  {id:'first',ok:()=>S.st.pops>=1},{id:'pop100',ok:()=>S.st.pops>=100},{id:'pop1000',ok:()=>S.st.pops>=1000},
  {id:'combo20',ok:()=>S.st.maxCombo>=20},{id:'combo50',ok:()=>S.st.maxCombo>=50},
  {id:'ch1',ok:()=>!!S.clear[0]},{id:'ch2',ok:()=>!!S.clear[1]},{id:'ch3',ok:()=>!!S.clear[2]},{id:'ch4',ok:()=>!!S.clear[3]},{id:'ch5',ok:()=>!!S.clear[4]},
  {id:'golden1',ok:()=>S.st.golden>=1},{id:'golden10',ok:()=>S.st.golden>=10},{id:'flawless',ok:()=>!!S.st.flawless},
  {id:'night10',ok:()=>S.nightBest>=10},{id:'rich',ok:()=>S.total>=2000},{id:'maxed',ok:()=>!!S.st.maxed}];
const GIFTS=[20,30,40,60,80,100,'skelly'];
const CANDYCOLS=['#ff5d8f','#ffcf3a','#5ef2c2','#7fb8ff','#c56bff','#ff8a2a'];

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
function checkTrophies(){for(const tr of TROPHIES){if(!S.trophies[tr.id]&&tr.ok()){S.trophies[tr.id]=1;toast('trophy',t('trophyGet'),t('tr_'+tr.id));
  const sk=SKINS.find(s=>s.tr===tr.id);if(sk)setTimeout(()=>toast('sk_'+sk.id,t('newSkin'),t('sk_'+sk.id)),900);save()}}}
