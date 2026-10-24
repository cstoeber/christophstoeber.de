import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const manifestPath=path.resolve('.generated/responsive-images.json');
const images=existsSync(manifestPath)?JSON.parse(readFileSync(manifestPath,'utf8')):{};

export const imageSizes={
  project:'(max-width: 650px) calc(100vw - 44px), (max-width: 959px) calc((100vw - 92px) / 2), (max-width: 1120px) calc((100vw - 112px) / 2), 504px',
  gallery:'(max-width: 650px) calc(100vw - 44px), (max-width: 959px) calc((100vw - 88px) / 2), (max-width: 1120px) calc((100vw - 112px) / 3), 336px',
  preview:'(max-width: 767px) calc(100vw - 44px), (max-width: 1120px) calc((100vw - 94px) / 2), 513px',
  richtext:'(max-width: 650px) calc(100vw - 44px), (max-width: 959px) 640px, 390px',
};
export function responsiveImageAttributes(src,sizes,sourceImages=images){
  let key;
  try{key=decodeURIComponent(src.split(/[?#]/)[0]);}catch{return {src};}
  const image=sourceImages[key];
  if(!image?.variants?.length)return {src};
  const fallback=image.variants.find(variant=>variant.width>=960)||image.variants.at(-1);
  return {src:fallback.src,srcset:image.variants.map(variant=>`${variant.src} ${variant.width}w`).join(', '),sizes,width:image.width,height:image.height};
}
export function heroImageSizes(src){
  const image=images[decodeURIComponent(src)];
  const ratio=image?image.width/image.height:1.5;
  return `(max-width: 959px) max(100vw, calc((100svh - 80px) * ${ratio.toFixed(4)})), (max-width: 1120px) calc(100vw - 64px), 1056px`;
}
