// Lossless transfer compression: CSV rows and values are unchanged.
import {readFile,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const path='public/data/rats_2025_initial.csv';
const csv=await readFile(path), gzip=gzipSync(csv,{level:9});
await writeFile(path+'.gz',gzip);
console.log(`CSV: ${csv.length} bytes → ${gzip.length} bytes`);
