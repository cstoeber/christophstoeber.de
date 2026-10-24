const key='media-consent-v1';
const allowed=new Set<string>();
try{
  const stored=JSON.parse(sessionStorage.getItem(key)||'[]');
  if(Array.isArray(stored))for(const provider of stored)if(['video','spotify','soundcloud'].includes(provider))allowed.add(provider);
}catch{}
const entries=[...document.querySelectorAll<HTMLElement>('.media-entry')];
const previews=new Map(entries.map(entry=>[entry,entry.querySelector('.media')!.firstElementChild!.cloneNode(true)]));
const dialog=document.querySelector<HTMLDialogElement>('.media-dialog');
let pendingEntry:HTMLElement|null=null;
function requestConsent(entry:HTMLElement,event:MouseEvent){
  if(!dialog)return;
  pendingEntry=entry;
  const label=entry.dataset.provider==='video'?'YouTube':entry.dataset.provider==='spotify'?'Spotify':'SoundCloud';
  dialog.querySelectorAll('.media-dialog-provider').forEach(node=>{node.textContent=label;});
  dialog.style.left='16px';
  dialog.style.top='16px';
  dialog.showModal();
  const box=dialog.getBoundingClientRect();
  const confirm=dialog.querySelector('.media-dialog-confirm')!.getBoundingClientRect();
  const trigger=entry.querySelector('.media-preview')!.getBoundingClientRect();
  const x=event.detail?event.clientX:trigger.left+trigger.width/2;
  const y=event.detail?event.clientY:trigger.top+trigger.height/2;
  const left=x-(confirm.left-box.left+confirm.width/2);
  const top=y+36-(confirm.top-box.top+confirm.height/2);
  dialog.style.left=`${Math.max(16,Math.min(left,window.innerWidth-box.width-16))}px`;
  dialog.style.top=`${Math.max(16,Math.min(top,window.innerHeight-box.height-16))}px`;
}
dialog?.addEventListener('close',()=>{pendingEntry=null;});
dialog?.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const box=dialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
});
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
    if(allowed.has(entry.dataset.provider!))load(entry,true);
    else requestConsent(entry,event);
  }
  if(target?.closest('.media-dialog-cancel'))dialog?.close();
  if(target?.closest('.media-dialog-confirm')&&pendingEntry){
    const entry=pendingEntry;
    dialog?.close();
    const provider=entry.dataset.provider!;
    allowed.add(provider);
    try{sessionStorage.setItem(key,JSON.stringify([...allowed]));}catch{}
    for(const other of entries)if(other.dataset.provider===provider)load(other,other===entry);
  }
  if(target?.closest('.media-reset')){
    dialog?.close();
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
