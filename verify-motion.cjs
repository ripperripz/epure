const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const out=path.join(__dirname,'verification');
async function main(){
 const browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:path.join(out,'motion-video'),size:{width:1280,height:800}}});
 const page=await context.newPage();page.setDefaultTimeout(8000);const errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:4173/?edition=motion',{waitUntil:'networkidle'});await page.waitForTimeout(2400);
 assert(await page.evaluate(()=>!!window.lenis&&!!window.gsap&&window.ScrollTrigger.getAll().length>5));checks.push('Local GSAP, ScrollTrigger, SplitText and Lenis active');
 await page.mouse.move(1050,620);await page.mouse.wheel(0,650);await page.waitForTimeout(70);const intermediate=await page.evaluate(()=>scrollY);await page.waitForTimeout(1000);const settled=await page.evaluate(()=>scrollY);assert(intermediate>0&&settled>intermediate&&settled<=660);checks.push('Wheel movement interpolates and settles through Lenis');
 await page.mouse.wheel(0,850);await page.waitForTimeout(1100);await page.mouse.move(480,450);await page.waitForTimeout(500);
 await page.evaluate(()=>window.lenis.scrollTo(document.querySelector('.craft-story'),{duration:1.4}));await page.waitForTimeout(1600);
 await page.mouse.wheel(0,700);await page.waitForTimeout(1000);const progress=await page.evaluate(()=>+getComputedStyle(document.querySelector('.craft-story')).getPropertyValue('--craft-progress'));assert(progress>0&&progress<1);checks.push('ScrollTrigger drives the workshop-to-ring transition');
 await page.evaluate(()=>window.lenis.scrollTo(0,{immediate:true}));await page.waitForTimeout(400);
 await Promise.all([page.waitForURL('**/gallery/'),page.locator('.hero-cta').click()]);await page.waitForTimeout(2000);assert((await page.title()).includes('collection'));assert(await page.locator('.page-curtain').evaluate(e=>e.getBoundingClientRect().bottom<=1));checks.push('Page curtain hands off to gallery and clears');
 await page.evaluate(()=>window.lenis.scrollTo('bottom',{immediate:true}));await page.waitForTimeout(600);
 await page.getByRole('button',{name:'Reduce motion',exact:true}).click();assert(await page.evaluate(()=>!window.lenis&&window.ScrollTrigger.getAll().length===0));checks.push('Manual reduce motion destroys Lenis and scroll choreography');
 await page.getByRole('button',{name:'Enable motion',exact:true}).click();await page.waitForTimeout(250);assert(await page.evaluate(()=>!!window.lenis&&window.ATELIER_MOTION.active));checks.push('Manual enable motion recreates one synchronized runtime');
 assert.equal(errors.length,0);const video=page.video();await context.close();const videoPath=await video.path();await video.saveAs(path.join(out,'atelier-motion.webm'));await browser.close();
 const result={pass:true,checks,errors,wheel:{intermediate,settled},craftProgress:progress,video:'verification/atelier-motion.webm'};fs.writeFileSync(path.join(out,'MOTION.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
