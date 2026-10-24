import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveNavigation} from '../src/lib/navigation.ts';

test('Navigation follows page titles, preserves menu order and maps the homepage',()=>{
  const pages=[{id:'start',data:{title:'Start'}},{id:'musik-videos',data:{title:'Bild und Ton'}}];
  const items=[{href:'/musik-videos/'},{href:'/'}];
  assert.deepEqual(resolveNavigation(items,pages),[{href:'/musik-videos/',label:'Bild und Ton'},{href:'/',label:'Start'}]);
  pages[1].data.title='Medien';
  assert.equal(resolveNavigation(items,pages)[0].label,'Medien');
  assert.deepEqual(items,[{href:'/musik-videos/'},{href:'/'}]);
});

test('Invalid or duplicate menu targets cannot silently produce inconsistent navigation',()=>{
  const pages=[{id:'unterricht',data:{title:'Unterricht'}}];
  assert.throws(()=>resolveNavigation([{href:'/fehlt/'}],pages),/ohne Seite/);
  assert.throws(()=>resolveNavigation([{href:'/unterricht/'},{href:'/unterricht/'}],pages),/Doppeltes/);
});
