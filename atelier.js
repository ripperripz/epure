/* Product, form and accessibility behavior. Editorial choreography lives in motion.js. */
(() => {
  'use strict';
  const config = window.ATELIER;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  let manuallyReduced = false;
  try { manuallyReduced = localStorage.getItem('epure-reduced-motion') === 'true'; } catch {}
  const reduced = () => manuallyReduced || reducedQuery.matches;
  const motionButton = document.querySelector('.motion-toggle');
  function syncMotion() {
    html.classList.toggle('reduce-motion', reduced());
    motionButton.setAttribute('aria-pressed', String(reduced()));
    motionButton.textContent = reducedQuery.matches ? 'Reduced motion · system' : reduced() ? 'Enable motion' : 'Reduce motion';
    document.querySelector('.cinematic-hero')?.style.setProperty('--hero-y', '0px');
    document.dispatchEvent(new CustomEvent('atelier:motionchange', {detail:{reduced:reduced()}}));
  }
  motionButton.addEventListener('click', () => {
    if (reducedQuery.matches) return;
    manuallyReduced = !manuallyReduced;
    try { localStorage.setItem('epure-reduced-motion', String(manuallyReduced)); } catch {}
    syncMotion();
  });
  reducedQuery.addEventListener('change', syncMotion);
  syncMotion();

  // The inherited navigation handles focus trapping and Escape via Bootstrap.
  const menu = document.querySelector('#navigation');
  const menuButton = document.querySelector('.btn-menu');
  menu.addEventListener('show.bs.offcanvas', () => {
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close menu');
    document.querySelector('.menu-label').textContent = 'Close';
  });
  menu.addEventListener('hidden.bs.offcanvas', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    document.querySelector('.menu-label').textContent = 'Menu';
  });

  document.querySelector('.back-top').addEventListener('click', () => {
    if(window.lenis)window.lenis.scrollTo(0,{duration:1.1});
    else window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});
    document.querySelector('.wordmark').focus({preventScroll:true});
  });

  // A single scroll frame updates the two authored moments; no wheel interception.
  const hero = document.querySelector('.cinematic-hero');
  const craft = document.querySelector('.craft-story');
  let ticking = false;
  function renderScroll() {
    ticking = false;
    if (reduced() || window.ATELIER_MOTION?.active) return;
    if (hero && scrollY < hero.offsetHeight) hero.style.setProperty('--hero-y', `${Math.min(scrollY * .12,90)}px`);
    if (craft) {
      const rect = craft.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        const progress = Math.min(1,Math.max(0,-rect.top / Math.max(1,rect.height-innerHeight)));
        craft.style.setProperty('--craft-progress', progress.toFixed(4));
      }
    }
  }
  const queueFrame = () => { if (!ticking) {ticking=true;requestAnimationFrame(renderScroll);} };
  window.addEventListener('scroll',queueFrame,{passive:true});
  window.addEventListener('resize',queueFrame,{passive:true});
  queueFrame();

  // Category state stays shareable and survives back/forward navigation.
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  function filterCollection(category, updateURL=false) {
    if (!filterButtons.length) return;
    if (!['all','watches','rings','straps'].includes(category)) category='all';
    filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
    let count=0;
    document.querySelectorAll('.gallery-grid .gallery-piece').forEach(piece=>{
      piece.hidden=category!=='all'&&piece.dataset.category!==category;
      if (!piece.hidden) {count++;piece.dataset.animShow='true';}
    });
    document.querySelector('.gallery-grid').classList.toggle('is-filtered',category!=='all');
    document.querySelector('.gallery-count').textContent=`${count} design ${count===1?'study':'studies'}`;
    if (updateURL) {
      const url=new URL(location.href);
      category==='all'?url.searchParams.delete('category'):url.searchParams.set('category',category);
      history.pushState({},'',url);
    }
    document.dispatchEvent(new CustomEvent('atelier:filterchange'));
  }
  filterButtons.forEach(b=>b.addEventListener('click',()=>filterCollection(b.dataset.filter,true)));
  filterCollection(new URL(location.href).searchParams.get('category')||'all');
  window.addEventListener('popstate',()=>filterCollection(new URL(location.href).searchParams.get('category')||'all'));

  const modal = document.querySelector('#pieceModal');
  const image = document.querySelector('#piece-image');
  const media = document.querySelector('.detail-media');
  const zoom = document.querySelector('#zoom-image');
  const expand = document.querySelector('#expand-image');
  let currentIndex=0;
  const categoryNames={watches:'Bespoke watches',rings:'Fine jewellery & rings',straps:'Bespoke leather straps'};
  function resetImage(){
    modal.classList.remove('image-expanded');media.classList.remove('is-zoomed');image.style.transformOrigin='center';
    zoom.textContent='Zoom in';zoom.setAttribute('aria-pressed','false');
    expand.textContent='Full image';expand.setAttribute('aria-pressed','false');
  }
  function showPiece(index){
    currentIndex=(index+config.products.length)%config.products.length;
    const product=config.products[currentIndex];resetImage();
    image.src=`/assets/atelier/${product.image}-1536.webp`;image.alt=product.alt;
    document.querySelector('#piece-category').textContent=categoryNames[product.category];
    document.querySelector('#piece-title').textContent=product.name;
    document.querySelector('#piece-description').textContent=product.description;
    const list=document.querySelector('#piece-details');list.replaceChildren();
    for(const [term,value] of product.details){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=value;row.append(dt,dd);list.append(row);}
    const action=document.querySelector('#piece-action');action.replaceChildren();
    const a=document.createElement('a');a.className='text-link';
    let purchase=null;try{const u=new URL(product.purchaseUrl);if(['https:','http:'].includes(u.protocol))purchase=u.href;}catch{}
    if(purchase){a.href=purchase;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Buy now — external store';}
    else{a.href=`/contact/?interest=${product.category}&piece=${encodeURIComponent(product.name)}`;a.textContent='Enquire about a personal piece';}
    action.append(a);
    document.querySelector('#piece-count').textContent=`${currentIndex+1} / ${config.products.length}`;
  }
  modal.addEventListener('show.bs.modal',event=>{
    const id=event.relatedTarget?.dataset.piece;
    showPiece(Math.max(0,config.products.findIndex(p=>p.id===id)));
  });
  modal.addEventListener('hidden.bs.modal',resetImage);
  document.querySelectorAll('[data-piece-step]').forEach(b=>b.addEventListener('click',()=>showPiece(currentIndex+Number(b.dataset.pieceStep))));
  zoom.addEventListener('click',()=>{
    const active=media.classList.toggle('is-zoomed');zoom.textContent=active?'Reset zoom':'Zoom in';zoom.setAttribute('aria-pressed',String(active));
  });
  image.addEventListener('click',()=>zoom.click());
  media.addEventListener('pointermove',event=>{
    if(!media.classList.contains('is-zoomed')||event.pointerType==='touch')return;
    const rect=media.getBoundingClientRect();image.style.transformOrigin=`${(event.clientX-rect.left)/rect.width*100}% ${(event.clientY-rect.top)/rect.height*100}%`;
  });
  expand.addEventListener('click',()=>{
    const active=modal.classList.toggle('image-expanded');expand.textContent=active?'Show details':'Full image';expand.setAttribute('aria-pressed',String(active));
  });
  modal.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();showPiece(currentIndex+1)}
    if(event.key==='ArrowLeft'){event.preventDefault();showPiece(currentIndex-1)}
  });

  const form=document.querySelector('#enquiry-form');
  if(form){
    const params=new URL(location.href).searchParams;
    const radio=[...form.querySelectorAll('[name=interest]')].find(r=>r.value===params.get('interest'));
    if(radio)radio.checked=true;
    const piece=params.get('piece');
    if(piece)form.elements.message.value=`I’m interested in ${piece}. My idea is…`;
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const result=document.querySelector('#form-result'),button=form.querySelector('[type=submit]');
      const data=Object.fromEntries(new FormData(form));result.hidden=false;result.replaceChildren();
      if(config.formEndpoint){
        button.disabled=true;button.querySelector('span').textContent='Sending…';
        try{
          const response=await fetch(config.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
          const payload=await response.json().catch(()=>null);
          if(!response.ok||payload?.success!==true)throw new Error('The service did not confirm receipt');
          result.textContent='Your enquiry has been received. Thank you for sharing your idea.';form.reset();
        }catch{result.textContent='Your enquiry could not be confirmed. Your text is still here; please try again or use the atelier’s published contact details.';}
        finally{button.disabled=false;button.querySelector('span').textContent='Send enquiry';}
      }else{
        const note=document.createElement('p');note.textContent='Your draft is ready. Nothing has been sent — this preview has no enquiry endpoint.';result.append(note);
        const download=document.createElement('button');download.type='button';download.className='text-link';download.textContent='Download enquiry draft';
        download.addEventListener('click',()=>{
          const text=`ÉPURE — Enquiry draft (not sent)\n\nName: ${data.name}\nEmail: ${data.email}\nInterest: ${data.interest}\n\n${data.message}\n`;
          const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='epure-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        });result.append(download);
      }
      result.focus({preventScroll:true});result.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'nearest'});
    });
  }
})();
