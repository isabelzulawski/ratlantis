import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const mode of ['click','drag','distant','distant-drag','far']){
  const p=await browser.newPage({viewport:{width:1200,height:675}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('ratlantis-audio-v1',JSON.stringify({music:false,effects:false}));localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'brooklyn',inventory:['bread','pizza'],flags:{},journal:[],sound:false}));});
  await p.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');await p.locator('#continue').click();await p.waitForTimeout(250);
  if(mode!=='far' && !mode.startsWith('distant'))await p.evaluate(()=>{ratlantis.player.body.reset(900,485);ratlantis.cameras.main.setScroll(400,0);});
  if(mode==='far')await p.evaluate(()=>ratlantis.cameras.main.stopFollow().setBounds(0,0,2800,675).setScroll(1150,0));
  if(mode==='click'){
   await p.evaluate(()=>ratlantis.chapter.talk());
   assert.match(await p.locator('.busker-greeting h2').textContent(), /I don't perform anymore\./i);
   assert.equal(await p.locator('.busker-greeting h2').evaluate(el=>getComputedStyle(el).transform),'matrix(1, 0, 0, 1, 0, 8)');
   await p.evaluate(()=>ratlantis.ui.clear());
  }
  await p.locator('#bag').click();
  if(mode==='click')await p.screenshot({path:'tests/busker-easier-giving.png'});
  if(mode==='far')assert.equal(await p.getByRole('button',{name:'Give to busker'}).count(),0);
  else {
   if(mode==='click' || mode==='distant')await p.locator('[data-item="pizza"] .give-food').click();
   else{
    const from=await p.locator(mode==='distant-drag' ? '[data-item="pizza"]' : '[data-item="bread"]').boundingBox();
    const to=await p.evaluate(()=>{const r=ratlantis.busker.getBounds();return{x:r.right+45-ratlantis.cameras.main.scrollX,y:r.centerY};});
    await p.mouse.move(from.x+from.width/2,from.y+30);await p.mouse.down();await p.mouse.move(to.x,to.y,{steps:15});await p.mouse.up();
   }
   await p.waitForFunction(()=>ratlantis.state.flags.buskerFed);
   const used = mode==='drag' ? 'bread' : 'pizza';
   assert.equal(await p.evaluate(item=>ratlantis.state.inventory.includes(item),used),false);
   assert.equal(await p.evaluate(item=>ratlantis.state.inventory.includes(item),used==='pizza'?'bread':'pizza'),true);
   assert.equal(await p.locator('.speech').count(),1);
  }
  if(mode==='far'){
   await p.evaluate(()=>{ratlantis.ui.clear();ratlantis.enter('neighborhood');ratlantis.ui.cue.element.click();});
   assert.equal(await p.locator('.arrival-dialogue h2').textContent(),'That fall brought me here.');
   assert.equal(await p.locator('.arrival-dialogue h2').evaluate(el=>{const r=new Range();r.selectNodeContents(el);return r.getClientRects().length;}),1);
   await p.screenshot({path:'tests/arrival-short-line.png'});
  }
  assert.deepEqual(errors,[]);await p.close();
 }
 console.log('Click-to-give and forgiving off-sprite drag both feed the busker once, consume only the selected food, including pizza while the player stands farther away, and stay unavailable when the busker is offscreen.');
}finally{await browser.close();}
