import test from 'node:test';
import assert from 'node:assert/strict';
import {formatEventDate,groupEvents} from '../src/lib/events.ts';

test('German dates and Uhr notation, including minutes and time ranges',()=>{
  assert.equal(formatEventDate({startDate:'2026-10-23',startTime:'19:30'}),'23. Oktober 2026, 19:30 Uhr');
  assert.equal(formatEventDate({startDate:'2024-09-02',startTime:'19:00',endTime:'23:00'}),'2. September 2024, 19:00–23:00 Uhr');
  assert.equal(formatEventDate({startDate:'2026-03-29',endDate:null,startTime:null}),'29. März 2026');
});

test('Multi-day concerts retain their complete calendar range',()=>{
  assert.equal(formatEventDate({startDate:'2017-09-04',endDate:'2017-09-17'}),'4.–17. September 2017');
  assert.equal(formatEventDate({startDate:'2026-09-30',endDate:'2026-10-02'}),'30. September – 2. Oktober 2026');
  assert.equal(formatEventDate({startDate:'2026-12-31',endDate:'2027-01-02'}),'31. Dezember 2026 – 2. Januar 2027');
});

test('Ongoing ranges stay current, chronological order uses times, and input is unchanged',()=>{
  const fixture=(startDate,startTime='',endDate='')=>({startDate,startTime,endDate,venue:'Köln',description:'Konzert'});
  const events=[fixture('2026-10-23','20:00'),fixture('2026-10-20'),fixture('2026-10-22','', '2026-10-24'),fixture('2026-10-23','18:00'),fixture('2026-10-21')];
  const original=structuredClone(events);
  const grouped=groupEvents(events,'2026-10-23');
  assert.deepEqual(grouped.upcoming.map(event=>event.startDate+' '+event.startTime),['2026-10-22 ','2026-10-23 18:00','2026-10-23 20:00']);
  assert.deepEqual(grouped.archive.map(event=>event.startDate),['2026-10-21','2026-10-20']);
  assert.deepEqual(events,original);
});

test('Invalid dates and times cannot silently roll into another day',()=>{
  assert.throws(()=>formatEventDate({startDate:'2026-02-30'}),/Ungültiges/);
  assert.throws(()=>formatEventDate({startDate:'2026-10-23',startTime:'25:30'}),/Ungültige/);
  assert.throws(()=>formatEventDate({startDate:'2026-10-23',endDate:'2026-10-22'}),/Enddatum/);
});
