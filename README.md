# christophstoeber.de

Nachbau der öffentlichen Künstlerwebsite mit Astro und Decap CMS. Die acht Hauptseiten, Texte, Fotos und Medienverweise wurden aus der bisherigen Jimdo-Website übernommen. Inhalte liegen als Markdown bzw. JSON im Repository. Bilder, Schriftarten und Decap werden lokal ausgeliefert.

## Starten

Voraussetzung: Node.js 22.12 oder neuer; empfohlen Node.js 24.

```sh
npm install
npm run dev
```

Website: `http://localhost:4321/`.

Zum lokalen Bearbeiten in einem zweiten Terminal im Projektverzeichnis:

```sh
npm run cms
```

CMS: `http://localhost:4321/admin/`. Der Decap-Proxy läuft lokal auf Port 8081; Änderungen werden direkt in die Inhaltsdateien geschrieben. Den lokalen Proxy nur auf dem Entwicklungsrechner betreiben. Zum Beenden in beiden Terminals Strg+C drücken.

```sh
npm run build
npm run preview
```

Der Build prüft die Astro-Dateien und erzeugt eine statische Website in `dist/`.

## Inhalte

- `src/content/pages/*.md`: Seiten, Suchmaschinenbeschreibungen, Startbild und Medien.
- `src/content/projects/*.md`: einzeln im CMS anlegbare Projekte mit Bild, Alt-Text, Caption, Copyright, Text, Links, Reihenfolge und Sichtbarkeit.
- `src/content/media/*.md`: im CMS unter „Medienabschnitte“ pflegbare Abschnitte mit Überschrift, Richtext-Beschreibung, Videos/Musik, Reihenfolge und Sichtbarkeit. Die optionale Projektzuordnung erzeugt beim Projekt automatisch einen Link zum Abschnitt auf `/musik-videos/`. Über „Verknüpfte Medien verlinken“ lässt sich dieser Link pro Projekt abschalten. Ohne Zuordnung steht der Abschnitt frei auf der Medienseite.

Projektlinks haben im CMS ein Icon-Feld: automatisch aus der URL, Website, E-Mail, Instagram, YouTube, SoundCloud, Linktree, Spotify oder kein Icon. URL, Linktext und optionaler Präfix sind pro Link bearbeitbar. Unterricht und Footer verwenden denselben Kontaktbutton mit Briefumschlag und „Kontakt aufnehmen“; der Unterrichtsbutton ergänzt den E-Mail-Betreff.

Unter „Seiten → Unterricht → Unterrichtsanfrage“ sind Überschrift, Anfragetext, Buttontext und E-Mail-Betreff bearbeitbar. Die Empfängeradresse kommt weiterhin aus „Website & Kontakt“.

Unter „Menü → Menüpunkte & Reihenfolge“ lassen sich die Navigationseinträge per Drag-and-drop verschieben. Beschriftung und Zielseite sind dort ebenfalls bearbeitbar. `src/data/navigation.json` bestimmt die Reihenfolge für Desktop und Mobilmenü; Änderungen erscheinen lokal sofort und produktiv nach dem nächsten Build.
- `src/data/tuition.json`: Unterrichtsmodelle und unverändert übernommene Preise; separat im CMS unter „Unterrichtspreise“ pflegbar.
- `src/data/events.json`: Konzerttermine mit Datum, Ort und Programm.
- `src/data/settings.json`: Website-Titel und Kontaktdaten.
- `src/content/legal/*.md`: Impressum und Datenschutz.
- `public/images/`: übernommene Bilder und neue CMS-Uploads.
- `public/admin/config.yml`: Decap-Konfiguration für `cstoeber/christophstoeber.de`, Branch `main`.

Die bisherigen Konzertdaten wurden unverändert übernommen, auch erkennbare Datums- oder Preisauffälligkeiten der Vorlage. Sie sind vor einer Veröffentlichung redaktionell zu prüfen. Medien stehen auf Desktop in zwei Spalten, auf schmalen Ansichten untereinander. Alle Player (YouTube, Spotify, SoundCloud) laden erst nach ausdrücklicher Freigabe des jeweiligen Anbieters. Der Anbieter wird für die Sitzung über `sessionStorage` freigegeben; weitere Player desselben Anbieters laden dann direkt. „Medienfreigaben zurücksetzen“ im Footer löscht die Freigaben und entfernt geladene Player. Bereits von Anbietern gesetzte Cookies werden dabei nicht gelöscht.

