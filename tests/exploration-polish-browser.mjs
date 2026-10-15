import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const p=await b.newPage({viewport:{width:1200,height:800}}), errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('ratlantis-illustrated-look','off'));
 await p.goto(process.env.RATLANTIS_TEST_URL||'http://127.0.0.1:5182/');
 await p.locator('#new').click();
 const back=await p.locator('#back').boundingBox(),explore=await p.locator('#start').boundingBox();
 assert.ok(back.x<explore.x);
 await p.locator('#name').fill('Pip');await p.locator('#start').click();await p.waitForTimeout(300);
 assert.equal(await p.evaluate(()=>ratlantis.illustratedLook.enabled),true);
 await p.locator('#help').click();assert.equal(await p.locator('#look').count(),0);
 const help=await p.locator('#overlay').innerText();assert.ok(!help.includes('Brooklyn')&&!help.includes('ferry'));
 assert.ok(help.includes('Click objects to inspect.'));
 await p.locator('#resume').click();
 await p.evaluate(()=>ratlantis.player.setPosition(700,530));
 await p.waitForTimeout(400);
 const rat=await p.evaluate(()=>({x:ratlantis.player.body.center.x,y:ratlantis.player.body.bottom-15}));
 await click(rat.x,rat.y);
 await p.locator('.speech').waitFor();
 assert.match(await p.locator('.speech').innerText(),/BILLBOARD/i);
 assert.equal(await p.evaluate(()=>ratlantis.player.body.velocity.y),0);
 await p.getByRole('button',{name:'Continue',exact:true}).click();

 await p.evaluate(()=>{ratlantis.state.flags={acting:true,wardrobe:true};ratlantis.state.journal=['Goal: try for a Broadway audition.','Next destination: Broadway–Lafayette station.','A park squirrel gave me a newspaper. I can read it from my backpack.','Lead: a retired busker in Brooklyn may help. Follow the bridge maintenance ledge past the delivery depot.','Met a retired busker in Brooklyn.','Skill learned: singing.','Ferry ticket received. Note on the back: “Ask for the rat with the mop.” Follow the ferry boarding passage at the right of the Brooklyn alcove.','Skill learned: dancing. Next: the electrical-cabinet theater in Queens.','Skill learned: acting. Crawl through the pipes back to Manhattan. Follow the warm light to the audition-room vent.'];});
 await p.locator('#bag').click();assert.equal(await p.locator('.journal-notes p').count(),4);
 assert.ok((await p.locator('.journal-notes').innerText()).length<220);
 await p.getByRole('button',{name:'Earlier notes',exact:true}).click();
 assert.ok(await p.locator('.journal-notes p').count());
 await p.screenshot({path:'tests/compact-journal.png'});
 await p.getByRole('button',{name:'Close backpack',exact:true}).click();
 await p.evaluate(()=>ratlantis.enter('brooklyn'));
 async function at(x,y=485){await p.evaluate(({x,y})=>{ratlantis.player.setPosition(x,y);ratlantis.player.body.setVelocity(0);ratlantis.cameras.main.setScroll(400,0);},{x,y});await p.waitForTimeout(400);}
 async function point(x,y){return p.evaluate(({x,y})=>{const r=ratlantis.game.canvas.getBoundingClientRect();return{x:r.left+(x-ratlantis.cameras.main.scrollX)*r.width/1200,y:r.top+y*r.height/675};},{x,y});}
 async function click(x,y){const q=await point(x,y);await p.mouse.click(q.x,q.y);}
 await at(1350);await click(1385,365);await p.locator('.speech').waitFor();assert.ok(!(await p.evaluate(()=>ratlantis.state.accessories||[])).includes('pendant'));
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 await at(1080);
 for(const [target,height] of [[1180,490],[1280,435],[1385,380]]){
   const pos=await p.evaluate(()=>({x:ratlantis.player.body.center.x,y:ratlantis.player.body.bottom}));
   const down=await point(pos.x+50,600),up=await point(target,pos.y-160);
   await p.mouse.move(down.x,down.y);await p.mouse.down();await p.mouse.move(up.x,up.y);await p.mouse.up();
   await p.waitForTimeout(900);
   const foot=await p.evaluate(()=>ratlantis.player.body.bottom);
   assert.ok(Math.abs(foot-height)<4,`jump to ${height}, got ${foot}`);
 }
 await p.screenshot({path:'tests/brooklyn-high-ledge.png'});
 await click(1385,365);await p.locator('.speech').waitFor();
 assert.ok((await p.evaluate(()=>ratlantis.state.accessories)).includes('pendant'));
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 await p.locator('#wardrobe').click();await p.locator('[data-accessory=pendant]').click();await p.getByRole('button',{name:'Close',exact:true}).click();
 await p.reload();await p.locator('#continue').click();await p.waitForTimeout(300);
 assert.equal(await p.evaluate(()=>ratlantis.state.accessories.filter(x=>x==='pendant').length),1);
 assert.ok(await p.evaluate(()=>ratlantis.state.equippedAccessories.includes('pendant')));
 await p.evaluate(()=>ratlantis.enter('queens'));await at(900);
 await click(1010,510);await p.locator('.speech').waitFor();
 assert.ok(!/pipes|Manhattan|vent/i.test(await p.locator('.speech').innerText()));
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await p.locator('[data-ready]').count(),0);
 for(const id of ['cape','vest','sash']) {
   await p.locator(`[data-costume=${id}]`).click();
   await p.getByRole('button',{name:'Close',exact:true}).click();
   await p.locator('#wardrobe').click();
 }
 assert.deepEqual(errors,[]);
 console.log('Actual three-step jumps, high pickup/equip/reload, compact paged journal, repeated spoiler-free costumes, creation buttons and always-on shader pass.');
}finally{await b.close();}
