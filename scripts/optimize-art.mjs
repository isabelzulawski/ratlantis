// Requires cwebp. Keeps original PNG artwork and encodes same-size WebP copies.
import { readdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run=promisify(execFile);
const files=(await readdir('public/art')).filter(f=>f.endsWith('.png'));
let before=0,after=0;
for(let i=0;i<files.length;i+=4) await Promise.all(files.slice(i,i+4).map(async f=>{
 const input=`public/art/${f}`,output=input.replace(/\.png$/,'.webp');
 await run('cwebp',['-quiet','-q','88','-alpha_q','100','-exact',input,'-o',output]);
 before+=(await stat(input)).size;after+=(await stat(output)).size;
}));
console.log(`Artwork: ${(before/1e6).toFixed(1)} MB PNG → ${(after/1e6).toFixed(1)} MB WebP; dimensions and alpha preserved.`);
