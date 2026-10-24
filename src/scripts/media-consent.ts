const key='media-consent-v1';
const allowed=new Set<string>();
try{
  const stored=JSON.parse(sessionStorage.getItem(key)||'[]');
  if(Array.isArray(stored))for(const provider of stored)if(['video','spotify','soundcloud'].includes(provider))allowed.add(provider);
}catch{}
const entries=[...document.querySelectorAll<HTMLElement>('.media-entry')];
const previews=new Map(entries.map(entry=>[entry,entry.querySelector('.media')!.firstElementChild!.cloneNode(true)]));
function load(entry:HTMLElement,play=false){
  const media=entry.querySelector('.media')!;
  if(media.querySelector('iframe'))return;
  const url=new URL(entry.dataset.url!.replaceAll('&amp;','&'));
  if(play&&entry.dataset.provider==='video')url.searchParams.set('autoplay','1');
  if(play&&entry.dataset.provider==='soundcloud')url.searchParams.set('auto_play','true');
  const iframe=document.createElement('iframe');
  iframe.src=url.href;
  iframe.title=entry.dataset.title!;
  iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
  iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  media.replaceChildren(iframe);
  entry.classList.add('is-authorized');
  if(play)iframe.focus();
}
for(const entry of entries)if(allowed.has(entry.dataset.provider!))load(entry);
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest('.media-preview');
  if(button){
    const entry=button.closest<HTMLElement>('.media-entry')!;
    const provider=entry.dataset.provider!;
    allowed.add(provider);
    try{sessionStorage.setItem(key,JSON.stringify([...allowed]));}catch{}
    for(const other of entries)if(other.dataset.provider===provider)load(other,other===entry);
  }
  if(target?.closest('.media-reset')){
    allowed.clear();
    try{sessionStorage.removeItem(key);}catch{}
    for(const entry of entries){
      entry.querySelector('.media')!.replaceChildren(previews.get(entry)!.cloneNode(true));
      entry.classList.remove('is-authorized');
    }
    const status=document.querySelector('.media-reset-status');
    if(status)status.textContent='Medienfreigaben zurückgesetzt.';
  }
});
