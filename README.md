# Ritme

**[Open Ritme](https://harberspepijn.github.io/Ritme/)** — werkt in de browser op telefoon, tablet en computer.

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

- **Vandaag:** compacte datumkop en dagelijkse voortgang zodra er gewoontes zijn, vaste rijvolgorde en direct zichtbare stand/doel. Minimumdoelen hebben +5/+15 minuten (of +1/+5 voor andere eenheden); de rij opent directe getalinvoer en correcties. Ongedaan maken is 10 seconden beschikbaar; oudere registraties zijn ook later te wijzigen.
- **Vier meetwijzen:** ja/nee met optioneel tijdstip, minimum, maximum met expliciet afronden, vermijden met momenten en dagbevestiging.
- **Gewoontes:** toevoegen met eerst richting, naam, meetwijze, doel en planning; pictogram, richttijd en persoonlijke details zijn uitklapbaar. Aanpassen, pauzeren, hervatten, archiveren en bevestigd verwijderen. Optionele reden en een eigen reactie op een verleiding.
- **Planning:** dagelijks, vaste weekdagen, of een aantal behaalde dagen per kalenderweek. Een week loopt maandag t/m zondag. Vrije dagen bij weekdoelen zijn geen dagelijkse verplichtingen.
- **Historie:** vandaag zonder invoer is nog open, een verstreken geplande dag zonder invoer onbekend, een toekomstige geplande dag toekomstig en een vrije dag niet gepland. Alle schermen delen dezelfde beoordeling en statuslabels. Datumkeuze gebruikt de lokale kalender, ook bij zomer-/wintertijd. Het tijdstip bij ja/nee bepaalt nooit automatisch succes.
- **Inzicht:** week/maand, kalender per gewoonte, geregistreerde gemiddelden, numerieke grafieken met historische doelgrenzen en exacte waarden in een uitklapbare tabel. Ontbrekende waarden blijven gaten, expliciete nulwaarden tellen wel mee. Vergelijkingen gebruiken een even lang deel van de vorige periode, zonder de lopende dag; minimaal 3 registraties en minstens 50% dekking per periode zijn vereist. Bij verschillende doelen, eenheden of planningen volgt geen vergelijking. Weekdoelen tonen behaalde dagen of bevestigde weken.
- **Gegevens:** gevalideerde JSON-import met overzicht en expliciete vervangbevestiging, JSON-export, bevestigd wissen. Thema systeem/licht/donker.
- **PWA:** manifest, app-iconen en een offline app-shell. Registratie werkt offline na het eerste volledige bezoek. Updates worden actief wanneer oude tabbladen gesloten zijn en de app opnieuw wordt geopend.

## Historische doelen

Wijzigingen aan doelen en planning gelden vanaf morgen. Zodra de bestaande of nieuwe planning een weekdoel is, gelden wijzigingen vanaf volgende maandag. De eerdere doelversies blijven bewaard en elke dagregistratie bewaart een snapshot van het gebruikte doel. Naam, pictogram en toelichtingen veranderen direct. De meetwijze blijft vast; maak een nieuwe gewoonte voor een andere meetwijze.

Een pauze of archivering sluit de periode uit van nieuwe planning; bestaande registraties blijven zichtbaar. Bij hervatten blijft de pauzehistorie behouden. Een begonnen of gedeeltelijk gepauzeerde week verlaagt het weekdoel niet stilzwijgend; inzicht vermeldt het als er minder beschikbare dagen zijn dan het doel.

## Op je telefoon

De app kan op elke statische HTTPS-host worden gepubliceerd. Standaard bouwt hij voor `/`; voor een submap stel je bij het bouwen `RITME_BASE_PATH` in, bijvoorbeeld `/Ritme/`. Manifest, iconen, navigatie en offline cache gebruiken hetzelfde pad. Daarna kan de browser de app installeren. Op iPhone: Safari → Deel → Zet op beginscherm. De browser bepaalt of en hoe de installatieoptie wordt getoond.

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
- `src/insights.ts`: echte numerieke waarden, historische doelgrenzen en vergelijkbare perioden.
- `src/storage.ts`: gevalideerde IndexedDB-opslag.
- `src/App.tsx`: navigatie en geserialiseerde opslagbewerkingen; Web Locks en BroadcastChannel voorkomen overschrijven tussen tabbladen in ondersteunde browsers.
- `src/components/`: invoer, historie/inzicht, instellingen en dialoogvensters.
- `src/styles.css`: responsieve vormgeving, thema’s en reduced-motion-ondersteuning.
- `docs/BOUWPLAN.md`: het oorspronkelijke bouwplan.
- `HANDOFF.md`: actuele voortgang en vervolgwerk.

## Publiceren op GitHub Pages

```sh
npm run deploy:pages
```

Het commando controleert dat je werk gecommit is, bouwt met het juiste repositorypad en pusht alleen de gebouwde app naar `gh-pages`. Het bouwt geen geschiedenis met persoonlijke gewoontes in. Een bestaande `gh-pages`-branch wordt alleen bijgewerkt als die eerder door dit script is aangemaakt; er wordt nooit geforceerd gepusht.

GitHub Pages moet voor de repository zijn ingeschakeld: Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **gh-pages** → Folder: **/ (root)** → Save. De app staat online op `https://harberspepijn.github.io/Ritme/`. De openbare pagina, productie-assets en het PWA-manifest zijn gecontroleerd. Of Pages beschikbaar is voor een private repository hangt af van het GitHub-abonnement. Het deploycommando verandert de zichtbaarheid van de repository niet.

Toegang tot Git via de platformproxy staat los van GitHub API-toegang. In een cloudomgeving kan voor Pages-beheer en validatie netwerktoegang nodig zijn tot `api.github.com` en `harberspepijn.github.io`. GitHub CLI gebruikt bestaande authenticatie; zet geen tokens in bestanden of commits.

Een uitgepakte publicatiebuild bevat `deployment.json` met de bijbehorende broncommit. De app vraagt geen account: openen kan op verschillende apparaten, maar gegevens synchroniseren niet automatisch. Gebruik export/import om ze over te zetten.
