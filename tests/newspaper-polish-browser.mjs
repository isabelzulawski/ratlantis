import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/')+'?data=newspaper');
 await p.locator('.news-bar').first().waitFor();await p.waitForTimeout(750);
 assert.equal(await p.locator('[data-page="0"] .news-graphic [data-detail]').count(),1);
 assert.match(await p.locator('[data-detail="0"]').innerText(),/\b\d+%/);
 await p.screenshot({path:'tests/newspaper-polish-1.png'});
 await p.getByRole('button',{name:'Next',exact:true}).click();await p.waitForFunction(()=>!cityRecords.turning);
 await p.locator('button[data-borough="Queens"]').waitFor();assert.equal(await p.locator('select').count(),0);
 await p.locator('button[data-borough="all"]').click();assert.equal(await p.locator('button[data-borough="all"]').getAttribute('aria-pressed'),'true');
 await p.locator('button[data-borough="Brooklyn"]').click();assert.equal(await p.locator('button[data-borough="Brooklyn"]').getAttribute('aria-pressed'),'true');
 await p.locator('.loose-paper').click();await p.waitForTimeout(850);assert.equal(await p.locator('.loose-paper').isVisible(),false);
 assert.equal(await p.locator('.context-reveal').getAttribute('aria-hidden'),'false');
 await p.screenshot({path:'tests/newspaper-polish-2.png'});
 await p.getByRole('button',{name:'Next',exact:true}).click();await p.waitForFunction(()=>!cityRecords.turning);await p.locator('[data-detail="2"]').filter({hasText:'UNDER THE'}).waitFor();
 assert.equal(await p.locator('[data-page="2"] .news-graphic [data-detail]').count(),1);
 await p.getByRole('button',{name:'Both layers',exact:true}).click();
 await p.screenshot({path:'tests/newspaper-polish-3.png'});
 assert.equal(await p.locator('.newspaper-walking-rat').count(),3);assert.deepEqual(errors,[]);
 console.log('Graph-side statistics, whole-number percentages, borough buttons, scrap dismissal, map controls and newspaper navigation pass.');
}finally{await b.close();}
