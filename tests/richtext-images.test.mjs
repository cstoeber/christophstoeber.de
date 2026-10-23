import test from 'node:test';
import assert from 'node:assert/strict';
import {createMarkdownProcessor} from '@astrojs/markdown-remark';
import {load} from 'cheerio';
import editorialLayout from '../scripts/rehype-editorial-layout.mjs';

test('Richtext pictures remain between their surrounding text, without moving sections into columns',async()=>{
  const processor=await createMarkdownProcessor({rehypePlugins:[editorialLayout]});
  const result=await processor.render('## Unterricht\n\nVorher.\n\n![Flügel](/images/a.jpg "Mein Flügel")\n\nDanach.\n\n## Lebenslauf\n\n![Porträt](/images/b.jpg)\n\n_© Fotografin_\n\nBiografie.');
  const $=load(result.code);
  assert.deepEqual($('body').children().map((i,node)=>node.tagName).get(),['h2','p','figure','p','h2','figure','p']);
  assert.equal($('figure').length,2);
  assert.equal($('figcaption').eq(0).text(),'Mein Flügel');
  assert.equal($('figcaption').eq(1).text(),'© Fotografin');
  assert.equal($('figure img').eq(1).attr('alt'),'Porträt');
  assert.equal($('.image-text').length,0);
});

test('An italic text paragraph after an image remains text, not an invented caption',async()=>{
  const processor=await createMarkdownProcessor({rehypePlugins:[editorialLayout]});
  const $=load((await processor.render('![Porträt](/images/a.jpg)\n\n_Ein persönlicher Gedanke._\n\nWeiter.')).code);
  assert.equal($('figcaption').length,0);
  assert.equal($('p em').text(),'Ein persönlicher Gedanke.');
});
