interface Page { id:string; data:{title:string}; }
export function resolveNavigation(items:{href:string}[],pages:Page[]){
  const titles=new Map(pages.map(page=>[page.id==='start'?'/':`/${page.id}/`,page.data.title]));
  const seen=new Set<string>();
  return items.map(({href})=>{
    const label=titles.get(href);
    if(!label)throw new Error(`Menüziel ohne Seite: ${href}`);
    if(seen.has(href))throw new Error(`Doppeltes Menüziel: ${href}`);
    seen.add(href);
    return {href,label};
  });
}
