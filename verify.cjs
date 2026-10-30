const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const out=path.join(__dirname,'verification');fs.mkdirSync(out,{recursive:true});
const report={viewports:[],interactions:[],errors:[],failures:[],externalRequests:[]};
async function main(){const browser=await chromium.launch({headless:true});
for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844],['tablet',820,1180]]){
const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage();page.setDefaultTimeout(7000);
page.on('pageerror',e=>report.errors.push({device,url:page.url(),error:e.message}));page.on('console',m=>{if(m.type()==='error')report.errors.push({device,url:page.url(),error:m.text()})});page.on('response',r=>{if(r.status()>=400)report.failures.push({url:r.url(),status:r.status()})});
page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')report.failures.push({url:r.url(),error:r.failure()?.errorText})});
await page.route('**/*',r=>{if(r.request().url().startsWith('http://127.0.0.1:4173'))return r.continue();report.externalRequests.push(r.request().url());return r.abort()});
for(const [name,route] of [['home','/'],['gallery','/gallery/'],['about','/about/'],['contact','/contact/']]){
await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});await page.waitForTimeout(2600);await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:path.join(out,`${name}-${device}.png`)});
const measure=await page.evaluate(()=>({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,fonts:document.fonts.status,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),brandLeaks:/biver|shopify|mailchimp/i.test(document.body.innerText),heroCTA:!!document.querySelector('.hero-cta'),headingOverflow:[...document.querySelectorAll('h1')].some(e=>e.scrollWidth>e.clientWidth+1),gsap:window.gsap?.version,lenis:!!window.lenis,scrollTriggers:window.ScrollTrigger?.getAll().length,motionReady:window.ATELIER_MOTION?.ready}));report.viewports.push({name,device,...measure});
if(!measure.gsap||!measure.lenis||!measure.motionReady)report.failures.push({name,device,reason:'motion runtime missing'});
if(measure.headingOverflow)report.failures.push({name,device,reason:'heading overflow'});
if(measure.scrollWidth>width)report.failures.push({name,device,reason:'horizontal overflow',width:measure.scrollWidth});
for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=height*.8){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);}
await page.waitForTimeout(400);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(300);
if(name!=='home')await page.screenshot({path:path.join(out,`${name}-${device}-full.png`),fullPage:true});
if(name==='home'){
 await page.locator('#introduction').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:path.join(out,`editorial-${device}.png`)});
 await page.evaluate(()=>{const el=document.querySelector('.craft-story');scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.55,behavior:'instant'})});await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`craft-${device}.png`)});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(600);
 await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,`menu-${device}.png`)});assert(await page.locator('#navigation').evaluate(e=>e.classList.contains('show')));assert(await page.evaluate(()=>window.lenis.isStopped));await page.keyboard.press('Escape');await page.getByRole('button',{name:'Open menu',exact:true}).waitFor({state:'visible'});assert(await page.evaluate(()=>!window.lenis.isStopped));report.interactions.push(device+': menu + Escape + Lenis pause/resume');
}
if(name==='gallery'){
 for(const category of ['watches','rings','straps','all']){await page.locator(`[data-filter="${category}"]`).click();const count=await page.locator('.gallery-grid .gallery-piece:visible').count();assert.equal(count,category==='all'?3:1);}
 report.interactions.push(device+': all four gallery filters');
 await page.locator('[data-piece="form-study"]').click();await page.waitForTimeout(500);assert.equal(await page.locator('#piece-title').textContent(),'A study in form');await page.screenshot({path:path.join(out,`detail-${device}.png`)});assert(await page.evaluate(()=>window.lenis.isStopped));
 await page.locator('#zoom-image').click();assert(await page.locator('.detail-media').evaluate(e=>e.classList.contains('is-zoomed')));await page.locator('#expand-image').click();assert(await page.locator('#pieceModal').evaluate(e=>e.classList.contains('image-expanded')));await page.screenshot({path:path.join(out,`zoom-${device}.png`)});await page.locator('#expand-image').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#piece-title').textContent(),'A study in texture');await page.keyboard.press('Escape');await page.waitForTimeout(500);assert(await page.evaluate(()=>!window.lenis.isStopped));report.interactions.push(device+': details, zoom, fullscreen, arrow keys, Escape, smooth-scroll recovery');
}
if(name==='contact'){
 await page.getByRole('button',{name:'Prepare enquiry'}).click();assert(await page.locator('#form-result').isHidden());assert.equal(await page.locator('#enquiry-form').evaluate(f=>f.checkValidity()),false);report.interactions.push(device+': required form fields reject an empty draft');
 await page.locator('#first-name').fill('Preview Person');await page.locator('#email').fill('preview@example.com');await page.locator('#message').fill('I would like to explore a personal ring with a sculptural silhouette.');await page.getByRole('button',{name:'Prepare enquiry'}).click();assert((await page.locator('#form-result').textContent()).includes('Nothing has been sent'));const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download enquiry draft'}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'epure-enquiry.txt');report.interactions.push(device+': honest enquiry draft + download');
}
console.log(device,name,'checked');
}
await context.close();}
const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto('http://127.0.0.1:4173/');await rp.waitForTimeout(500);assert(await rp.locator('html').evaluate(e=>e.classList.contains('reduce-motion')));assert.equal(await rp.evaluate(()=>!!window.lenis),false);assert.equal(await rp.locator('.craft-sticky').evaluate(e=>getComputedStyle(e).position),'relative');report.interactions.push('System reduced-motion removes scroll scene pinning');await reduced.close();
await browser.close();report.pass=report.errors.length===0&&report.failures.length===0&&report.externalRequests.length===0;process.exitCode=report.pass?0:1;fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
main().catch(e=>{report.errors.push({test:e.stack});fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2));console.error(e);process.exit(1)});
