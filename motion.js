/* Locally hosted GSAP + ScrollTrigger + SplitText, synchronized with Lenis. */
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  const {gsap,ScrollTrigger,SplitText,Lenis}=window;
  gsap.registerPlugin(ScrollTrigger,SplitText);
  gsap.defaults({ease:'power3.out',duration:.8});
  ScrollTrigger.config({ignoreMobileResize:true});
  const html=document.documentElement;
  const state=window.ATELIER_MOTION={active:false,ready:false,gsap:gsap.version,lenis:null};
  let context=null,lenis=null,tick=null,splitInstances=[],introPlayed=false;
  const reduce=()=>html.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain=document.querySelector('.page-curtain');
  const cursor=document.querySelector('.view-cursor');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const menu=document.querySelector('#navigation');
  const modal=document.querySelector('#pieceModal');
  let overlayCount=0;

  function stopSmooth(){overlayCount++;lenis?.stop();cursor?.classList.remove('is-visible')}
  function startSmooth(){overlayCount=Math.max(0,overlayCount-1);if(!overlayCount)lenis?.start();ScrollTrigger.refresh()}
  [menu,modal].forEach(el=>{
    el.addEventListener(el===menu?'show.bs.offcanvas':'show.bs.modal',stopSmooth);
    el.addEventListener(el===menu?'hidden.bs.offcanvas':'hidden.bs.modal',startSmooth);
  });

  function teardown(){
    context?.revert();context=null;
    splitInstances.forEach(s=>s.revert());splitInstances=[];
    if(tick)gsap.ticker.remove(tick);tick=null;
    lenis?.destroy();lenis=null;window.lenis=null;state.lenis=null;state.active=false;
    html.classList.remove('gsap-ready');
    cursor?.classList.remove('is-visible');
    document.querySelectorAll('[data-anim="atelier"]').forEach(el=>{el.dataset.animShow='true'});
    if(curtain)gsap.set(curtain,{yPercent:-100,clearProps:'opacity'});
  }

  function splitHeading(heading){
    if(!SplitText)return null;
    const split=SplitText.create(heading,{type:'lines',mask:'lines',autoSplit:true,
      linesClass:'type-line',aria:'auto',
      onSplit(self){
        return gsap.from(self.lines,{yPercent:105,duration:1.05,stagger:.085,ease:'power4.out',
          scrollTrigger:{trigger:heading,start:'top 91%',once:true}});
      }});
    splitInstances.push(split);return split;
  }

  function boot(){
    teardown();
    if(reduce()){state.ready=true;return;}
    html.classList.add('gsap-ready');state.active=true;
    lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false,anchors:{offset:-85},
      prevent:node=>Boolean(node.closest?.('[data-lenis-prevent]'))});
    window.lenis=lenis;state.lenis='1.3.17';
    lenis.on('scroll',ScrollTrigger.update);
    tick=time=>lenis?.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
    if(overlayCount)lenis.stop();
    context=gsap.context(()=>{
      const intro=gsap.timeline({defaults:{ease:'power4.out'}});
      if(!introPlayed&&curtain){
        intro.fromTo(curtain,{yPercent:0},{yPercent:-100,duration:.85,ease:'power3.inOut'},0);
      }
      if(!introPlayed){
        intro.from('.atelier-header .wordmark',{y:14,opacity:0,duration:.8},.25);
        intro.from('.atelier-header .btn-menu,.atelier-header .aside-menu',{opacity:0,y:8,duration:.65},.45);
        const hero=document.querySelector('.cinematic-hero');
        if(hero){
          intro.fromTo('.hero-media',{clipPath:'inset(0 0 0 30%)'},{clipPath:'inset(0 0 0 0%)',duration:1.6},.1);
          intro.fromTo('.hero-photo',{scale:1.12},{scale:1.025,duration:2},.1);
          intro.from('.hero-title-group h1>span',{yPercent:110,rotation:2,opacity:0,duration:1.2,stagger:.11},.32);
          intro.from('.hero-cta,.hero-bottom',{y:12,opacity:0,duration:.85,stagger:.1},1);
        }else{
          intro.from('main>header h1,.contact-intro h1',{y:35,opacity:0,duration:1},.3);
          intro.from('.page-intro,.about-hero-copy>p,.contact-intro>p',{opacity:0,y:15,duration:.8},.6);
        }
        introPlayed=true;
      }
      gsap.to('.reading-progress span',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:()=>ScrollTrigger.maxScroll(window),scrub:true}});
      if(document.querySelector('.cinematic-hero')){
        gsap.to('.hero-media',{yPercent:11,ease:'none',scrollTrigger:{trigger:'.cinematic-hero',start:'top top',end:'bottom top',scrub:.45}});
        gsap.to('.hero-title-group',{yPercent:-12,opacity:.35,ease:'none',scrollTrigger:{trigger:'.cinematic-hero',start:'15% top',end:'bottom top',scrub:.4}});
      }
      document.querySelectorAll('.introduction h2,.editorial-copy h2,.editorial-caption h2,.section-heading h2,.about-intro h2,.quiet-invitation h2,.material-banner h2').forEach(splitHeading);
      // Images reveal like a page being opened; ordinary copy remains quiet.
      document.querySelectorAll('.watch-editorial .editorial-photo,.paired-editorials .editorial-photo,.philosophy-image').forEach(el=>{
        gsap.fromTo(el,{clipPath:'inset(12% 0 12% 0)'},{clipPath:'inset(0% 0 0% 0)',duration:1.4,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%',once:true}});
        const img=el.querySelector('img');
        gsap.fromTo(img,{scale:1.1},{scale:1,duration:1.6,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%',once:true}});
      });
      document.querySelectorAll('.intro-body,.editorial-copy>p,.editorial-copy>.text-link,.philosophy-text article,.project-note>div').forEach(el=>{
        gsap.from(el,{opacity:0,y:22,duration:.85,scrollTrigger:{trigger:el,start:'top 91%',once:true}});
      });
      const craft=document.querySelector('.craft-story');
      if(craft){
        gsap.fromTo(craft,{'--craft-progress':0},{'--craft-progress':1,ease:'none',scrollTrigger:{trigger:craft,start:'top top',end:'bottom bottom',scrub:.55}});
        gsap.fromTo('.craft-image>img',{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:craft,start:'top top',end:'bottom bottom',scrub:.55}});
        gsap.from('.craft-copy h2',{y:24,opacity:0,duration:1,scrollTrigger:{trigger:craft,start:'top 52%',once:true}});
      }
      const banner=document.querySelector('.material-banner-image');
      if(banner)gsap.fromTo(banner,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:banner.parentElement,start:'top bottom',end:'bottom top',scrub:.6}});
      gsap.from('.footer-signature',{yPercent:32,opacity:.35,duration:1.2,scrollTrigger:{trigger:'.footer-signature',start:'top 95%',once:true}});
    });
    ScrollTrigger.refresh();state.ready=true;
  }

  document.addEventListener('atelier:motionchange',()=>boot());
  document.addEventListener('atelier:filterchange',()=>{
    if(!state.active)return;
    gsap.fromTo('.gallery-grid .gallery-piece:not([hidden])',{opacity:.35,y:14},{opacity:1,y:0,duration:.5,overwrite:true});
    requestAnimationFrame(()=>{lenis?.resize();ScrollTrigger.refresh()});
  });
  menu.addEventListener('show.bs.offcanvas',()=>{
    if(!state.active)return;
    gsap.fromTo('.main-menu .nav-primary li',{y:38,opacity:0},{y:0,opacity:1,duration:.85,stagger:.07,delay:.15,overwrite:true});
    gsap.fromTo('.menu-image',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:1,delay:.28,overwrite:true});
  });
  modal.addEventListener('shown.bs.modal',()=>{
    if(!state.active)return;
    gsap.fromTo('.detail-copy>*',{y:12,opacity:0},{y:0,opacity:1,stagger:.045,duration:.55,overwrite:true});
  });

  // The pointer is a contextual image affordance; the native pointer stays available.
  if(cursor){
    const moveX=gsap.quickTo(cursor,'x',{duration:.22,ease:'power3'});
    const moveY=gsap.quickTo(cursor,'y',{duration:.22,ease:'power3'});
    document.addEventListener('pointermove',event=>{
      if(!finePointer.matches||reduce())return;
      moveX(event.clientX);moveY(event.clientY);
      const target=event.target.closest('.editorial-photo,.piece-image');
      cursor.classList.toggle('is-visible',Boolean(target)&&!overlayCount);
    },{passive:true});
    document.addEventListener('mouseleave',()=>cursor.classList.remove('is-visible'));
  }
  document.querySelectorAll('.text-link:not(.footer-cta)').forEach(el=>{
    el.addEventListener('pointermove',event=>{
      if(!state.active||!finePointer.matches)return;
      const r=el.getBoundingClientRect();gsap.to(el,{x:(event.clientX-r.left-r.width/2)*.055,y:(event.clientY-r.top-r.height/2)*.12,duration:.4,overwrite:true});
    });
    el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.6,overwrite:true}));
  });
  // Same-origin document navigation receives one short, cancellable visual handoff.
  let navigating=false;
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href]');
    if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download')||reduce())return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin||url.hash||url.pathname===location.pathname&&url.search===location.search)return;
    if(navigating)return;event.preventDefault();navigating=true;lenis?.stop();
    gsap.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.5,ease:'power3.inOut',onComplete:()=>location.assign(url.href)});
  });
  window.addEventListener('pageshow',event=>{if(event.persisted){navigating=false;gsap.set(curtain,{yPercent:-100});lenis?.start();ScrollTrigger.refresh()}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)lenis?.stop();else if(!overlayCount)lenis?.start()});
  document.fonts.ready.then(()=>boot());
})();
