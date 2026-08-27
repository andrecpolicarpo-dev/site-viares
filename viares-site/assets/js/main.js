(() => {
  const C = window.VIARES_CONFIG || {};
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];

  const menu = $('[data-menu-toggle]');
  const nav = $('[data-mobile-nav]');
  if(menu && nav){
    menu.addEventListener('click',()=>{
      const open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open',open);
    });
    $$('a',nav).forEach(a=>a.addEventListener('click',()=>{
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded','false');
      document.body.classList.remove('nav-open');
    }));
  }

  const phone = String(C.whatsappNumber || '').replace(/\D/g,'');
  $$('[data-whatsapp]').forEach(el=>{
    if(phone.length >= 12){
      const msg = el.dataset.message || C.whatsappDefaultMessage || '';
      el.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      el.hidden = false;
      el.addEventListener('click',()=>trackLead('whatsapp'));
    }else{
      el.hidden = true;
    }
  });

  $$('[data-email]').forEach(el=>{
    const email = C.email || 'contato@viares.eng.br';
    const span = el.querySelector('[data-email-text]');
    if(span) span.textContent = email; else if(!el.children.length) el.textContent = email;
    if(el.tagName === 'A') el.href = `mailto:${email}`;
  });

  const form = $('[data-lead-form]');
  if(form){
    if(C.formEndpoint) form.action = C.formEndpoint;
    const p = new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'].forEach(k=>{
      const v = p.get(k) || sessionStorage.getItem('viares_'+k) || '';
      const input = form.querySelector(`[name="${k}"]`);
      if(input) input.value = v;
      if(p.get(k)) sessionStorage.setItem('viares_'+k,p.get(k));
    });
    const origem = form.querySelector('[name="pagina_origem"]');
    if(origem) origem.value = location.href;
    form.addEventListener('submit',()=>trackLead('form_submit'));
  }

  $$('[data-faq-button]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item = btn.closest('.faq-item');
      const ans = item.querySelector('.faq-answer');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded',String(open));
      ans.hidden = !open;
    });
  });

  const els = $$('[data-reveal]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }),{threshold:.12});
    els.forEach(e=>io.observe(e));
  } else els.forEach(e=>e.classList.add('is-visible'));

  $$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());

  const ids=[C.ga4MeasurementId,C.googleAdsId].filter(Boolean);
  if(ids.length){
    const s=document.createElement('script');
    s.async=true; s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date());
    if(C.ga4MeasurementId) gtag('config',C.ga4MeasurementId);
    if(C.googleAdsId) gtag('config',C.googleAdsId);
  }

  function trackLead(source){
    if(typeof window.gtag!=='function') return;
    gtag('event','generate_lead',{lead_source:source});
    if(C.googleAdsId && C.googleAdsConversionLabel){
      gtag('event','conversion',{send_to:`${C.googleAdsId}/${C.googleAdsConversionLabel}`});
    }
  }
})();