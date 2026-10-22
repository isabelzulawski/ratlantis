import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {SCENES} from '../src/data/config.js';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const p=await browser.newPage({viewport:{width:1200,height:675}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('ratlantis-audio-v1',JSON.stringify({music:false,effects:false}));localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'station',inventory:[],flags:{arrivalThoughtSeen:true},journal:[],sound:false}));});
 await p.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');await p.locator('#continue').click();
 await p.waitForFunction(()=>ratlantis.player.body.blocked.down);
 await p.mouse.move(1100,500);await p.mouse.down();await p.waitForTimeout(5500);await p.mouse.up();
 const stairs=await p.evaluate(()=>({x:ratlantis.player.body.center.x,y:ratlantis.player.body.bottom,scene:ratlantis.id}));console.log({stairs});
 assert.ok(stairs.scene==='station'&&stairs.x>700&&stairs.y<=583,'Stairs must lead to the lower platform');
 await p.evaluate(()=>{ratlantis.enter('auditionRoom');});await p.waitForFunction(()=>ratlantis.player.body.blocked.down);
 await p.mouse.move(900,500);await p.mouse.down();await p.waitForTimeout(1800);await p.mouse.up();
 const edge=await p.evaluate(()=>({x:ratlantis.player.body.center.x,y:ratlantis.player.body.bottom,vy:ratlantis.player.body.velocity.y}));console.log({edge});
 assert.ok(edge.x<335&&edge.y<=538,'Walking forward at the ending must stay on the vent ledge');
 // Jumping off the ending remains possible, but must recover and settle.
 await p.mouse.move(600,250);await p.mouse.down();await p.mouse.up();
 await p.waitForTimeout(1700);
 assert.ok(await p.evaluate(()=>ratlantis.player.body.blocked.down&&ratlantis.player.body.center.x<335));
 for(const scene of Object.keys(SCENES).filter(id=>!['downtown','ride','fall'].includes(id))){
  await p.evaluate(scene=>ratlantis.enter(scene),scene);await p.waitForFunction(()=>ratlantis.player.body.blocked.down);
  await p.evaluate(()=>ratlantis.player.body.reset(ratlantis.player.x,900));
  await p.waitForTimeout(1200);
  assert.ok(await p.evaluate(()=>ratlantis.player.body.blocked.down&&ratlantis.player.body.bottom<650),`${scene} must settle on a safe platform after falling`);
 }
 assert.deepEqual(errors,[]);console.log('Stair descent, ending ledge protection and stable fall recovery pass.');
}finally{await browser.close();}
