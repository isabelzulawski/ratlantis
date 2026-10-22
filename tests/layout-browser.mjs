import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const url=process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/';
try {
 for(const viewport of [{width:1280,height:720},{width:900,height:650},{width:390,height:844}]){
  const p=await browser.newPage({viewport});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);await p.locator('#new').click();await p.locator('#start').waitFor();
  const box=await p.locator('#start').boundingBox();
  console.log(JSON.stringify({viewport,creationButton:box}));
  assert.ok(box && box.x>=0 && box.y>=0 && box.x+box.width<=viewport.width+1 && box.y+box.height<=viewport.height+1,'Explore must remain reachable');
  await p.goto(url+'?data=newspaper');await p.locator('.living-newspaper').waitFor();
  await p.screenshot({path:`tests/layout-${viewport.width}.png`});
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('Creation controls fit desktop, small laptop and portrait phone viewports; newspaper renders without script errors. Touch gameplay is not covered.');
} finally {await browser.close();}
