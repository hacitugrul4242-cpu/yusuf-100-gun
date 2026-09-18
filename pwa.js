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
