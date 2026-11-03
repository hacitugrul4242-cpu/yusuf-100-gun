(()=>{
'use strict';

const PLAN=window.YUSUF_PLAN||[];
const META=window.YUSUF_META||{};
const QUOTES=window.YUSUF_QUOTES||[];
const TOTAL=PLAN.length;

const KEYS={
  state:'yusuf67-item-progress-v1',
  evals:'yusuf67-evaluations-v1',
  ratings:'yusuf67-ratings-v1',
  selected:'yusuf67-selected-day',
  start:'yusuf67-start-date'
};

const PHASES=[
  {name:'1. TYT Telafi + AYT Geçiş',range:[1,15]},
  {name:'2. AYT Yoğunlaşma',range:[16,40]},
  {name:'3. AYT Tamamlama + Geometri',range:[41,57]},
  {name:'4. Tam Deneme + Onarım',range:[58,67]}
];

let selectedDay=Math.max(1,Math.min(TOTAL,Number(localStorage.getItem(KEYS.selected)||1)));
let activeTab='main';

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
function write(key,val){localStorage.setItem(key,JSON.stringify(val))}
function dayObj(day){return PLAN.find(x=>x.day===Number(day))}
function expandTask(text){
  if(text==='Geometri: 2 test') return ['Geometri: 1. test','Geometri: 2. test'];
  return [text];
}
function tasksFor(day,stage){
  const d=dayObj(day); if(!d)return[];
  const map={tyt:d.tyt,ayt:d.ayt,routines:d.routines,exams:d.exams};
  return (map[stage]||[]).flatMap(expandTask);
}
function allTasks(day){
  return ['tyt','ayt','routines','exams'].flatMap(stage=>
    tasksFor(day,stage).map((text,index)=>({day,stage,index,text,id:day+':'+stage+':'+index}))
  );
}
function state(){return read(KEYS.state)}
function isDone(id,s=state()){return !!s[id]}
function saveState(s){write(KEYS.state,s);renderAll();toast('Kaydedildi')}
function toggle(day,stage,index){
  const s=state(),id=day+':'+stage+':'+index;
  s[id]=!s[id]; saveState(s);
}
function setDone(day,stage,index,value=true){
  const s=state();s[day+':'+stage+':'+index]=!!value;saveState(s);
}
function dayStats(day,s=state()){
  const t=allTasks(day),done=t.filter(x=>isDone(x.id,s)).length;
  return {done,total:t.length,complete:t.length>0&&done===t.length};
}
function globalStats(){
  const s=state();let done=0,total=0,full=0;
  for(const d of PLAN){
    const st=dayStats(d.day,s);done+=st.done;total+=st.total;if(st.complete)full++;
  }
  return {done,total,full,pct:total?Math.round(done/total*100):0};
}
function subject(text){
  const v=text.toLocaleLowerCase('tr-TR');
  if(v.includes('türkçe')||v.includes('paragraf')||v.includes('dil bilgisi'))return['turkce','Türkçe'];
  if(v.includes('matematik')||v.includes('problem')||v.includes('sayılar'))return['mat','Matematik'];
  if(v.includes('fizik'))return['fizik','Fizik'];
  if(v.includes('kimya'))return['kimya','Kimya'];
  if(v.includes('biyoloji'))return['biyoloji','Biyoloji'];
  if(v.includes('geometri')||v.includes('analitik')||v.includes('çember')||v.includes('katı cisim'))return['geo','Geometri'];
  if(v.includes('sosyal'))return['sosyal','Sosyal'];
  if(v.includes('deneme'))return['exam','Deneme'];
  return['','Görev'];
}
function phaseIndex(day){return PHASES.findIndex(p=>day>=p.range[0]&&day<=p.range[1])}
function phasePct(p){
  let done=0,total=0;const s=state();
  for(let d=p.range[0];d<=p.range[1];d++){const st=dayStats(d,s);done+=st.done;total+=st.total}
  return total?Math.round(done/total*100):0;
}
function selectDay(day){
  selectedDay=Math.max(1,Math.min(TOTAL,Number(day)||1));
  localStorage.setItem(KEYS.selected,String(selectedDay));
  renderAll();
}
window.selectDay=selectDay;
window.toggleTask=toggle;
window.setDone=setDone;

function renderHeader(){
  $('programRange').textContent=(META.startDate||'2026-11-06')+' → '+(META.endDate||'2027-01-11');
}
function renderControls(){
  const sel=$('daySelect');
  sel.innerHTML=PLAN.map(d=>'<option value="'+d.day+'">Gün '+d.day+' • '+d.date+'</option>').join('');
  sel.value=String(selectedDay);
  $('startDate').value=localStorage.getItem(KEYS.start)||META.startDate||'2026-11-06';
}
function renderPhases(){
  const idx=phaseIndex(selectedDay);
  $('phases').innerHTML=PHASES.map((p,i)=>
    '<button class="phase '+(i===idx?'active':'')+'" onclick="selectDay('+p.range[0]+')">'+
    '<small>FAZ '+(i+1)+'</small><b>'+esc(p.name)+'</b><span>Gün '+p.range[0]+'–'+p.range[1]+'</span>'+
    '<div class="track"><i style="width:'+phasePct(p)+'%"></i></div></button>'
  ).join('');
}
function renderDays(){
  const s=state();
  $('days').innerHTML=PLAN.map(d=>{
    const st=dayStats(d.day,s);
    const cls=d.day===selectedDay?'active':st.complete?'done':st.done>0?'partial':'';
    return '<button class="day '+cls+'" onclick="selectDay('+d.day+')" title="'+d.date+' • '+st.done+'/'+st.total+'">'+d.day+'</button>';
  }).join('');
  requestAnimationFrame(()=>$('days').querySelector('.day.active')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}));
}
function stageCard(stage,title){
  const tasks=tasksFor(selectedDay,stage);
  if(!tasks.length)return'';
  const s=state(),done=tasks.filter((_,i)=>isDone(selectedDay+':'+stage+':'+i,s)).length;
  return '<section class="stageCard"><div class="stageHead"><div><div class="stageName">'+esc(title)+'</div><div class="stageMeta">'+done+'/'+tasks.length+' görev tamamlandı</div></div>'+
  '<button class="stageAll" data-stage="'+stage+'">'+(done===tasks.length?'Aşamayı aç':'Tümünü tamamla')+'</button></div>'+
  '<div class="itemList">'+tasks.map((text,i)=>{
    const id=selectedDay+':'+stage+':'+i,ok=isDone(id,s),[sub,label]=subject(text);
    return '<label class="taskItem '+(ok?'done':'')+'"><input type="checkbox" '+(ok?'checked':'')+' onchange="toggleTask('+selectedDay+',\''+stage+'\','+i+')">'+
    '<div><div class="itemText">'+esc(text)+'</div><span class="subjectTag" data-s="'+sub+'">'+esc(label)+'</span></div></label>';
  }).join('')+'</div></section>';
}
function renderPanel(){
  const d=dayObj(selectedDay);if(!d)return;
  const st=dayStats(selectedDay);
  $('panelTitle').textContent='Gün '+selectedDay+' • '+d.date;
  $('panelSub').textContent=d.phase+' • '+st.done+'/'+st.total+' görev tamamlandı';
  $('allDayBtn').textContent=st.complete?'Günü aç':'Tüm günü tamamla';

  let body='';
  if(activeTab==='main'){
    const study=[stageCard('tyt','TYT ana çalışma'),stageCard('ayt','AYT ana çalışma')].filter(Boolean).join('');
    body='<div class="mainWorkspace"><div class="mainStudyStack">'+(study||'<div class="empty">Bu gün ana konu çalışması yok.</div>')+
      '<div class="priorityBox"><b>Günün önceliği</b><p>'+esc(d.priority)+'</p></div></div>'+
      '<aside class="routineSide">'+(stageCard('routines','Günlük rutinler')||'<div class="empty">Rutin yok.</div>')+'</aside></div>';
  }else if(activeTab==='exams'){
    body=stageCard('exams','Branş / Tam Denemeler')||'<div class="empty">Bu gün için deneme görevi yok.</div>';
  }else{
    const completed=Object.entries(META.completed||{}).map(([k,v])=>
      '<div class="controlItem"><b>'+esc(k)+' • Tamamlandı</b><p>'+v.map(esc).join(' • ')+'</p></div>'
    ).join('');
    body='<div class="controlGrid">'+
      '<div class="controlItem"><b>Yeni takvim</b><p>06.11.2026–11.01.2027 • 67 gün</p></div>'+
      '<div class="controlItem"><b>AYT başlangıçları</b><p>Biyoloji/Kimya: Gün 2 • Matematik: Gün 6 • Fizik: Gün 12</p></div>'+
      '<div class="controlItem"><b>AYT ana konu bitişleri</b><p>Biyoloji: 35 • Kimya: 42 • Fizik: 51 • Matematik: 53 • Analitik Geometri: 57</p></div>'+
      '<div class="controlItem"><b>Final fazı</b><p>Gün 58–67: 5 tam TYT + 5 tam AYT, her gün yanlış analizi.</p></div>'+completed+'</div>';
  }
  $('panelBody').innerHTML=body;

  document.querySelectorAll('.stageAll').forEach(btn=>btn.onclick=()=>{
    const stage=btn.dataset.stage,tasks=tasksFor(selectedDay,stage),s=state();
    const all=tasks.every((_,i)=>isDone(selectedDay+':'+stage+':'+i,s));
    tasks.forEach((_,i)=>s[selectedDay+':'+stage+':'+i]=!all);
    saveState(s);
  });
}
function renderQuote(){
  const q=QUOTES[selectedDay-1]||{text:'',author:''};
  $('quoteText').textContent=q.text?'“'+q.text+'”':'';
  $('quoteSub').textContent=(q.author||'')+' • Gün '+selectedDay;
}
function outstanding(){
  const s=state(),out=[];
  for(let d=1;d<=selectedDay;d++){
    for(const t of allTasks(d))if(!isDone(t.id,s))out.push(t);
  }
  return out;
}
function renderAlerts(){
  const items=outstanding(),late=items.filter(x=>x.day<selectedDay);
  $('backCount').textContent=items.length;
  $('lateCount').textContent=late.length;
  $('todayOpenCount').textContent=items.length-late.length;
  if(!items.length){$('alertBody').innerHTML='<div class="alertEmpty"><b>✓ Açık görev yok.</b><span>Seçili güne kadar tüm işler tamamlandı.</span></div>';return}
  const groups={};
  for(const x of items)(groups[x.day]??=[]).push(x);
  $('alertBody').innerHTML=Object.entries(groups).map(([day,arr])=>
    '<div class="alertGroup"><div class="alertGroupHead"><b>'+(Number(day)===selectedDay?'Bugün':'Gün '+day)+'</b><span>'+arr.length+' açık</span></div>'+
    arr.map(x=>'<div class="alertItem"><button class="alertCheck" onclick="setDone('+x.day+',\''+x.stage+'\','+x.index+',true)">✓</button>'+
      '<div><b>'+esc(x.text)+'</b><span>'+esc(subject(x.text)[1])+'</span></div><button class="jumpBtn" onclick="selectDay('+x.day+')">Güne git</button></div>').join('')+
    '</div>'
  ).join('');
}
function renderEvaluation(){
  const ev=read(KEYS.evals),rt=read(KEYS.ratings);
  $('rating').innerHTML=[1,2,3,4,5].map(n=>'<button class="rate '+(Number(rt[selectedDay])===n?'active':'')+'" data-n="'+n+'">'+n+'</button>').join('');
  $('note').value=ev[selectedDay]||'';
  document.querySelectorAll('.rate').forEach(b=>b.onclick=()=>{const r=read(KEYS.ratings);r[selectedDay]=Number(b.dataset.n);write(KEYS.ratings,r);renderEvaluation();toast('Puan kaydedildi')});
}
function renderProgress(){
  const g=globalStats(),d=dayStats(selectedDay);
  $('dayDone').textContent=d.done+'/'+d.total;
  $('totalDone').textContent=g.done;
  $('pct').textContent=g.pct+'%';
  $('ring').style.setProperty('--p',g.pct);
  $('remainingPct').textContent='%'+(100-g.pct)+' kaldı';
  $('detail').textContent=g.full+'/'+TOTAL+' gün tamamen tamamlandı';
  $('summaryDone').textContent=d.done;
  $('summaryLeft').textContent=Math.max(0,d.total-d.done);
  $('summaryLate').textContent=outstanding().filter(x=>x.day<selectedDay).length;
}
function renderAll(){
  renderHeader();renderControls();renderPhases();renderDays();renderPanel();renderQuote();renderAlerts();renderEvaluation();renderProgress();
}
function toast(msg){
  const t=$('toast');t.textContent=msg||'Kaydedildi';t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),900);
}
function todayDay(){
  const raw=localStorage.getItem(KEYS.start)||META.startDate||'2026-11-06';
  const st=new Date(raw+'T00:00:00'),now=new Date();now.setHours(0,0,0,0);
  const diff=Math.floor((now-st)/86400000)+1;
  return Math.max(1,Math.min(TOTAL,diff));
}