Vorschaubilder werden ausschließlich lokal ausgeliefert. `npm run build` ruft zunächst `scripts/sync-media-previews.mjs` auf: fehlende Standbilder und Cover werden serverseitig geladen, in WebP umgewandelt und in `public/images/media-previews/` gespeichert. Vorhandene Dateien werden wiederverwendet; die Zuordnung liegt in `src/data/media-previews.json`. Im CMS kann pro Medium ein eigenes Vorschaubild hinterlegt werden. Für nicht verfügbare automatische Vorschauen dient das lokale Astronaut-Bild als Ersatz. Ein Vorschauklick öffnet einen kleinen Dialog nahe dem Klickpunkt; erst „Zustimmen & laden“ erteilt die Freigabe. Escape, Abbrechen oder ein Klick außerhalb schließen ohne Freigabe. Die Bestätigung fordert bei YouTube/SoundCloud auch die Wiedergabe an; Spotify wird als quadratischer Player geladen und steuert den Wiedergabestart selbst.

Jeder Medienabschnitt hat eine optionale „Bildergalerie“ im CMS. Pro Bild sind Datei, Alternativtext, Bildunterschrift und Copyright pflegbar. Die Listenreihenfolge bestimmt die Bildreihenfolge. Das Raster zeigt ab 960 Pixel drei, auf Tablets zwei und bis 650 Pixel eine Spalte. Ohne Bilder wird kein Galerieblock ausgegeben.

Im CMS unter „Konzerttermine“ wird das Konzertdatum über den Kalender gewählt. Optional sind Enddatum sowie Beginn und Ende als Uhrzeit im Format HH:MM. Ein zusätzlich ausgeschriebenes Datum ist nicht mehr nötig: Die Website erzeugt beispielsweise „23. Oktober 2026, 19:30 Uhr“, „2. September 2024, 19:00–23:00 Uhr“ oder „4.–17. September 2017“. Alle bisherigen Termine und Uhrzeiten wurden in diese Felder übertragen. Bei mehrtägigen Veranstaltungen steuert das Enddatum die Archivzuordnung.

Kommende Termine werden aufsteigend, vergangene absteigend sortiert. Ohne kommende Termine entfällt der Abschnitt „Demnächst“. Die letzten drei vergangenen Termine sind immer sichtbar; alle älteren lassen sich über den zentrierten Pfeil ohne zusätzliche Abstände einblenden. Die Zuordnung wird bei jedem Build in der Zeitzone Europe/Berlin neu berechnet. Für einen automatischen täglichen Wechsel kann das Hosting täglich einen Build auslösen.

Bilder im Richtext bleiben an ihrer eingefügten Position. Auf Desktop (ab 960 Pixel) stehen sie links auf der halben Textcontainerbreite, der Text fließt rechts daneben. Auf kleineren Bildschirmen stehen sie zentriert ohne Textumfluss, mit maximal 640 Pixel Breite. Die Bildhöhe ist auf 560 Pixel begrenzt. Kleine Bilder werden nicht hochskaliert, Hochformatbilder nicht beschnitten. Ein optionaler Markdown-Bildtitel bzw. direkt folgender kursiver Fotohinweis wird als Bildunterschrift dargestellt. Die separaten Projektbilder behalten ihr eigenes Layout.

`npm test` prüft Datums-/Uhrzeitformatierung, Datumsbereiche, Archivsortierung und die Reihenfolge von Richtext-Bildern und Texten. `scripts/migrate-event-dates.mjs` kann ältere importierte Terminbestände einmalig in die strukturierten Felder überführen; der Referenzimport ruft es automatisch auf.

Der Facelift bleibt monochrom mit den bestehenden Schriften Karla und Merriweather. Die Startseite bleibt beim Originalfoto; die Navigation priorisiert Unterricht und Projekte. Der Titel führt zurück zur Startseite. Unterhalb von 960 Pixeln ersetzt das Mobilmenü die einzeilige Navigation.

„Produktion“ wird als Projekt inklusive SoundCloud-Player gepflegt. `/produktion/` leitet nach `/projekte/#produktion` weiter: mit HTTP 301 auf Netlify über `public/_redirects`, auf sonstigen rein statischen Hosts über die von Astro erzeugte Weiterleitungsseite. Für andere Hoster kann eine entsprechende serverseitige 301-Regel ergänzt werden.

