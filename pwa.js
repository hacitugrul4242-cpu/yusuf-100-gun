(()=>{

  /* PROGRAM_PATCH_2026_09_18 */
  (function applyProgramPatch20260918(){
    if(typeof SHEETS==="undefined" || !Array.isArray(SHEETS["100 Günlük Plan"])) return;
    const rows=SHEETS["100 Günlük Plan"].slice(1);
    const split=v=>v==null?[]:String(v).split("\n");
    const join=arr=>{const a=arr.filter(x=>String(x).trim());return a.length?a.join("\n"):"Yok"};
    const row=d=>rows[d-1];

    const oldAytPhysics={};
    for(const r of rows){
      const p=split(r[3]).find(x=>x.startsWith("Fizik:"));
      if(p) oldAytPhysics[Number(r[0])]=p;
    }

    const tytPhysics={
      1:"Fizik: Optik (1/3)",
      2:"Fizik: Optik (2/3)",
      3:"Fizik: Optik (3/3)",
      4:"Fizik: Dalgalar",
      5:"Fizik: Kaldırma Kuvveti",
      6:"Fizik: Elektrostatik",
      7:"Fizik: Elektrik Yükleri",
      8:"Fizik: Elektrik Akımı",
      9:"Fizik: Elektrik Devreleri",
      10:"Fizik: Direnç",
      11:"Fizik: Seri – Paralel Bağlama",
      12:"Fizik: Manyetizma / Mıknatıslar"
    };

    for(const r of rows){
      const d=Number(r[0]);
      const a=split(r[2]).filter(x=>!x.startsWith("Fizik:"));
      if(tytPhysics[d]){
        const mi=a.findIndex(x=>x.startsWith("Matematik:"));
        a.splice(mi>=0?mi+1:a.length,0,tytPhysics[d]);
      }
      r[2]=a.join("\n");
    }

    for(const r of rows) r[3]=split(r[3]).filter(x=>!x.startsWith("Fizik:")).join("\n");
    for(const [od,p] of Object.entries(oldAytPhysics)){
      const nd=Number(od)+2;
      if(nd>100) continue;
      const r=row(nd), a=split(r[3]).filter(x=>String(x).trim());
      a.push(p); r[3]=a.join("\n");
    }

    for(const r of rows){
      const d=Number(r[0]);
      let b=split(r[5]);
      if(d===11||d===12) b=b.filter(x=>x!=="TYT Fizik: 2 branş denemesi");
      if(d<71) b=b.filter(x=>x!=="AYT Fizik branş denemesi");
      if(d<83) b=b.filter(x=>x!=="AYT Matematik branş denemesi");
      r[5]=join(b);

      if(d<83){
        r[3]=split(r[3]).filter(x=>x!=="AYT Matematik branş denemesi").join("\n");
      }
    }

    row(11)[6]="Konu zincirini koru; hızdan önce doğru yöntemi oturt.";
    row(13)[6]="TYT Fizik bitti → AYT Fizik başladı.";

    const cp=SHEETS["Kontrol Paneli"];
    if(Array.isArray(cp)){
      const pr=cp.find(r=>Array.isArray(r)&&r[0]==="Fizik");
      if(pr){
        pr[1]="12. gün";
        pr[2]="13. gün";
        pr[3]="13. günden itibaren günde 2 TYT mini branş; AYT ana konu 70. gün biter.";
      }
    }

    const migrationKey="yusuf100-program-patch-20260918-v1";
    if(!localStorage.getItem(migrationKey)){
      try{
        const s=JSON.parse(localStorage.getItem("yusuf100-item-progress-v3")||"{}");
        if(typeof stageTasks==="function"){
          for(let d=1;d<=12;d++){
            const tasks=stageTasks(row(d),"tyt");
            tasks.forEach((t,i)=>{if(String(t).startsWith("Fizik:")) delete s[d+":tyt:"+i]});
          }
          for(let d=13;d<=70;d++){
            const tasks=stageTasks(row(d),"ayt");
            tasks.forEach((t,i)=>{if(String(t).startsWith("Fizik:")) delete s[d+":ayt:"+i]});
          }
        }
        localStorage.setItem("yusuf100-item-progress-v3",JSON.stringify(s));
        localStorage.setItem(migrationKey,"1");
      }catch{}
    }
  })();

  /* PROGRAM_PATCH_2026_09_19 */
  (function patchFn(){
  if(typeof SHEETS==="undefined" || !Array.isArray(SHEETS["100 Günlük Plan"])) return;
  const rows=SHEETS["100 Günlük Plan"].slice(1);
  const split=v=>v==null?[]:String(v).split("\n").filter(x=>String(x).trim());
  const join=arr=>{const a=arr.filter(x=>String(x).trim());return a.length?a.join("\n"):"Yok"};
  const row=d=>rows[d-1];
  const addLine=(r,col,text,where="end")=>{
    if(!r||!text)return;
    const a=split(r[col]).filter(x=>x!==text);
    if(where==="afterTurkce"){
      const i=a.findIndex(x=>x.startsWith("Türkçe:"));
      a.splice(i>=0?i+1:0,0,text);
    }else if(where==="first"){
      a.unshift(text);
    }else{
      a.push(text);
    }
    r[col]=join(a);
  };

  const oldTaskSnapshot={};
  if(typeof stageTasks==="function"){
    for(let d=1;d<=100;d++){
      oldTaskSnapshot[d]={};
      for(const st of ["tyt","ayt","rutin","brans"]){
        oldTaskSnapshot[d][st]=stageTasks(row(d),st).slice();
      }
    }
  }

  const mathMoves=[];
  for(const r of rows){
    const d=Number(r[0]);
    for(const [col,kind] of [[2,"tyt"],[3,"ayt"]]){
      for(const text of split(r[col])){
        if(text.startsWith("Matematik:")) mathMoves.push({d,col,kind,text});
      }
      r[col]=join(split(r[col]).filter(x=>!x.startsWith("Matematik:")));
    }

    for(const text of split(r[4])){
      if(text.includes("Sayılar Denemesi") || text.includes("TYT Matematik branş denemesi")){
        mathMoves.push({d,col:4,kind:"rutin",text});
      }
    }
    r[4]=join(split(r[4]).filter(x=>!x.includes("Sayılar Denemesi") && !x.includes("TYT Matematik branş denemesi")));

    for(const text of split(r[5])){
      if(text==="AYT Matematik branş denemesi") mathMoves.push({d,col:5,kind:"brans",text});
    }
    r[5]=join(split(r[5]).filter(x=>x!=="AYT Matematik branş denemesi"));
  }

  for(const m of mathMoves){
    const nd=m.d+3;
    if(nd>100) continue;
    let text=m.text;
    if(text.includes("1 Sayılar Denemesi (30 gün: 12–41)")){
      text="1 Sayılar Denemesi (30 gün: 15–44)";
    }
    const where=m.kind==="tyt"?"afterTurkce":m.kind==="ayt"?"first":"end";
    addLine(row(nd),m.col,text,where);
  }

  for(const r of rows){
    const d=Number(r[0]);
    if(d<=85){
      r[5]=join(split(r[5]).filter(x=>x!=="AYT Matematik branş denemesi"));
    }
    if(d===83||d===84){
      r[3]=join(split(r[3]).map(x=>x==="AYT Matematik ve Fen: eksik kapatma + branş denemeleri"
        ?"AYT Fen: eksik kapatma + branş denemeleri":x));
    }
    if(d===85){
      r[3]=join(split(r[3]).map(x=>x==="AYT: branş denemeleri + yanlış analizi + hedefli onarım"
        ?"AYT Fen: branş denemeleri + yanlış analizi + hedefli onarım":x));
    }
  }

  const aytBioMoves=[];
  const aytBioBranchMoves=[];
  for(const r of rows){
    const d=Number(r[0]);

    for(const text of split(r[3])){
      if(text.startsWith("Biyoloji:")) aytBioMoves.push({d,text});
    }
    r[3]=join(split(r[3]).filter(x=>!x.startsWith("Biyoloji:")));

    for(const text of split(r[5])){
      if(text==="AYT Biyoloji branş denemesi") aytBioBranchMoves.push({d,text});
    }
    r[5]=join(split(r[5]).filter(x=>x!=="AYT Biyoloji branş denemesi" && x!=="TYT Biyoloji: 2 branş denemesi"));

    r[2]=join(split(r[2]).filter(x=>!x.startsWith("Biyoloji:")));
  }

  const tytBio={
    1:"Biyoloji: Hücre Bölünmeleri: Mitoz",
    2:"Biyoloji: Hücre Bölünmeleri: Mayoz",
    3:"Biyoloji: Üreme",
    4:"Biyoloji: Kalıtım (1/2)",
    5:"Biyoloji: Kalıtım (2/2)"
  };
  for(let d=1;d<=5;d++) addLine(row(d),2,tytBio[d],"end");

  for(const m of aytBioMoves){
    const nd=m.d+2;
    if(nd<=100) addLine(row(nd),3,m.text,"end");
  }

  for(let d=6;d<=100;d++) addLine(row(d),5,"TYT Biyoloji: 2 branş denemesi","end");

  for(const m of aytBioBranchMoves){
    const nd=m.d+2;
    if(nd<=100) addLine(row(nd),5,m.text,"end");
  }

  const generic="Konu zincirini koru; hızdan önce doğru yöntemi oturt.";
  row(4)[6]=generic;
  row(6)[6]="TYT Biyoloji bitti → AYT Biyoloji başladı.";
  row(12)[6]=generic;
  row(15)[6]="TYT Matematik bitti → AYT Matematik başladı.";
  row(45)[6]=generic;
  row(47)[6]="AYT Biyoloji ana konu havuzu bitti → branş ve onarım.";
  row(83)[6]=generic;
  row(85)[6]="AYT Matematik ve AYT geometri ana konu havuzunun son günü; branş denemesine henüz geçme.";
  row(86)[6]="AYT Matematik ve AYT geometri ana konu havuzu bitti → branş denemeleri ve hedefli onarım.";

  const cp=SHEETS["Kontrol Paneli"];
  if(Array.isArray(cp)){
    const bio=cp.find(r=>Array.isArray(r)&&r[0]==="Biyoloji");
    if(bio){
      bio[1]="5. gün";
      bio[2]="6. gün";
      bio[3]="6. günden itibaren günde 2 TYT mini branş; AYT ana konu 46. gün biter.";
    }
    const mat=cp.find(r=>Array.isArray(r)&&r[0]==="Matematik");
    if(mat){
      mat[1]="14. gün";
      mat[2]="15. gün";
      mat[3]="15–44 sayılar denemesi; 45. günden itibaren 3 günde bir TYT mat branş.";
    }
    const nums=cp.find(r=>Array.isArray(r)&&r[0]==="30 gün sayılar denemesi");
    if(nums){
      nums[1]="TAM";
      nums[2]="Gün 15–44 (30 gün).";
    }
  }

  const migrationKey="yusuf100-program-patch-20260919-v1";
  if(!localStorage.getItem(migrationKey) && typeof stageTasks==="function"){
    try{
      const oldState=JSON.parse(localStorage.getItem("yusuf100-item-progress-v3")||"{}");
      const next={};
      for(const [k,v] of Object.entries(oldState)){
        if(!/^\d+:(tyt|ayt|rutin|brans):\d+$/.test(k)) next[k]=v;
      }
      for(let d=1;d<=100;d++){
        for(const st of ["tyt","ayt","rutin","brans"]){
          const before=oldTaskSnapshot[d]?.[st]||[];
          const after=stageTasks(row(d),st);
          const used=new Set();
          before.forEach((txt,i)=>{
            if(!oldState[d+":"+st+":"+i]) return;
            const j=after.findIndex((x,idx)=>!used.has(idx)&&x===txt);
            if(j>=0){
              used.add(j);
              next[d+":"+st+":"+j]=true;
            }
          });
        }
      }
      localStorage.setItem("yusuf100-item-progress-v3",JSON.stringify(next));
      localStorage.setItem(migrationKey,"1");
    }catch{}
  }

  if(typeof renderAll==="function") renderAll();
})();

  /* PROGRAM_PATCH_2026_09_22 */
  (function patchFn(){
  if(typeof SHEETS==="undefined" || !Array.isArray(SHEETS["100 Günlük Plan"])) return;
  const rows=SHEETS["100 Günlük Plan"].slice(1);
  const split=v=>v==null?[]:String(v).split("\n").filter(x=>String(x).trim() && String(x).trim()!=="Yok");
  const join=arr=>{const a=arr.filter(x=>String(x).trim() && String(x).trim()!=="Yok");return a.length?a.join("\n"):"Yok"};
  const row=d=>rows[d-1];
  const addLine=(r,col,text,where="end")=>{
    if(!r||!text)return;
    const a=split(r[col]).filter(x=>x!==text);
    if(where==="afterMath"){
      const i=a.findIndex(x=>x.startsWith("Matematik:"));
      a.splice(i>=0?i+1:a.length,0,text);
    }else if(where==="first"){
      a.unshift(text);
    }else{
      a.push(text);
    }
    r[col]=join(a);
  };

  const oldTaskSnapshot={};
  if(typeof stageTasks==="function"){
    for(let d=1;d<=100;d++){
      oldTaskSnapshot[d]={};
      for(const st of ["tyt","ayt","rutin","brans"]){
        oldTaskSnapshot[d][st]=stageTasks(row(d),st).slice();
      }
    }
  }

  const aytMoves={Fizik:[],Kimya:[],Biyoloji:[]};
  const aytBranchMoves={Fizik:[],Kimya:[],Biyoloji:[]};

  for(const r of rows){
    const d=Number(r[0]);

    for(const subject of ["Fizik","Kimya","Biyoloji"]){
      for(const text of split(r[3])){
        if(text.startsWith(subject+":")) aytMoves[subject].push({d,text});
      }
      for(const text of split(r[5])){
        if(text==="AYT "+subject+" branş denemesi") aytBranchMoves[subject].push({d,text});
      }
    }

    r[2]=join(split(r[2]).filter(x=>
      !x.startsWith("Fizik:") &&
      !x.startsWith("Kimya:") &&
      !x.startsWith("Biyoloji:")
    ));

    r[3]=join(split(r[3]).filter(x=>
      !x.startsWith("Fizik:") &&
      !x.startsWith("Kimya:") &&
      !x.startsWith("Biyoloji:")
    ));

    r[5]=join(split(r[5]).filter(x=>
      x!=="TYT Fizik: 2 branş denemesi" &&
      x!=="TYT Kimya: 2 branş denemesi" &&
      x!=="TYT Biyoloji: 2 branş denemesi" &&
      x!=="AYT Fizik branş denemesi" &&
      x!=="AYT Kimya branş denemesi" &&
      x!=="AYT Biyoloji branş denemesi"
    ));
  }

  const tytPhysics={
    6:"Fizik: Optik (1/4)",
    7:"Fizik: Optik (2/4)",
    8:"Fizik: Optik (3/4)",
    9:"Fizik: Optik (4/4)",
    10:"Fizik: Dalgalar",
    11:"Fizik: Kaldırma Kuvveti (1/2)",
    12:"Fizik: Kaldırma Kuvveti (2/2)",
    13:"Fizik: Elektrostatik",
    14:"Fizik: Elektrik Yükleri",
    15:"Fizik: Elektrik Akımı",
    16:"Fizik: Elektrik Devreleri",
    17:"Fizik: Direnç",
    18:"Fizik: Seri – Paralel Bağlama",
    19:"Fizik: Manyetizma / Mıknatıslar"
  };

  const tytChem={
    6:"Kimya: Gazlar",
    7:"Kimya: Buhar Basıncı",
    8:"Kimya: Asit – Baz – Tuz (1/2)",
    9:"Kimya: Asit – Baz – Tuz (2/2)"
  };

  const tytBio={
    6:"Biyoloji: Hücre Bölünmeleri: Mayoz",
    7:"Biyoloji: Üreme",
    8:"Biyoloji: Kalıtım (1/2)",
    9:"Biyoloji: Kalıtım (2/2)"
  };

  for(const [d,text] of Object.entries(tytPhysics)) addLine(row(Number(d)),2,text,"afterMath");
  for(const [d,text] of Object.entries(tytChem)) addLine(row(Number(d)),2,text,"end");
  for(const [d,text] of Object.entries(tytBio)) addLine(row(Number(d)),2,text,"end");

  const shifts={Fizik:7,Kimya:3,Biyoloji:4};
  const aytEnd={};

  for(const subject of ["Fizik","Kimya","Biyoloji"]){
    let last=0;
    for(const m of aytMoves[subject]){
      const nd=m.d+shifts[subject];
      if(nd<=100){
        addLine(row(nd),3,m.text,"end");
        last=Math.max(last,nd);
      }
    }
    aytEnd[subject]=last;

    for(const m of aytBranchMoves[subject]){
      const nd=m.d+shifts[subject];
      if(nd<=100) addLine(row(nd),5,m.text,"end");
    }
  }

  for(let d=20;d<=100;d++) addLine(row(d),5,"TYT Fizik: 2 branş denemesi","end");
  for(let d=10;d<=100;d++) addLine(row(d),5,"TYT Kimya: 2 branş denemesi","end");
  for(let d=10;d<=100;d++) addLine(row(d),5,"TYT Biyoloji: 2 branş denemesi","end");

  const generic="Konu zincirini koru; hızdan önce doğru yöntemi oturt.";
  for(const d of [6,10,20]) if(row(d)) row(d)[6]=generic;
  row(10)[6]="TYT Kimya ve TYT Biyoloji bitti → AYT Kimya ve AYT Biyoloji başladı.";
  row(20)[6]="TYT Fizik bitti → AYT Fizik başladı.";

  const cp=SHEETS["Kontrol Paneli"];
  if(Array.isArray(cp)){
    const physics=cp.find(r=>Array.isArray(r)&&r[0]==="Fizik");
    if(physics){
      physics[1]="19. gün";
      physics[2]="20. gün";
      physics[3]="20. günden itibaren günde 2 TYT mini branş; AYT ana konu "+(aytEnd.Fizik||77)+". gün biter.";
    }
    const chem=cp.find(r=>Array.isArray(r)&&r[0]==="Kimya");
    if(chem){
      chem[1]="9. gün";
      chem[2]="10. gün";
      chem[3]="10. günden itibaren günde 2 TYT mini branş; AYT ana konu "+(aytEnd.Kimya||0)+". gün biter.";
    }
    const bio=cp.find(r=>Array.isArray(r)&&r[0]==="Biyoloji");
    if(bio){
      bio[1]="9. gün";
      bio[2]="10. gün";
      bio[3]="10. günden itibaren günde 2 TYT mini branş; AYT ana konu "+(aytEnd.Biyoloji||50)+". gün biter.";
    }
  }

  const migrationKey="yusuf100-program-patch-20260922-v1";
  if(!localStorage.getItem(migrationKey) && typeof stageTasks==="function"){
    try{
      const oldState=JSON.parse(localStorage.getItem("yusuf100-item-progress-v3")||"{}");
      const next={};
      for(const [k,v] of Object.entries(oldState)){
        if(!/^\d+:(tyt|ayt|rutin|brans):\d+$/.test(k)) next[k]=v;
      }
      for(let d=1;d<=100;d++){
        for(const st of ["tyt","ayt","rutin","brans"]){
          const before=oldTaskSnapshot[d]?.[st]||[];
          const after=stageTasks(row(d),st);
          const used=new Set();
          before.forEach((txt,i)=>{
            if(!oldState[d+":"+st+":"+i]) return;
            const j=after.findIndex((x,idx)=>!used.has(idx)&&x===txt);
            if(j>=0){
              used.add(j);
              next[d+":"+st+":"+j]=true;
            }
          });
        }
      }
      localStorage.setItem("yusuf100-item-progress-v3",JSON.stringify(next));
      localStorage.setItem(migrationKey,"1");
    }catch{}
  }

  if(typeof renderAll==="function") renderAll();
})();

  const style=document.createElement('style');
  style.textContent=`
  .pwaTopActions{display:flex;align-items:center;gap:10px}.pwaInstallBtn{appearance:none;border:1px solid rgba(101,226,194,.32);background:linear-gradient(135deg,rgba(101,226,194,.18),rgba(101,226,194,.07));color:#dffff7;border-radius:13px;padding:10px 14px;font:inherit;font-size:12px;font-weight:900;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.18);transition:.2s;white-space:nowrap}.pwaInstallBtn:hover{transform:translateY(-1px);border-color:rgba(101,226,194,.6);background:linear-gradient(135deg,rgba(101,226,194,.26),rgba(101,226,194,.1))}.pwaInstallBtn:disabled{opacity:.68;cursor:default;transform:none}.pwaModal{position:fixed;inset:0;background:rgba(3,6,10,.78);backdrop-filter:blur(10px);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px}.pwaModal.show{display:flex}.pwaDialog{width:min(520px,100%);background:linear-gradient(180deg,#151d28,#0f151e);border:1px solid #2a3748;border-radius:22px;box-shadow:0 30px 100px rgba(0,0,0,.55);padding:24px;color:#f4f7fb}.pwaDialogTop{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.pwaDialog h3{margin:0 0 6px;font-size:22px}.pwaDialog p{margin:0;color:#8c98aa;line-height:1.55}.pwaClose{border:1px solid #263140;background:#161e29;color:#f4f7fb;width:36px;height:36px;border-radius:11px;cursor:pointer;font-size:20px}.pwaSteps{display:grid;gap:9px;margin:18px 0}.pwaStep{display:flex;gap:11px;align-items:flex-start;padding:12px;border:1px solid #263140;border-radius:13px;background:rgba(255,255,255,.025)}.pwaStep i{font-style:normal;width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:rgba(101,226,194,.14);color:#65e2c2;font-weight:950;flex:none}.pwaStep b{display:block;font-size:13px;margin-bottom:2px}.pwaStep span{font-size:12px;color:#8c98aa;line-height:1.45}.pwaFoot{font-size:11px;color:#8c98aa}.pwaReady{color:#65e2c2;font-weight:800}.pwaChip{font-size:10px;border:1px solid rgba(101,226,194,.22);color:#99ffe5;padding:5px 8px;border-radius:999px;background:rgba(101,226,194,.06)}
  @media(max-width:620px){.pwaTopActions{gap:6px}.pwaInstallBtn{padding:9px 10px;font-size:11px}.pwaTopActions .premiumTag{display:none}}
  `;
  document.head.appendChild(style);

  const isMac=/Macintosh|Mac OS X/i.test(navigator.userAgent);
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let deferredPrompt=null;

  const header=document.querySelector('header.top');
  if(header){
    const oldTag=header.querySelector('.premiumTag');
    const actions=document.createElement('div');actions.className='pwaTopActions';
    if(oldTag){oldTag.replaceWith(actions);actions.appendChild(oldTag)}else header.appendChild(actions);
    const btn=document.createElement('button');btn.type='button';btn.className='pwaInstallBtn';btn.id='pwaInstallBtn';actions.appendChild(btn);
    updateButton();
    btn.addEventListener('click',installOrHelp);
  }

  const modal=document.createElement('div');modal.className='pwaModal';modal.id='pwaModal';modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="pwaDialog" role="dialog" aria-modal="true" aria-labelledby="pwaTitle"><div class="pwaDialogTop"><div><h3 id="pwaTitle">MacBook’a uygulama olarak yükle</h3><p>100 Gün uygulaması Dock’tan açılabilen bağımsız bir pencere olarak kullanılabilir.</p></div><button class="pwaClose" id="pwaClose" aria-label="Kapat">×</button></div><div class="pwaSteps"><div class="pwaStep"><i>1</i><div><b>Safari kullanıyorsan</b><span>macOS Sonoma veya daha yenide üst menüden <strong>Dosya → Dock’a Ekle…</strong> seç.</span></div></div><div class="pwaStep"><i>2</i><div><b>Chrome / Edge kullanıyorsan</b><span>Bu düğme destekleniyorsa kurulum penceresini doğrudan açar. Açılmazsa adres çubuğundaki yükleme simgesini kullan.</span></div></div><div class="pwaStep"><i>3</i><div><b>Kurulumdan sonra</b><span>Uygulama ayrı pencerede açılır. İstersen Dock’ta kalıcı tutabilirsin.</span></div></div></div><div class="pwaFoot">GitHub Pages sürümü güncellendiğinde uygulama da internet bağlantısıyla güncel sürümü alır.</div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('#pwaClose').addEventListener('click',hideHelp);
  modal.addEventListener('click',e=>{if(e.target===modal)hideHelp()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideHelp()});

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;updateButton()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;updateButton()});
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change',updateButton);

  async function installOrHelp(){
    if(isStandalone()) return;
    if(deferredPrompt){
      deferredPrompt.prompt();
      try{await deferredPrompt.userChoice}catch{}
      deferredPrompt=null;updateButton();return;
    }
    showHelp();
  }
  function updateButton(){
    const btn=document.getElementById('pwaInstallBtn');if(!btn)return;
    if(isStandalone()){btn.textContent='✓ Uygulama yüklü';btn.disabled=true;return}
    btn.disabled=false;btn.textContent=isMac?"Mac'e yükle":"Uygulamayı yükle";
  }
  function showHelp(){modal.classList.add('show');modal.setAttribute('aria-hidden','false')}
  function hideHelp(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}

  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
})();