$('daySelect').addEventListener('change',e=>selectDay(e.target.value));
$('todayBtn').addEventListener('click',()=>selectDay(todayDay()));
$('startDate').addEventListener('change',e=>{localStorage.setItem(KEYS.start,e.target.value);toast('Başlangıç tarihi kaydedildi')});
$('allDayBtn').addEventListener('click',()=>{
  const tasks=allTasks(selectedDay),s=state(),all=tasks.every(t=>isDone(t.id,s));
  tasks.forEach(t=>s[t.id]=!all);saveState(s);
});
$('note').addEventListener('input',e=>{const o=read(KEYS.evals);o[selectedDay]=e.target.value;write(KEYS.evals,o)});
$('resetBtn').addEventListener('click',()=>{
  if(confirm('Bu 67 günlük plandaki tüm işaretler, puanlar ve notlar sıfırlansın mı?')){
    [KEYS.state,KEYS.evals,KEYS.ratings].forEach(k=>localStorage.removeItem(k));
    renderAll();toast('Takip sıfırlandı');
  }
});
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
  activeTab=btn.dataset.tab;
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===btn));
  renderPanel();
}));

if(!localStorage.getItem(KEYS.start))localStorage.setItem(KEYS.start,META.startDate||'2026-11-06');
renderAll();
})();