Die frühere Astronaut-Unterseite ist durch den mit dem Projekt verknüpften Medienabschnitt ersetzt. Alle vier Einbettungen sind erhalten; `/astronaut/` leitet dauerhaft nach `/musik-videos/#astronaut` weiter. Astronaut bleibt als Projekt erhalten und wird nicht mehr als eigene Seite im Menü geführt.

Social-Media-Links liegen in den Kontaktdaten und sind dort im CMS pflegbar. Ein eigener zentrierter E-Mail-Button steht unterhalb des Kontaktbereichs. Die Navigation bleibt beim Scrollen am oberen Rand sichtbar. Der öffentliche Anmeldelink wurde entfernt; das CMS bleibt direkt unter `/admin/` erreichbar. Die Unterrichtsseite enthält zusätzlich einen E-Mail-Aufruf mit vorbelegtem Betreff.

SEO: individuelle Seitentitel und Beschreibungen, Canonical-URLs, XML-Sitemap, Open-Graph-/Twitter-Vorschaudaten und strukturierte Daten für Person, Website und Seiten. Die Fehlerseite ist von der Indexierung ausgeschlossen. Sichtbare vorhandene Beschreibungstexte wurden dafür nicht umgeschrieben.

## GitHub und Hosting

Der Quellcode liegt auf https://github.com/cstoeber/christophstoeber.de im Branch `main`. Das Netlify-Projekt heißt `christophstoeber`, die Netlify-Adresse lautet https://christophstoeber.netlify.app. Lokale Zugangsdaten und die Projektverknüpfung unter `.netlify/` sind vom Repository ausgeschlossen. Die bestehende Domain wird durch ein Deployment auf die Netlify-Adresse nicht umgestellt.

Für ein Hosting auf Netlify ist `netlify.toml` vorbereitet: Build `npm run build`, Ausgabeverzeichnis `dist`, Node.js 24. Repository mit dem Hosting verbinden; jeder CMS-Commit kann dann einen neuen Build auslösen.

Für die GitHub-Anmeldung im veröffentlichten Decap CMS ist ein OAuth-Provider erforderlich. Bei Netlify eine GitHub OAuth App einrichten und deren Client-ID und Client-Secret unter den OAuth-Authentifizierungseinstellungen des Hostingprojekts hinterlegen. Die Callback-Adresse wird vom gewählten OAuth-Provider vorgegeben. Das Secret gehört ausschließlich in die Hostingkonfiguration, niemals ins Repository oder in die öffentliche CMS-Konfiguration. Alternativ einen eigenen Decap-kompatiblen OAuth-Server betreiben und dessen `base_url` und `auth_endpoint` unter `backend` eintragen.

Offizielle Anleitung: https://decapcms.org/docs/github-backend/

Ohne diese externe Einrichtung funktioniert das CMS lokal, die produktive GitHub-Anmeldung ist noch nicht aktiviert.

## Vor der Veröffentlichung

Die alte Impressumsseite enthielt nur einen Jimdo-Werbetext. Die neue Seite enthält die übernommenen Kontakt- und Bildangaben. Impressum und Datenschutzhinweise sind Entwürfe; Netlify ist als Hostinganbieter eingetragen. Die rechtlichen Seiten müssen weiterhin geprüft werden.

Die Originalfotos und ihre vorhandenen Bildnachweise wurden übernommen. Weitere Bildrechte und Nachweise vor der Veröffentlichung prüfen.

Die aktuelle Decap-Version bringt ältere transitive Abhängigkeiten mit: npm meldet dafür auch hohe Sicherheitswarnungen. Der öffentliche Auftritt ist statisch; der CMS-Client wird getrennt unter `/admin/` geladen. Die Warnungen sind damit nicht behoben. Abhängigkeitsupdates vor einer produktiven CMS-Freigabe prüfen; es wurden keine erzwungenen Paket-Downgrades vorgenommen.

## Migration

Die einmaligen Importwerkzeuge unter `scripts/` sind für die dokumentierte Migration gedacht. Die heruntergeladenen Originalseiten liegen ausschließlich im ignorierten `.reference/`-Verzeichnis. Erneutes Ausführen des Imports überschreibt redaktionelle Inhaltsänderungen; im normalen Betrieb nur über Decap oder die Inhaltsdateien bearbeiten.
