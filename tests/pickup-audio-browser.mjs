import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const p=await b.newPage({viewport:{width:1200,height:675}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
  localStorage.setItem('ratlantis-audio-v1',JSON.stringify({music:false,effects:true}));
  localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'neighborhood',inventory:[],flags:{},journal:[],sound:true}));
 });
 await p.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');
 await p.locator('#continue').click();await p.waitForTimeout(400);
 await p.evaluate(()=>{window.pickups=0;ratlantis.pickupSound.on('play',()=>window.pickups++);ratlantis.player.setPosition(500,485);ratlantis.cameras.main.setScroll(0,0);});
 await p.mouse.click(525,518);await p.getByRole('button',{name:'Pack it',exact:true}).click();
 await p.waitForFunction(()=>window.pickups===1);
 assert.ok(await p.evaluate(()=>ratlantis.state.inventory.includes('bread')));
 await p.evaluate(()=>{ratlantis.enter('brooklyn');ratlantis.player.setPosition(1350,330);ratlantis.cameras.main.setScroll(400,0);});
 await p.waitForTimeout(150);
 const pendantX=await p.evaluate(()=>1385-ratlantis.cameras.main.scrollX);
 await p.mouse.click(pendantX,365);
 await p.waitForFunction(()=>window.pickups===2);
 assert.ok(await p.evaluate(()=>ratlantis.state.accessories.includes('pendant')));
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 await p.locator('#sound').click();await p.evaluate(()=>ratlantis.playPickup());
 assert.equal(await p.evaluate(()=>window.pickups),2);
 assert.deepEqual(errors,[]);
 console.log('Bread and pendant each play the supplied pickup sound; FX mute suppresses playback.');
}finally{await b.close();}
