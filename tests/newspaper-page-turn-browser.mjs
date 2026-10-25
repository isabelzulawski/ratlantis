import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const url=(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/')+'?data=newspaper';
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url);await p.locator('.news-bar').first().waitFor();
 assert.equal(await p.locator('.corner-right').evaluate(el=>getComputedStyle(el).opacity),'1');
 await p.screenshot({path:'tests/newspaper-flat-rest.png'});
 const button=await p.locator('.paper-next').boundingBox();await p.mouse.move(button.x+button.width/2,button.y+button.height/2);await p.waitForTimeout(450);
 assert.equal(await p.locator('.corner-right').evaluate(el=>getComputedStyle(el).opacity),'0');
 assert.match(await p.locator('.corner-right').evaluate(el=>getComputedStyle(el).backgroundImage),/newspaper-flat-corners-v1/);
 assert.equal(await p.locator('.paper-next').evaluate(el=>getComputedStyle(el,'::after').display),'none');
 await p.screenshot({path:'tests/newspaper-illustrated-curl.png'});
 await p.locator('.paper-next').click();await p.locator('.turning-leaf').waitFor();
 await p.waitForTimeout(350);assert.equal(await p.locator('.turn-face').count(),2);
 assert.match(await p.locator('.turning-leaf').evaluate(el=>getComputedStyle(el).transform),/matrix3d/);
 await p.screenshot({path:'tests/newspaper-mid-flip.png'});
 await p.waitForFunction(()=>!cityRecords.turning);assert.equal(await p.locator('.paper-turn-stage').count(),0);
 assert.equal(await p.evaluate(()=>cityRecords.page),1);
 // The first map load must keep the outgoing left leaf covered until ready.
 let releaseMap;
 const mapGate=new Promise(resolve=>{releaseMap=resolve;});
 await p.route('**/boroughs.geojson',async route=>{await mapGate;await route.continue();});
 await p.locator('.paper-next').click();
 await p.waitForTimeout(200);
 assert.equal(await p.locator('.paper-turn-stage > .turn-snapshot [data-page="1"]').count(),1);
 assert.equal(await p.locator('.turning-leaf').count(),0);
 assert.equal(await p.evaluate(()=>cityRecords.turning),true);
 releaseMap();
 await p.locator('.turning-leaf').waitFor();
 await p.waitForFunction(()=>!cityRecords.turning);
 assert.equal(await p.evaluate(()=>cityRecords.page),2);
 await p.locator('.paper-previous').click();await p.waitForFunction(()=>!cityRecords.turning);

 await p.locator('.paper-previous').click();await p.waitForFunction(()=>!cityRecords.turning);assert.equal(await p.evaluate(()=>cityRecords.page),0);
 await p.locator('.paper-next').click();await p.locator('.turning-leaf').waitFor();await p.locator('.paper-close').click();
 assert.equal(await p.locator('.paper-turn-stage').count(),0);
 assert.deepEqual(errors,[]);
 const reduced=await b.newPage({reducedMotion:'reduce'});await reduced.goto(url);await reduced.locator('.news-bar').first().waitFor();await reduced.locator('.paper-next').click();
 assert.equal(await reduced.locator('.paper-turn-stage').count(),0);assert.equal(await reduced.evaluate(()=>cityRecords.page),1);
 console.log('Illustrated hover-only curl, full two-sided forward/backward page turns, close during animation and reduced-motion behavior pass.');
}finally{await b.close();}
