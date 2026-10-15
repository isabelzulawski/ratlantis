import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const page = await browser.newPage({viewport:{width:1200,height:675}});
 const errors=[];
 page.on('pageerror', e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error' && !m.location().url.endsWith('/favicon.ico')) errors.push(m.text() + ' ' + m.location().url);});
 await page.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');
 await page.locator('#new').click();
 await page.locator('#name').fill('Shader check');
 await page.locator('#start').click();
 await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>ratlantis.illustratedLook.enabled),true);
 assert.equal(await page.evaluate(()=>ratlantis.cameras.main.postPipelines.length),1);
 await page.screenshot({path:'tests/shader-on.png'});
 await page.locator('#help').click();
 assert.equal(await page.locator('#look').count(),0);
 await page.locator('#resume').click();
 await page.evaluate(()=>localStorage.setItem('ratlantis-illustrated-look','off'));
 await page.reload(); await page.locator('#continue').click();
 assert.equal(await page.evaluate(()=>ratlantis.illustratedLook.enabled),true);
 await page.evaluate(()=>ratlantis.enter('park'));
 await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>ratlantis.cameras.main.postPipelines.length),1);
 assert.deepEqual(errors,[]);
 console.log('WebGL shader compilation, always-on preference override/reload and scene transition pass.');
} finally {await browser.close();}
