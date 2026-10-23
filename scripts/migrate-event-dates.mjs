import {readFile,writeFile} from 'node:fs/promises';
const path='src/data/events.json';
const data=JSON.parse(await readFile(path,'utf8'));
const iso=(year,month,day)=>`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
const clock=value=>{
  if(!value)return '';
  const match=/^(\d{1,2})(?:(?:h|:)(\d{2})?)?(?:\s*Uhr)?$/i.exec(value.trim());
  if(!match)throw new Error(`Uhrzeit konnte nicht übernommen werden: ${value}`);
  return `${match[1].padStart(2,'0')}:${match[2]||'00'}`;
};
let migrated=0;
data.events=data.events.map(event=>{
  if(!Object.hasOwn(event,'date'))return event;
  const {date,startDate,...content}=event;
  const [datePart,timePart='']=date.split(',');
  const range=/^(\d{1,2})\.(\d{1,2})\.\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(datePart.trim());
  const single=/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(datePart.trim());
  if(!range&&!single)throw new Error(`Datum konnte nicht übernommen werden: ${date}`);
  const beginning=startDate||(range?iso(range[5],range[2],range[1]):iso(single[3],single[2],single[1]));
  const [from,to]=timePart.trim().split(/\s*[-–]\s*/);
  migrated++;
  return {startDate:beginning,endDate:range?iso(range[5],range[4],range[3]):'',startTime:clock(from),endTime:clock(to),...content};
});
if(migrated)await writeFile(path,JSON.stringify(data,null,2)+'\n');
console.log(`${migrated} Konzerttermine in Datum-/Uhrzeitfelder übernommen.`);
