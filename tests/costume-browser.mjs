import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.addInitScript(()=>{
    if(!localStorage.getItem('ratlantis-opening-v1')) localStorage.setItem('ratlantis-opening-v1',JSON.stringify({version:1,name:'Pip',fur:'Gray',scene:'queens',flags:{singing:true,dancing:true,wardrobe:true},inventory:['newspaper'],journal:[],sound:false,accessories:['glasses','pendant']}));
  });
  await page.goto(process.env.RATLANTIS_TEST_URL || 'http://127.0.0.1:5182/');
  await page.locator('#continue').click();
  await page.locator('#wardrobe').click();
  assert.equal(await page.getByText('The dressing rail',{exact:true}).count(),0);
  assert.equal(await page.locator('[data-costume]').count(),9);
  for (const [slot, ids] of Object.entries({head:['crown','paperHat','helmet'],body:['cape','vest','sash'],prop:['staff','sword','flower']})) {
    for (const id of ids) {
      await page.locator(`[data-costume="${id}"]`).click();
      assert.equal(await page.evaluate(slot=>ratlantis.state.outfit[slot],slot),id);
      assert.ok(await page.locator('.wardrobe-preview .fitted-layer').count());
    }
  }
  await page.locator('[data-costume=helmet]').click();
  await page.locator('[data-costume=vest]').click();
  await page.locator('[data-costume=flower]').click();
  await page.screenshot({path:'tests/costume-fitted-preview.png'});
  // A contact sheet uses the exact compositing used by the editable wardrobe,
  // so visual QA shows the fitted layers on the actual protagonist, not icons.
  await page.evaluate(async ()=>{
    const card=document.createElement('div'); card.id='fit-review';
    Object.assign(card.style,{position:'fixed',inset:'0',background:'#ebdfbf',zIndex:99999,display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gridTemplateRows:'repeat(3, 1fr)'});
    for(const id of ['crown','paperHat','helmet','cape','vest','sash','staff','sword','flower']) {
      const cell=document.createElement('div'); Object.assign(cell.style,{position:'relative',textAlign:'center'});
      for(const texture of (id === 'vest' ? ['art-waistcoat'] : ['rat-atlas',`art-fit-${id}`])) {
        const img=new Image();img.src=ratlantis.textures.getBase64(texture,'idle');
        Object.assign(img.style,{position:'absolute',inset:'0',width:'100%',height:'90%',objectFit:'contain'});await img.decode();cell.append(img);
      }
      const name=document.createElement('span');name.textContent=id;Object.assign(name.style,{position:'absolute',bottom:'5px',left:'0',right:'0'});cell.append(name);card.append(cell);
    }document.body.append(card);
  });
  await page.screenshot({path:'tests/costume-fit-contact.png'});
  await page.evaluate(()=>document.querySelector('#fit-review').remove());
  await page.evaluate(async ()=>{
    const card=document.createElement('div');card.id='pose-review';
    Object.assign(card.style,{position:'fixed',inset:'0',background:'#ebdfbf',zIndex:99999,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gridTemplateRows:'repeat(2,1fr)'});
    for(const pose of ['idle','walk-a','walk-b','jump','fall','react']) {
      const cell=document.createElement('div');Object.assign(cell.style,{position:'relative'});
      for(const texture of ['art-waistcoat','art-fit-helmet','art-fit-flower']) {
        const img=new Image();img.src=ratlantis.textures.getBase64(texture,pose);await img.decode();
        Object.assign(img.style,{position:'absolute',inset:'0',width:'100%',height:'90%',objectFit:'contain'});cell.append(img);
      }
      const name=document.createElement('span');name.textContent=pose;Object.assign(name.style,{position:'absolute',bottom:'0',left:'45%'});cell.append(name);card.append(cell);
    }document.body.append(card);
  });
  await page.screenshot({path:'tests/costume-pose-contact.png'});
  await page.evaluate(()=>document.querySelector('#pose-review').remove());

  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>ratlantis.rat.sprite.texture.key),'art-waistcoat');
  assert.equal(await page.evaluate(()=>ratlantis.finale.overlays.some(o=>o.texture.key==='art-fit-vest')),false);
  for(const frame of ['idle','walk-a','walk-b','jump','fall','react']) {
    for(const face of [1,-1]) {
      assert.ok(await page.evaluate(({frame,face})=>{
        ratlantis.rat.update(0,600,535,{frame,facing:face});ratlantis.finale.updateAppearance();
        return ratlantis.finale.overlays.every(o=>o.frame.name===frame && o.flipX===(face<0) && o.x===ratlantis.rat.sprite.x && o.y===ratlantis.rat.sprite.y && Number.isFinite(o.displayWidth));
      },{frame,face}));
    }
  }
  await page.reload();await page.locator('#continue').click();
  assert.deepEqual(await page.evaluate(()=>ratlantis.state.outfit),{head:'helmet',body:'vest',prop:'flower'});
  assert.deepEqual(errors,[]);
  console.log('Nine fitted selections, six poses/both directions, preview, removed heading, and saved outfit pass.');
} finally {await browser.close();}
