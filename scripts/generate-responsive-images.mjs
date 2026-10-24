import {readdir,readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const root=path.resolve('public/images');
const output=path.join(root,'responsive');
await mkdir(output,{recursive:true});
await mkdir('.generated',{recursive:true});
const manifest={};
async function visit(folder){
  for(const entry of await readdir(folder,{withFileTypes:true})){
    const file=path.join(folder,entry.name);
    if(entry.isDirectory()){if(file!==output)await visit(file);continue;}
    if(!/\.(jpe?g|png|webp|avif)$/i.test(entry.name))continue;
    const input=await readFile(file);
    const metadata=await sharp(input).metadata();
    if((metadata.pages||1)>1)continue;
    const swapped=(metadata.orientation||1)>=5;
    const width=swapped?metadata.height:metadata.width;
    const height=swapped?metadata.width:metadata.height;
    if(!width||!height)continue;
    const hash=createHash('sha256').update(input).update('webp-q82-v1').digest('hex').slice(0,20);
    const widths=[...new Set([64,128,320,480,640,960,1280,1600,1920,2560,Math.min(width,2560)].filter(size=>size<=width))].sort((a,b)=>a-b);
    const variants=[];
    for(const size of widths){
      const name=`${hash}-${size}.webp`;
      try{await access(path.join(output,name));}catch{
        await sharp(input).autoOrient().resize({width:size,withoutEnlargement:true}).webp({quality:82}).toFile(path.join(output,name));
      }
      variants.push({src:`/images/responsive/${name}`,width:size});
    }
    const src='/images/'+path.relative(root,file).split(path.sep).join('/');
    manifest[src]={width,height,variants};
  }
}
await visit(root);
await writeFile('.generated/responsive-images.json',JSON.stringify(manifest));
console.log(`Responsive images: ${Object.keys(manifest).length} originals, variants cached locally.`);
