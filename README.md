# Ritme

Een Nederlandse habit-app voor kleine, bewuste stappen. React, TypeScript en Vite; je gewoontes en registraties worden in IndexedDB bewaard. De app begint leeg en verstuurt geen gebruikersgegevens. Geen account of backend nodig.

## Starten

Node.js 22.12 of nieuwer (getest met 24.19; zie `.nvmrc`).

```sh
npm ci
npm run dev
```

De ontwikkelserver luistert op poort 5173. Voor de gebouwde app, inclusief offline ondersteuning:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Gebruik de bestaande checkout in `/workspace/Ritme` in de cloudomgeving. Een aparte Git-worktree is niet nodig. Servers moeten na een nieuwe sessie opnieuw worden gestart.

## Wat werkt

- **Vandaag:** weekstrip, een datum kiezen, terugblik op gisteren, snelle registratie en correctie. Ongedaan maken is 10 seconden beschikbaar; oudere registraties zijn ook later te wijzigen.
- **Vier meetwijzen:** ja/nee met optioneel tijdstip, minimum, maximum met expliciet afronden, vermijden met momenten en dagbevestiging.
- **Gewoontes:** toevoegen, aanpassen, pauzeren, hervatten, archiveren en bevestigd verwijderen. Optionele reden en een eigen reactie op een verleiding.
- **Planning:** dagelijks, vaste weekdagen, of een aantal behaalde dagen per kalenderweek. Een week loopt maandag t/m zondag. Vrije dagen bij weekdoelen zijn geen dagelijkse verplichtingen.
- **Historie:** onbekend, open, gelukt, niet gelukt en niet gepland blijven onderscheiden. Datumkeuze gebruikt de lokale kalender, ook bij zomer-/wintertijd. Het tijdstip bij ja/nee bepaalt nooit automatisch succes.
- **Inzicht:** week/maand, kalender per gewoonte, geregistreerde gemiddelden en onbekende dagen. Weekdoelen tonen behaalde dagen of bevestigde weken.
- **Gegevens:** gevalideerde JSON-import met overzicht en expliciete vervangbevestiging, JSON-export, bevestigd wissen. Thema systeem/licht/donker.
- **PWA:** manifest, app-iconen en een offline app-shell. Registratie werkt offline na het eerste volledige bezoek. Updates worden actief wanneer oude tabbladen gesloten zijn en de app opnieuw wordt geopend.

## Historische doelen

Wijzigingen aan doelen en planning gelden vanaf morgen. Zodra de bestaande of nieuwe planning een weekdoel is, gelden wijzigingen vanaf volgende maandag. De eerdere doelversies blijven bewaard en elke dagregistratie bewaart een snapshot van het gebruikte doel. Naam, pictogram en toelichtingen veranderen direct. De meetwijze blijft vast; maak een nieuwe gewoonte voor een andere meetwijze.

Een pauze of archivering sluit de periode uit van nieuwe planning; bestaande registraties blijven zichtbaar. Bij hervatten blijft de pauzehistorie behouden. Een begonnen of gedeeltelijk gepauzeerde week verlaagt het weekdoel niet stilzwijgend; inzicht vermeldt het als er minder beschikbare dagen zijn dan het doel.

## Op je telefoon

Publiceer de inhoud van `dist/` op een statische host met HTTPS, op de hoofdroute `/`. Een productiehosting is niet inbegrepen in deze repository. Daarna kan de browser de app installeren. Op iPhone: Safari → Deel → Zet op beginscherm. De browser bepaalt of en hoe de installatieoptie wordt getoond.

Offline functionaliteit is op de productiebuild gecontroleerd in Chromium, met mobiele emulatie en desktop. Installatie op fysieke iOS-/Android-apparaten is nog niet getest. De Vite-ontwikkelserver activeert geen serviceworker.

## Privacy en grenzen

Gegevens zijn gebonden aan de browser, het profiel en het webadres. Maak een export vóór het wisselen van browser of adres. Lokale opslag is geen beveiligde kluis en geen automatische back-up; wissen van browsergegevens wist ook Ritme. Import vervangt alle huidige gegevens in één opslagtransactie en weigert een ongeldig bestand voordat het iets schrijft. Exporteer eerst als je de bestaande gegevens wilt bewaren.

Er zijn geen meldingen, automatische schermtijdmeting, websiteblokkade, accounts of synchronisatie. Een gewenst tijdstip is alleen een richttijd. Gewoontes, registraties en exports worden niet naar externe diensten verzonden. Exports bevatten wel je persoonlijke gegevens; bewaar ze zorgvuldig.

## Controles

```sh
npm test
npm run build
npm run test:e2e
npm run format:check
```

De Playwright-tests starten een eigen productiepreview op poort 4175 en gebruiken een leeg, geïsoleerd browserprofiel per test. Ze raken je persoonlijke opslag niet. De cloudomgeving gebruikt `/usr/bin/chromium`; elders kun je `CHROMIUM_PATH` instellen of een Playwright-browser installeren met `npx playwright install chromium`.

De tests bestrijken berekeningen, datumgrenzen, planning, doelversies, importvalidatie, IndexedDB, browserinteracties, offline herladen, meerdere tabbladen, bevestigde verwijdering en toegankelijkheidscontroles met axe. Browsercontroles zijn geen vervanging voor een test met een echt mobiel toetsenbord of een screenreader.

## Opbouw

- `src/model.ts`: kalender, gegevensschema, planning en beoordelingen.
- `src/storage.ts`: gevalideerde IndexedDB-opslag.
- `src/App.tsx`: navigatie en geserialiseerde opslagbewerkingen; Web Locks en BroadcastChannel voorkomen overschrijven tussen tabbladen in ondersteunde browsers.
- `src/components/`: invoer, historie/inzicht, instellingen en dialoogvensters.
- `src/styles.css`: responsieve vormgeving, thema’s en reduced-motion-ondersteuning.
- `docs/BOUWPLAN.md`: het oorspronkelijke bouwplan.
- `HANDOFF.md`: actuele voortgang en vervolgwerk.
