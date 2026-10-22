import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const p=await b.newPage({viewport:{width:1200,height:675}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5196/ratlantis/');
 await p.locator('#new').click();await p.locator('#name').fill('Pip');await p.locator('#start').click();
 assert.equal(await p.evaluate(()=>ratlantis.cityAmbience.isPlaying),false);
 await p.locator('#sound').click();
 await p.waitForFunction(()=>ratlantis.cityAmbience.isPlaying && !ratlantis.sound.locked);
 assert.equal(await p.evaluate(()=>ratlantis.cityAmbience.loop),true);
 await p.evaluate(()=>{window.jumpPlays=0;ratlantis.jumpSound.on('play',()=>window.jumpPlays++);});
 const jump=async()=>{
  await p.waitForFunction(()=>ratlantis.player.body.blocked.down);
  const pt=await p.evaluate(()=>({x:ratlantis.player.body.center.x-ratlantis.cameras.main.scrollX,y:ratlantis.player.y}));
  await p.mouse.move(pt.x+45,pt.y-140);await p.mouse.down();await p.mouse.up();
 };
 await jump();await p.waitForFunction(()=>window.jumpPlays===1);
 await p.waitForFunction(()=>ratlantis.player.body.blocked.down);
 await p.locator('#sound').click();
 // Phaser applies its Web Audio mute state on the next game update.
 await p.waitForFunction(()=>ratlantis.sound.mute === true);
 await jump();await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>window.jumpPlays),1);
 await p.locator('#sound').click();
 await p.evaluate(()=>ratlantis.enter('neighborhood'));
 assert.equal(await p.evaluate(()=>ratlantis.sound.getAll('city-ambience').length),1);
 assert.equal(await p.evaluate(()=>ratlantis.cityAmbience.isPlaying),true);
 await p.locator('#help').click();await p.locator('#resume').click();
 assert.equal(await p.evaluate(()=>ratlantis.sound.getAll('city-ambience').length),1);
 await p.locator('#help').click();await p.locator('#title').click();
 assert.equal(await p.evaluate(()=>ratlantis.cityAmbience.isPlaying),false);
 await p.locator('#continue').click();
 await p.waitForFunction(()=>ratlantis.cityAmbience.isPlaying);
 assert.equal(await p.evaluate(()=>ratlantis.state.sound),true);
 assert.deepEqual(errors,[]);
 console.log('Supplied jump plays on a real jump, respects mute; city loop starts on enable, stays single across scenes/pause, stops at title, resumes on Continue.');
}finally{await b.close();}
