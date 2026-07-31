const M="https://scoot.nl/wrapped",N="Mijn SCOOT Wrapped 2026: 1.284 km door Utrecht, 0 overtredingen — De Grachtenganger.",J=[38,30,46,58,52,72,66,60,78,100,64,44];let r=null,p=0,j=null,b=0,G=null;const C=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;function c(t,s){return getComputedStyle(document.documentElement).getPropertyValue(t).trim()||s}function X(){const t=Array.from({length:6},()=>'<span class="wrapped-seg"><i></i></span>').join(""),s=J.map((a,e)=>`<i class="wrapped-bar${a===100?" wrapped-bar-top":""}" style="--h:${a}%;--d:${(.3+e*.055).toFixed(3)}s"></i>`).join("");return`
    <div class="wrapped-bg"></div>

    <div class="wrapped-progress">${t}</div>
    <button class="wrapped-close" type="button" aria-label="Sluiten">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 1 · intro -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">SCOOT</p>
        <p class="wrapped-huge wrapped-anim" style="--d:.08s">2026</p>
        <h2 class="wrapped-title wrapped-anim" style="--d:.18s">Jouw jaar op de scooter</h2>
        <p class="wrapped-sub wrapped-anim" style="--d:.28s">We hebben je ritten door Utrecht op een rij gezet. Even terugkijken?</p>
      </div>
      <button class="wrapped-pill wrapped-anim wrapped-start" style="--d:.38s" type="button">Bekijk je jaar</button>
    </section>

    <!-- 2 · kilometers -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Je reed dit jaar</p>
        <p class="wrapped-huge wrapped-counter wrapped-anim" style="--d:.08s">0</p>
        <p class="wrapped-title wrapped-anim" style="--d:.16s">kilometer</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.26s">Dat zijn 31 rondjes om de Singel. Of, als je was doorgereden, Utrecht tot Barcelona.</p>
      </div>
      <div class="wrapped-chart" aria-hidden="true">${s}</div>
      <div class="wrapped-chart-labels" aria-hidden="true"><span>jan</span><span>dec</span></div>
    </section>

    <!-- 3 · favoriete plek -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Je kwam het vaakst bij</p>
        <p class="wrapped-big wrapped-anim" style="--d:.08s">Domplein</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">47 keer. Gemiddeld op dinsdagavond, meestal vanaf de Oudegracht.</p>
        <ol class="wrapped-ranking">
          <li class="wrapped-rank wrapped-anim" style="--d:.32s"><span class="wrapped-rank-nr">1</span><b>Domplein</b><small>47 ritten</small></li>
          <li class="wrapped-rank wrapped-anim" style="--d:.44s"><span class="wrapped-rank-nr">2</span><b>Utrecht Centraal</b><small>31 ritten</small></li>
          <li class="wrapped-rank wrapped-anim" style="--d:.56s"><span class="wrapped-rank-nr">3</span><b>Wilhelminapark</b><small>22 ritten</small></li>
        </ol>
      </div>
    </section>

    <!-- 4 · zonediscipline -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Verboden zones ingereden</p>
        <p class="wrapped-huge wrapped-anim" style="--d:.08s">0</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">keer. Dat lukt niet veel mensen: je zit in de top 3% van alle rijders in Utrecht.</p>
        <div class="wrapped-badge wrapped-anim" style="--d:.32s">
          <span class="wrapped-badge-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" fill="currentColor" opacity=".25"/>
              <path d="M8.5 12.2l2.4 2.4 4.6-4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span><b>Zonemeester</b><small>Heel 2026 binnen de lijntjes</small></span>
        </div>
      </div>
      <p class="wrapped-note wrapped-anim" style="--d:.46s">Onderweg kreeg je 12 waarschuwingen voor een naderende zone. Elke keer week je op tijd uit.</p>
    </section>

    <!-- 5 · rijderstype -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Jouw rijderstype</p>
        <p class="wrapped-big wrapped-anim" style="--d:.08s">De Grachten-<br>ganger</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">Je blijft het liefst binnen de Singel, rijdt rustig en kiest bijna altijd de route langs het water, ook als die iets langer is.</p>
        <dl class="wrapped-statlist">
          <div class="wrapped-statrow wrapped-anim" style="--d:.32s"><dt>Gemiddelde rit</dt><dd>2,8 km</dd></div>
          <div class="wrapped-statrow wrapped-anim" style="--d:.44s"><dt>Favoriete tijd</dt><dd>dinsdag 18:00</dd></div>
          <div class="wrapped-statrow wrapped-anim" style="--d:.56s"><dt>Rustigste maand</dt><dd>februari</dd></div>
        </dl>
      </div>
    </section>

    <!-- 6 · deelkaart -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <h2 class="wrapped-title wrapped-anim">Deel je jaar</h2>
        <div class="wrapped-card wrapped-anim" style="--d:.12s">
          <span class="wrapped-card-mini">Groenten en fruit</span>
          <p class="wrapped-card-label">SCOOT 2026</p>
          <p class="wrapped-card-title">Fabian reed 1.284 km door Utrecht</p>
          <div class="wrapped-chips">
            <div class="wrapped-chip"><b>47×</b><small>Domplein</small></div>
            <div class="wrapped-chip"><b>0</b><small>overtredingen</small></div>
            <div class="wrapped-chip"><b>top 3%</b><small>van Utrecht</small></div>
          </div>
          <span class="wrapped-card-type">De Grachtenganger</span>
          <p class="wrapped-card-foot">scoot.nl/wrapped</p>
        </div>
      </div>
      <div class="wrapped-actions wrapped-anim" style="--d:.26s">
        <button class="wrapped-pill wrapped-share" type="button">Deel je kaart</button>
        <button class="wrapped-pill wrapped-ghost wrapped-save" type="button">Bewaar als afbeelding</button>
      </div>
    </section>

    <div class="wrapped-toast" role="status">Gekopieerd</div>
  `}function g(t){p=Math.max(0,Math.min(5,t)),r.querySelectorAll(".wrapped-step").forEach((s,a)=>{s.classList.toggle("wrapped-active",a===p)}),r.querySelectorAll(".wrapped-seg").forEach((s,a)=>{s.classList.toggle("wrapped-done",a<p),s.classList.toggle("wrapped-active",a===p)}),V(),p===1&&K(),Y()}function E(){p<5&&g(p+1)}function _(){g(Math.max(0,p-1))}function Y(){clearTimeout(j),!(p>=5||C())&&(j=setTimeout(()=>g(p+1),7e3))}function V(){const t=r.querySelector(".wrapped-bg");if(C()){t.style.transform="";return}t.style.transform=`translateX(${p*-12}px) scale(${(1.03+p*.012).toFixed(3)})`}function K(){const t=r.querySelector(".wrapped-counter");if(cancelAnimationFrame(b),C()){t.textContent=1284 .toLocaleString("nl-NL");return}const s=performance.now(),a=e=>{const n=Math.min(1,(e-s)/1600),d=1-Math.pow(1-n,3);t.textContent=Math.round(1284*d).toLocaleString("nl-NL"),n<1&&(b=requestAnimationFrame(a))};t.textContent="0",b=requestAnimationFrame(a)}function P(t){t.key==="Escape"?W():t.key==="ArrowRight"?E():t.key==="ArrowLeft"&&_()}function W(){clearTimeout(j),cancelAnimationFrame(b),document.removeEventListener("keydown",P),r.classList.remove("wrapped-open")}function Z(){const t=r.querySelector(".wrapped-toast");t.classList.add("wrapped-visible"),clearTimeout(G),G=setTimeout(()=>t.classList.remove("wrapped-visible"),1800)}async function Q(){const t={title:"SCOOT Wrapped 2026",text:N,url:M};if(navigator.share){try{await navigator.share(t)}catch{}return}try{await navigator.clipboard.writeText(`${N} ${M}`),Z()}catch{}}function h(t,s,a,e,n,d){if(typeof t.roundRect=="function"){t.beginPath(),t.roundRect(s,a,e,n,d);return}t.beginPath(),t.moveTo(s+d,a),t.arcTo(s+e,a,s+e,a+n,d),t.arcTo(s+e,a+n,s,a+n,d),t.arcTo(s,a+n,s,a,d),t.arcTo(s,a,s+e,a,d),t.closePath()}async function ee(){try{await Promise.all([document.fonts.load('600 92px "DM Sans"'),document.fonts.load('700 44px "DM Sans"'),document.fonts.load('400 28px "DM Sans"')])}catch{}const t=1080,s=1350,a=document.createElement("canvas");a.width=t,a.height=s;const e=a.getContext("2d"),n=o=>`${o} "DM Sans", system-ui, sans-serif`,d=c("--violet-500","#8b5cf6"),O=c("--violet-700","#6d3ae6"),q=c("--violet-50","#f5f3ff"),$=c("--ink","#0f172a"),B=c("--ink-3","#64748b"),F=c("--paper","#ffffff"),u=e.createLinearGradient(0,0,0,s);u.addColorStop(0,d),u.addColorStop(.55,"#5b21b6"),u.addColorStop(1,"#2e1065"),e.fillStyle=u,e.fillRect(0,0,t,s);const y=90,l=170,T=900,H=1010;e.save(),e.shadowColor="rgba(15, 23, 42, 0.4)",e.shadowBlur=60,e.shadowOffsetY=26,h(e,y,l,T,H,56),e.fillStyle=F,e.fill(),e.restore();const R=74,i=y+R;e.textBaseline="alphabetic",e.fillStyle=d,e.font=n("700 34px"),"letterSpacing"in e&&(e.letterSpacing="3px"),e.fillText("SCOOT 2026",i,l+118),"letterSpacing"in e&&(e.letterSpacing="0px"),e.fillStyle=$,e.font=n("600 92px"),e.fillText("Fabian reed",i,l+250),e.fillText("1.284 km",i,l+362),e.fillText("door Utrecht",i,l+474);const z=[["47×","Domplein"],["0","overtredingen"],["top 3%","van Utrecht"]],U=24,L=(T-R*2-U*2)/3,x=150,f=l+540;z.forEach(([o,v],w)=>{const S=i+w*(L+U);h(e,S,f,L,x,24),e.fillStyle=q,e.fill(),e.fillStyle=O,e.font=n("700 44px"),e.fillText(o,S+30,f+66),e.fillStyle=B,e.font=n("400 27px"),e.fillText(v,S+30,f+114)}),e.font=n("600 36px");const D="De Grachtenganger",I=e.measureText(D).width+76,k=f+x+60;h(e,i,k,I,78,39),e.fillStyle="#fdecbc",e.fill(),e.fillStyle="#92610f",e.fillText(D,i+38,k+51),e.fillStyle="#94a3b8",e.font=n("400 28px"),e.fillText("scoot.nl/wrapped",i,k+172),e.save(),e.font=n("700 27px");const A="Groenten en fruit",m=e.measureText(A).width+60;e.translate(y+T-m/2-46,l+4),e.rotate(5*Math.PI/180),h(e,-m/2,-29,m,58,29),e.fillStyle=O,e.fill(),e.fillStyle="#ffffff",e.fillText(A,-m/2+30,10),e.restore(),a.toBlob(o=>{if(!o)return;const v=URL.createObjectURL(o),w=document.createElement("a");w.href=v,w.download="scoot-wrapped-2026.png",w.click(),setTimeout(()=>URL.revokeObjectURL(v),4e3)},"image/png")}function te(){r||(r=document.createElement("div"),r.className="wrapped",r.innerHTML=X(),document.body.appendChild(r),r.querySelector(".wrapped-close").addEventListener("click",W),r.querySelector(".wrapped-start").addEventListener("click",E),r.querySelector(".wrapped-share").addEventListener("click",Q),r.querySelector(".wrapped-save").addEventListener("click",ee),r.addEventListener("click",t=>{t.target.closest("button")||(t.clientX>=window.innerWidth/2?E():_())}))}function ae(){r||te(),r.classList.add("wrapped-open"),document.addEventListener("keydown",P),g(0),r.querySelector(".wrapped-close").focus({preventScroll:!0})}export{te as initWrapped,ae as openWrapped};
