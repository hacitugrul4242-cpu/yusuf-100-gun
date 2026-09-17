(()=>{
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
