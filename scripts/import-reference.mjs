// One-time migration from the original public Jimdo pages saved in .reference/.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';
import TurndownService from 'turndown';
const td = new TurndownService({ headingStyle: 'atx' });
const pages = { start: 'Start', termine: 'Termine', lebenslauf: 'Lebenslauf', projekte: 'Projekte', 'musik-videos': 'Musik/Videos', unterricht: 'Unterricht', produktion: 'Produktion', astronaut: 'Astronaut' };
await mkdir('src/content/pages', {recursive:true});
await mkdir('src/data', {recursive:true});
await mkdir('public/images', {recursive:true});
const assets = [];
for (const [slug,title] of Object.entries(pages)) {
  const $ = load(await readFile(`.reference/${slug}.html`, 'utf8'));
  const root = $('#content_area');
  root.find('script,style,.cc-m-hgrid-overlay,.cc-clear').remove();
  const videos=[];
  root.find('iframe').each((i,el)=>{
    const src=$(el).attr('src');
    if(src) videos.push({title: src.includes('youtube') ? `${title} – Video ${i+1}` : src.includes('spotify') ? 'Astronaut auf Spotify' : 'Königsmörder Podcast', url:src});
    $(el).remove();
  });
  root.find('img').each((i,el)=>{
    const img=$(el), url=img.attr('src');
    if(!url) return;
    const name=`${slug}-${i+1}.${url.endsWith('.png')?'png':'jpg'}`;
    assets.push({url:url.replace('dimension=910x10000','dimension=1820x10000'),path:`public/images/${name}`});
    img.attr('src',`/images/${name}`).removeAttr('srcset').removeAttr('style');
    if(!img.attr('alt')) img.attr('alt',slug==='lebenslauf'?'Porträt von Christoph Stöber':`${title} – ${i===1?'Astronaut':i===2?'Ensemble uBu':'Liedduo Schumacher/Stöber'}`);
    const caption=img.closest('figure').find('figcaption').text();
    if(caption) img.after(`<p><em>${caption}</em></p>`);
  });
  root.find('figcaption').remove();
  root.find('[style]').removeAttr('style');
  root.find('h1').first().remove();
  let body=td.turndown(root.html() || '').replace(/\n{3,}/g,'\n\n').trim();
  const data={title,description: $('meta[name="description"]').attr('content') || `${title} – Christoph Stöber, Pianist in Köln.`,videos};
  if(slug==='start') {data.hero='/images/start-1.jpg'; data.heroAlt='Christoph Stöber am See im Park'; data.credit='© Malte Hömberg';body='';}
  if(slug==='termine') {
    const events=[];
    root.find('.j-hgrid').each((i,el)=>{
      const cols=$(el).children('.cc-m-hgrid-column');
      if(cols.length!==2) return;
      const details=cols.first().find('p').map((i,p)=>$(p).text().replace(/\s+/g,' ').trim()).get().filter(Boolean);
      const description=cols.last().find('p').map((i,p)=>$(p).text().replace(/\s+/g,' ').trim()).get().filter(Boolean).join('\n\n');
      const links=cols.last().find('a[href]').map((i,a)=>({label:$(a).text().trim(),url:$(a).attr('href')})).get();
      const dateMatch=details[0]?.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      const startDate=dateMatch?`${dateMatch[3]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[1].padStart(2,'0')}`:'';
      if(details[0] && description) events.push({date:details[0],startDate,venue:details.slice(1).join(', '),description,links});
    });
    await writeFile('src/data/events.json',JSON.stringify({events},null,2)+'\n');
    body='';
  }
  await writeFile(`src/content/pages/${slug}.md`,`---\n${Object.entries(data).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n${body}\n`);
}
await writeFile('.reference/assets.json',JSON.stringify(assets,null,2));
console.log(`Imported ${Object.keys(pages).length} pages and ${assets.length} images.`);
