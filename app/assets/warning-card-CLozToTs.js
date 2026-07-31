var E=Object.defineProperty;var x=e=>{throw TypeError(e)};var j=(e,i,t)=>i in e?E(e,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[i]=t;var y=(e,i,t)=>j(e,typeof i!="symbol"?i+"":i,t),g=(e,i,t)=>i.has(e)||x("Cannot "+t);var h=(e,i,t)=>(g(e,i,"read from private field"),t?t.call(e):i.get(e)),b=(e,i,t)=>i.has(e)?x("Cannot add the same private member more than once"):i instanceof WeakSet?i.add(e):i.set(e,t),k=(e,i,t,r)=>(g(e,i,"write to private field"),r?r.call(e,t):i.set(e,t),t),f=(e,i,t)=>(g(e,i,"access private method"),t);const z={verboden:{tone:"danger",title:"Je rijdt in een niet-toegestane zone",body:"Deze rijzone is niet toegestaan voor jouw type scooter. Verlaat de zone zodra dit veilig kan.",cta:"Route herbereken"},nadert:{tone:"danger",title:e=>`Verboden zone over ${e.distance?Math.max(10,Math.round(e.distance/10)*10)+" m":"enkele meters"}`,body:e=>e.zone?`Je nadert ${e.zone}. Volg de route, die buigt er vanzelf omheen.`:"Je nadert een verboden zone. Volg de route, die buigt er vanzelf omheen.",cta:"Route herbereken"},venstertijd:{tone:"danger",title:"Je rijdt in een niet-toegestane zone",body:e=>e.window?`Binnen de venstertijd (${e.window.replace(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/,"$1 tot $2")}) is dit gebied gesloten voor jouw type scooter.`:"Deze rijzone is niet toegestaan voor jouw type scooter. Verlaat de zone zodra dit veilig kan.",cta:"Route herbereken"},rijbaan:{tone:"caution",title:"Je gaat naar de rijbaan",body:"Vanaf hier rijdt de snorfiets op de rijbaan. Daarmee geldt een helmplicht op dit weggedeelte.",cta:"Begrepen"},"geen-route":{tone:"neutral",title:"Geen route gevonden",body:"We vonden geen route die alle verboden zones vermijdt. Kies een bestemming iets verderop, of loop het laatste stuk.",cta:"Andere bestemming"}},C=`
<style>
  :host {
    /* palette: host tokens first, SCOOT fallbacks second */
    --sw-danger:      var(--danger, #ef4444);
    --sw-danger-deep: #b91c1c;
    --sw-danger-ink:  #7f1d1d;
    --sw-caution:      var(--caution, #f59e0b);
    --sw-caution-deep: #b45309;
    --sw-caution-ink:  #713f12;
    --sw-neutral-deep: #475569;
    --sw-ink:   var(--ink, #0f172a);
    --sw-ink-2: var(--ink-2, #334155);
    --sw-ink-3: var(--ink-3, #64748b);

    display: block;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }

  .card {
    position: relative;
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--edge);
    border-radius: 16px;
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.05),
      0 14px 36px -10px var(--glow);
    animation: in 0.5s cubic-bezier(0.3, 1.25, 0.4, 1);
  }
  @keyframes in {
    from { transform: translateY(-14px) scale(0.97); opacity: 0; }
  }

  /* tinted header band: the alert reads at a glance, the body
     stays on calm white — crisper than an all-over tint */
  .head {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 14px;
    background: var(--tint);
    border-bottom: 1px solid var(--edge);
  }
  .icon {
    width: 34px;
    height: 34px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: #fff;
    background: linear-gradient(160deg, var(--hue), var(--deep));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
    animation: nudge 0.55s cubic-bezier(0.36, 1.6, 0.5, 1) 0.15s backwards;
  }
  @keyframes nudge { from { transform: scale(0.5) rotate(-8deg); } }
  .title {
    flex: 1;
    min-width: 0;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.3;
    color: var(--title);
    text-wrap: balance;
  }
  .close {
    align-self: flex-start;
    margin: -4px -4px 0 0;
    border: 0;
    background: none;
    cursor: pointer;
    padding: 4px;
    color: var(--title);
    opacity: 0.45;
    line-height: 0;
    border-radius: 6px;
    transition: opacity 0.15s;
  }
  .close:hover { opacity: 0.9; }
  .close:focus-visible { outline: 2px solid var(--hue); outline-offset: 1px; opacity: 1; }

  .body {
    margin: 0;
    padding: 12px 16px 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--sw-ink-2);
  }
  .actions { padding: 12px 12px 12px; }
  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 46px;
    border: 0;
    border-radius: 11px;
    cursor: pointer;
    background: var(--deep);
    color: #fff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.005em;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 1px 2px rgba(15, 23, 42, 0.15);
    transition: filter 0.15s, transform 0.1s;
  }
  .cta:hover { filter: brightness(1.12); }
  .cta:active { transform: translateY(1px); }
  .cta:focus-visible { outline: 2px solid var(--hue); outline-offset: 2px; }
  .cta svg { transition: transform 0.15s; }
  .cta:hover svg { transform: translateX(2px); }

  /* auto-dismiss indicator: 2px hairline draining along the bottom */
  .timer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--hue);
    opacity: 0.55;
    transform-origin: left;
    animation: drain linear forwards;
  }
  @keyframes drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }

  /* tone palettes */
  .card { --hue: var(--sw-danger); --deep: var(--sw-danger-deep); --title: var(--sw-danger-ink);
          --tint: #fdf5f5; --edge: rgba(239, 68, 68, 0.22); --glow: rgba(239, 68, 68, 0.28); }
  .card.caution { --hue: var(--sw-caution); --deep: var(--sw-caution-deep); --title: var(--sw-caution-ink);
          --tint: #fdf9ee; --edge: rgba(245, 158, 11, 0.28); --glow: rgba(245, 158, 11, 0.26); }
  .card.neutral { --hue: #94a3b8; --deep: var(--sw-neutral-deep); --title: var(--sw-ink);
          --tint: #f8fafc; --edge: rgba(100, 116, 139, 0.22); --glow: rgba(15, 23, 42, 0.14); }

  @media (prefers-reduced-motion: reduce) {
    .card, .icon { animation: none; }
    .timer { display: none; }
  }
</style>
<div class="card" part="card">
  <div class="head">
    <span class="icon" aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.8 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5V14M12 17.5h.01"/></svg>
    </span>
    <span class="title" id="title"></span>
    <button class="close" aria-label="Waarschuwing sluiten">
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div>
  <p class="body" id="body"></p>
  <div class="actions">
    <button class="cta">
      <span id="cta-text"></span>
      <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
    </button>
  </div>
</div>`;var l,p,m;class A extends HTMLElement{constructor(){super();b(this,p);b(this,l,null);this.attachShadow({mode:"open"}).innerHTML=C,this.shadowRoot.querySelector(".close").addEventListener("click",()=>this.dismiss()),this.shadowRoot.querySelector(".cta").addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("scoot-action",{bubbles:!0,composed:!0}))})}connectedCallback(){f(this,p,m).call(this)}attributeChangedCallback(){this.isConnected&&f(this,p,m).call(this)}dismiss(){clearTimeout(h(this,l)),this.dispatchEvent(new CustomEvent("scoot-dismiss",{bubbles:!0,composed:!0}));const t=this.shadowRoot.querySelector(".card");t.style.transition="opacity .18s ease, transform .18s ease",t.style.opacity="0",t.style.transform="translateY(-8px) scale(.98)",setTimeout(()=>this.remove(),180)}}l=new WeakMap,p=new WeakSet,m=function(){var u;const t=z[this.getAttribute("variant")]??z.verboden,r={zone:this.getAttribute("zone")??void 0,distance:Number(this.getAttribute("distance"))||void 0,window:this.getAttribute("window")??void 0},c=o=>typeof o=="function"?o(r):o,s=this.shadowRoot.querySelector(".card");s.classList.toggle("caution",t.tone==="caution"),s.classList.toggle("neutral",t.tone==="neutral"),this.shadowRoot.getElementById("title").textContent=this.getAttribute("title")||c(t.title),this.shadowRoot.getElementById("body").textContent=this.getAttribute("body")||c(t.body),this.shadowRoot.getElementById("cta-text").textContent=this.getAttribute("cta")||t.cta,clearTimeout(h(this,l)),(u=this.shadowRoot.querySelector(".timer"))==null||u.remove();const d=this.hasAttribute("duration")?Number(this.getAttribute("duration")):0;if(d>0){const o=document.createElement("span");o.className="timer",o.style.animationDuration=d+"ms",s.appendChild(o),k(this,l,setTimeout(()=>this.dismiss(),d))}},y(A,"observedAttributes",["variant","zone","distance","window","title","body","cta","duration"]);customElements.get("scoot-warning")||customElements.define("scoot-warning",A);let a=null;function M({variant:e="verboden",zone:i,distance:t,window:r,title:c,body:s,cta:d,duration:u=0,onAction:o,onDismiss:v}={}){var w;a||(a=document.createElement("div"),a.style.cssText="position:fixed;z-index:70;left:14px;right:14px;top:calc(14px + env(safe-area-inset-top));max-width:452px;margin:0 auto;pointer-events:none;",document.body.appendChild(a)),(w=a.querySelector("scoot-warning"))==null||w.remove();const n=document.createElement("scoot-warning");return n.style.pointerEvents="auto",n.setAttribute("variant",e),i&&n.setAttribute("zone",i),t&&n.setAttribute("distance",String(t)),r&&n.setAttribute("window",r),c&&n.setAttribute("title",c),s&&n.setAttribute("body",s),d&&n.setAttribute("cta",d),u&&n.setAttribute("duration",String(u)),o&&n.addEventListener("scoot-action",o),v&&n.addEventListener("scoot-dismiss",v),a.appendChild(n),n}function R(){return!!(a!=null&&a.querySelector("scoot-warning"))}export{A as ScootWarning,M as showWarning,R as warningVisible};
