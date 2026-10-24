import {readdir,readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import YAML from 'yaml';

const entries=[];
for(const folder of ['pages','projects','media']){
  for(const name of await readdir(`src/content/${folder}`)){
    if(!name.endsWith('.md'))continue;
    const text=await readFile(`src/content/${folder}/${name}`,'utf8');
    const data=YAML.parse(text.split(/^---\s*$/m)[1]);
    entries.push(...(data?.videos||[]));
  }
}
await mkdir('public/images/media-previews',{recursive:true});
const previews={};
for(const {url} of entries){
  if(previews[url])continue;
  const path=`/images/media-previews/${createHash('sha256').update(url).digest('hex').slice(0,20)}.webp`;
  try{await access(`public${path}`);previews[url]=path;continue;}catch{}
  try{
    const parsed=new URL(url.replaceAll('&amp;','&'));
    let sources=[];
    if(['www.youtube-nocookie.com','www.youtube.com','youtube.com','youtu.be'].includes(parsed.hostname)){
      const id=parsed.searchParams.get('v')||parsed.pathname.split('/').pop();
      if(!/^[\w-]{11}$/.test(id||''))throw new Error('Invalid YouTube ID');
      sources=[`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,`https://i.ytimg.com/vi/${id}/hqdefault.jpg`];
    }else if(parsed.hostname==='open.spotify.com'){
      const target=`https://open.spotify.com${parsed.pathname.replace('/embed/','/')}`;
      const response=await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(target)}`,{signal:AbortSignal.timeout(15000)});
      sources=[(await response.json()).thumbnail_url];
    }else if(['w.soundcloud.com','soundcloud.com'].includes(parsed.hostname)){
      const target=parsed.searchParams.get('url')||url;
      const response=await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(target)}`,{signal:AbortSignal.timeout(15000)});
      sources=[(await response.json()).thumbnail_url];
    }
    for(const source of sources.filter(Boolean)){
      const response=await fetch(source,{signal:AbortSignal.timeout(15000)});
      if(!response.ok)continue;
      const buffer=Buffer.from(await response.arrayBuffer());
      const metadata=await sharp(buffer).metadata();
      if((metadata.width||0)<200)continue;
      await sharp(buffer).resize({width:960,withoutEnlargement:true}).webp({quality:85}).toFile(`public${path}`);
      previews[url]=path;break;
    }
    if(!previews[url])console.warn('No automatic preview available:',parsed.hostname,parsed.pathname);
  }catch(error){console.warn('Could not update media preview:',error.message);}
}
await writeFile('src/data/media-previews.json',JSON.stringify(previews,null,2)+'\n');
console.log(`Local media previews: ${Object.keys(previews).length}/${new Set(entries.map(entry=>entry.url)).size}`);
