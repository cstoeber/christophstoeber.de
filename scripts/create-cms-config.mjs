import {writeFile} from 'node:fs/promises';
import YAML from 'yaml';
const pages={start:'Start',termine:'Termine',lebenslauf:'Lebenslauf',projekte:'Projekte','musik-videos':'Musik/Videos',unterricht:'Unterricht',astronaut:'Astronaut'};
const field=(name,label,widget='string',extra={})=>({name,label,widget,...extra});
const config={
  backend:{name:'github',repo:'cstoeber/christophstoeber.de',branch:'main'},
  local_backend:true, locale:'de',site_url:'https://www.christophstoeber.de',display_url:'https://www.christophstoeber.de',
  media_folder:'public/images',public_folder:'/images',
  collections:[
    {name:'navigation',label:'Menü',files:[{name:'navigation',label:'Menüpunkte & Reihenfolge',file:'src/data/navigation.json',fields:[field('items','Menüpunkte','list',{summary:'{{fields.label}}',collapsed:true,min:1,hint:'Einträge per Drag-and-drop verschieben. Die Reihenfolge gilt für Desktop und Mobilmenü.',fields:[field('label','Beschriftung'),field('href','Zielseite','select',{options:Object.entries(pages).map(([slug,label])=>({label,value:slug==='start'?'/':`/${slug}/`}))})]})]}]},
    {name:'projects',label:'Projekte',label_singular:'Projekt',folder:'src/content/projects',create:true,slug:'{{slug}}',identifier_field:'title',summary:'{{title}}',sortable_fields:['order','title'],fields:[
      field('title','Titel'),field('order','Reihenfolge','number',{value_type:'int',min:0,default:1}),field('published','Sichtbar','boolean',{default:true}),
      field('image','Bild','image',{required:false,default:''}),field('imageAlt','Bildbeschreibung (Barrierefreiheit)','string',{required:false,default:''}),field('caption','Bildunterschrift','string',{required:false,default:''}),field('copyright','Copyright / Fotografie','string',{required:false,default:''}),
      field('videos','Videos & Musik','list',{required:false,fields:[field('title','Titel'),field('url','Einbettungs-URL')]}),
      field('body','Projekttext','markdown'),field('links','Links','list',{required:false,summary:'{{fields.label}}',fields:[field('prefix','Text vor dem Link','string',{required:false,default:''}),field('label','Linktext'),field('url','Adresse'),field('icon','Icon','select',{default:'auto',options:[{label:'Automatisch anhand der URL',value:'auto'},{label:'Website',value:'website'},{label:'E-Mail',value:'email'},{label:'Instagram',value:'instagram'},{label:'YouTube',value:'youtube'},{label:'SoundCloud',value:'soundcloud'},{label:'Linktree',value:'linktree'},{label:'Spotify',value:'spotify'},{label:'Kein Icon',value:'none'}]})]})
    ]},
    {name:'pages',label:'Seiten',files:Object.entries(pages).map(([name,label])=>({name,label,file:`src/content/pages/${name}.md`,fields:[
      field('title','Titel'),field('description','Beschreibung für Suchmaschinen','text'),
      ...(name==='start'?[field('hero','Startbild','image'),field('heroAlt','Bildbeschreibung'),field('credit','Bildnachweis')]:[]),
      ...(name==='projekte'?[]:[field('body','Inhalt','markdown',{required:false})]),
      ...(name==='unterricht'?[field('inquiry','Unterrichtsanfrage','object',{fields:[field('title','Überschrift'),field('text','Anfragetext','text'),field('buttonLabel','Buttontext'),field('subject','E-Mail-Betreff')]})]:[]),
      field('videos','Videos & Musik','list',{required:false,fields:[field('title','Titel'),field('url','Einbettungs-URL')]})
    ]}))},
    {name:'tuition',label:'Unterrichtspreise',files:[{name:'tuition',label:'Preise & Unterrichtsmodelle',file:'src/data/tuition.json',fields:[field('title','Überschrift'),field('groups','Unterrichtsmodelle','list',{summary:'{{fields.audience}} {{fields.title}}',fields:[field('audience','Zielgruppe','select',{options:['Kinder und Jugendliche:','Erwachsene:']}),field('title','Modell / Kartenart','string',{required:false,default:''}),field('note','Hinweis','text',{required:false,default:''}),field('rows','Preise','list',{fields:[field('duration','Dauer / Anzahl'),field('price','Preis (mit Einheit)')]})]})]}]},
    {name:'events',label:'Konzerttermine',files:[{name:'events',label:'Termine verwalten',file:'src/data/events.json',fields:[field('events','Termine','list',{summary:'{{fields.startDate}} – {{fields.venue}}',fields:[
      field('startDate','Konzertdatum','datetime',{format:'YYYY-MM-DD',date_format:'DD.MM.YYYY',time_format:false,hint:'Die Website schreibt Datum und Uhrzeit automatisch aus.'}),
      field('endDate','Enddatum (bei mehrtägigen Terminen)','datetime',{required:false,format:'YYYY-MM-DD',date_format:'DD.MM.YYYY',time_format:false,default:''}),
      field('startTime','Beginn (HH:MM)','string',{required:false,default:'',pattern:['^$|^([01]?\\d|2[0-3]):[0-5]\\d$','Bitte eine Uhrzeit wie 19:30 eintragen.'],hint:'Optional. Zum Beispiel 19:30; „Uhr“ wird automatisch ergänzt.'}),
      field('endTime','Ende (HH:MM)','string',{required:false,default:'',pattern:['^$|^([01]?\\d|2[0-3]):[0-5]\\d$','Bitte eine Uhrzeit wie 21:00 eintragen.']}),
      field('venue','Veranstaltungsort'),field('description','Programm','text'),field('links','Weiterführende Links','list',{required:false,fields:[field('label','Linktext'),field('url','Adresse')]})
    ]})]}]},
    {name:'settings',label:'Website & Kontakt',files:[{name:'contact',label:'Kontaktdaten',file:'src/data/settings.json',fields:[field('title','Website-Titel'),field('name','Name'),field('street','Straße und Hausnummer'),field('city','Postleitzahl und Ort'),field('email','E-Mail'),field('socials','Social Media','list',{fields:[field('label','Bezeichnung'),field('url','Profil-URL')]})]}]},
    {name:'legal',label:'Rechtliche Seiten',files:['about','datenschutz'].map(name=>({name,label:name==='about'?'Impressum':'Datenschutz',file:`src/content/legal/${name}.md`,fields:[field('title','Titel'),field('body','Inhalt','markdown')]}))}
  ]
};
await writeFile('public/admin/config.yml','# GitHub-Anmeldung: OAuth-Provider beim Hosting einrichten (siehe README.md).\n'+YAML.stringify(config));
