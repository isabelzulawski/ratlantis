import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const url = process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/';
try {
  for (const mode of ['blocked', 'corrupt']) {
    const page = await browser.newPage({viewport:{width:1200,height:675}});
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.addInitScript(mode=>{
      if(mode==='blocked') Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}});
      else localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'missing-scene',inventory:[],flags:{},journal:[]}));
    },mode);
    await page.goto(url);
    await page.locator('#new').waitFor();
    assert.equal(await page.locator('#continue').count(),0);
    await page.locator('#new').click();
    await page.locator('input').fill('Pip');
    await page.locator('#start').click();
    await page.locator('#help').click();
    if(mode==='blocked') assert.match(await page.locator('#overlay').innerText(),/Browser storage is unavailable/);
    else assert.match(await page.locator('#overlay').innerText(),/Progress saves automatically/);
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('Blocked storage and malformed saves recover to a playable new game; help accurately reports save availability.');
} finally {await browser.close();}
