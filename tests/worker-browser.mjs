import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1200,height:675}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'ferry',inventory:['ticket'],flags:{singing:true,ferryTicketAwarded:true},journal:[],sound:false})));
  await page.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');
  await page.locator('#continue').click();
  await page.waitForTimeout(400);
  await page.evaluate(()=>{
    ratlantis.player.setPosition(690,485);
    ratlantis.cameras.main.setScroll(300,0);
    ratlantis.worker.setFrame('worker');
  });
  assert.equal(await page.evaluate(()=>ratlantis.worker.texture.key),'art-worker');
  for (const frame of ['worker','dance']) {
    await page.evaluate(frame=>ratlantis.worker.setFrame(frame),frame);
    assert.ok(await page.evaluate(()=>ratlantis.worker.frame.width > 0));
  }
  await page.screenshot({path:'tests/worker-rat.png'});
  const xy=await page.evaluate(()=>({x:ratlantis.worker.x-ratlantis.cameras.main.scrollX,y:510}));
  await page.mouse.click(xy.x,xy.y);
  await page.getByRole('button',{name:'I guess so',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>ratlantis.locked));
  await page.getByRole('button',{name:'I’m not so sure...',exact:true}).click();
  assert.deepEqual(errors,[]);
  console.log('Worker poses, new texture, anchored conversation and movement lock pass.');
} finally {await browser.close();}
