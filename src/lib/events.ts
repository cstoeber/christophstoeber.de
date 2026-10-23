export interface ConcertEvent {
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  venue: string;
  description: string;
  links?: {label: string; url: string}[];
}

function calendarDate(value: string): Date {
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!match)throw new Error(`Ungültiges Konzertdatum: ${value}`);
  const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])));
  if(date.toISOString().slice(0,10)!==value)throw new Error(`Ungültiges Konzertdatum: ${value}`);
  return date;
}

function timeLabel(value: string): string {
  const match=/^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
  if(!match)throw new Error(`Ungültige Konzertuhrzeit: ${value}; erwartet HH:MM`);
  return `${match[1].padStart(2,'0')}:${match[2]}`;
}

export function formatEventDate(event: Pick<ConcertEvent,'startDate'|'endDate'|'startTime'|'endTime'>): string {
  const start=calendarDate(event.startDate);
  const formatter=new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  let label=formatter.format(start);
  if(event.endDate&&event.endDate!==event.startDate){
    const end=calendarDate(event.endDate);
    if(end<start)throw new Error('Das Konzert-Enddatum liegt vor dem Beginn.');
    if(start.getUTCFullYear()===end.getUTCFullYear()&&start.getUTCMonth()===end.getUTCMonth()){
      label=`${start.getUTCDate()}.–${formatter.format(end)}`;
    }else if(start.getUTCFullYear()===end.getUTCFullYear()){
      label=`${new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long',timeZone:'UTC'}).format(start)} – ${formatter.format(end)}`;
    }else label=`${label} – ${formatter.format(end)}`;
  }
  if(event.startTime){
    label+=`, ${timeLabel(event.startTime)}${event.endTime?`–${timeLabel(event.endTime)}`:''} Uhr`;
  }else if(event.endTime)throw new Error('Eine Endzeit benötigt auch eine Beginn-Uhrzeit.');
  return label;
}

export function groupEvents(events: ConcertEvent[], today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date())) {
  // Date-only values stay local calendar dates; no deployment timezone can shift them.
  for(const event of events)formatEventDate(event);
  const endDate=(event:ConcertEvent)=>event.endDate||event.startDate;
  const startKey=(event:ConcertEvent)=>`${event.startDate}T${event.startTime||'00:00'}`;
  return {
    upcoming:events.filter(event=>endDate(event)>=today).sort((a,b)=>startKey(a).localeCompare(startKey(b))),
    archive:events.filter(event=>endDate(event)<today).sort((a,b)=>endDate(b).localeCompare(endDate(a))||startKey(b).localeCompare(startKey(a))),
  };
}
