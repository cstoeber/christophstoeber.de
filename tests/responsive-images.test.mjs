import test from 'node:test';
import assert from 'node:assert/strict';
import {responsiveImageAttributes} from '../scripts/responsive-image-attributes.mjs';

const images={'/images/flügel.jpg':{width:1400,height:900,variants:[{src:'/images/responsive/a-320.webp',width:320},{src:'/images/responsive/a-960.webp',width:960},{src:'/images/responsive/a-1400.webp',width:1400}]}};
test('CMS image URLs receive responsive candidates, intrinsic dimensions and layout sizes',()=>{
  const result=responsiveImageAttributes('/images/fl%C3%BCgel.jpg?v=2','50vw',images);
  assert.equal(result.src,'/images/responsive/a-960.webp');
  assert.equal(result.srcset,'/images/responsive/a-320.webp 320w, /images/responsive/a-960.webp 960w, /images/responsive/a-1400.webp 1400w');
  assert.equal(result.sizes,'50vw');
  assert.equal(result.width,1400);
  assert.equal(result.height,900);
});
test('Small images use their largest available size; unprocessed sources stay intact',()=>{
  const small={'/images/small.png':{width:100,height:80,variants:[{src:'/images/responsive/small.webp',width:100}]}};
  assert.equal(responsiveImageAttributes('/images/small.png','100px',small).src,'/images/responsive/small.webp');
  for(const src of ['/images/missing.jpg','https://example.com/photo.jpg','/images/logo.svg','/images/%invalid'])assert.deepEqual(responsiveImageAttributes(src,'100vw',images),{src});
});
