# Ritme — overdracht

Bijgewerkt: 22 oktober 2026. Doorontwikkeling van de bestaande app; oorspronkelijke opdracht in `docs/BOUWPLAN.md`.

**App: https://harberspepijn.github.io/Ritme/**

## Update 22 oktober: dagelijks gebruik en inzicht

- Vandaag toont bij bestaande gewoontes een compacte datumkop en voortgang. De lijst begint direct onder de verkorte weekstrip. De grote introductie, plant en suggesties blijven alleen bij een lege start. Ook Gewoontes en Inzicht hebben compactere koppen.
- Rijen tonen stand/doel, blijven op dezelfde plaats bij registreren en houden dezelfde snelle knoppen na succes. Minimumdoelen: +5/+15 minuten, anders +1/+5. Klikken op de rij opent het totaal met invoerfocus, correcties en bestaande undo. Een ontbrekend numeriek totaal is `—`, niet nul. Vermijdmomenten blijven ook mobiel zichtbaar.
- De statusfout is in `model.evaluate` opgelost. `statusLabels` staat nu ook in het model. Vandaag zonder registratie = `pending` / Nog open; verstreken lege geplande dag = `unknown` / Onbekend; toekomstige geplande dag = `future`; niet gepland = `off`. Een opgeslagen leeg concept volgt dezelfde regel. Een geregistreerd maximum zonder afronding blijft open, ook na middernacht; maximum/vermijden slagen alleen volgens hun bestaande expliciete bevestiging. Bestaande registraties tijdens een latere pauze blijven zichtbaar.
- `src/insights.ts` levert de gedeelde numerieke reeksen voor gemiddelden en grafieken. Geen nul invullen voor ontbrekende dagen, concepten of toekomst. Expliciete nul en een expliciet gesloten maximum op nul tellen wel. Correcties worden gesommeerd; snapshots bewaren historische eenheid en doelgrens.
- `NumericChart.tsx`: compacte SVG-grafieken, doelgrenzen, alleen verbindingslijnen tussen aangrenzende geregistreerde dagen, afzonderlijke grafieken bij verschillende eenheden, voorlopige markering voor vandaag, toegankelijke uitklapbare waardentabel.
- Periodevergelijkingen zijn beschrijvende gemiddeldeverschillen, geen algemene score of statistische garantie. Alleen verstreken dagen, hetzelfde aantal dagen vanaf het begin van de vorige week/maand; bij ongelijke maandlengten het gezamenlijke aantal dagen. Minimaal 3 registraties en minstens 50% dekking van beschikbare geplande dagen in beide perioden. Doel, eenheid, meetwijze en planning moeten gelijk zijn; anders uitleg. Datumbereiken en aantallen worden vermeld. Vandaag telt nog niet mee in de vergelijking.
- Toevoegen: richting, naam, meetwijze/doel en planning eerst (dagelijks standaard). Pictogram, richttijd en persoonlijke toelichting onder Optionele details. Alle bestaande instellingen blijven beschikbaar. Sticky opslaanknop, grotere mobiele invoertekst; bij lage viewport geen vaststaande grote paneelkop.
- Leesbare toelichtingen, Nederlandse enkelvoud/meervoud en decimale gemiddelden. Korte navigatie- en registratieanimaties, zichtbare focus, reduced motion. Een gewoonte aanpassen behoudt nu ook de bestaande lijstpositie.

## Gegevens en bestaande functies

**Geen opslagmigratie en geen verandering aan schemaVersion 1, database, object store, sleutels of webadres.** Bestaande gewoontes, logs, doelversies/snapshots, pauzehistorie, thema en exports blijven leesbaar. Geen backend, account, synchronisatie of upload van gebruikersgegevens.

Behouden: vier meetwijzen, dagelijks/vaste weekdagen/weekdoelen, lokale kalender/DST, wijzigingen vanaf morgen of volgende maandag, pauzeren/hervatten/archiveren/verwijderen, gevalideerde import met bevestiging, export, bevestigd wissen, Web Locks en BroadcastChannel, offline app-shell en registratie. Weekdoelen worden niet als dagelijkse verplichtingen behandeld. Een richttijd beoordeelt niet automatisch het resultaat.

PWA-updates wachten tot oude tabbladen gesloten zijn; geen gedwongen herladen tijdens invoer. Persoonlijke opslag hoort bij apparaat/browser/profiel/origin. Export/import is de handmatige overdracht. Geen PIN of versleutelde kluis.

## Starten en controleren

Werk in de bestaande checkout `/workspace/Ritme`. Geen extra worktree tenzij de gebruiker dat vraagt. Er zijn geen aanvullende AGENTS.md-instructies gevonden.

Node 22.12+, getest met Node 24.19.0 en npm 11.9.0; `.nvmrc` bevat de versie.

```sh
npm ci --cache /workspace/.npm-cache --no-fund --no-audit
npm run dev -- --port 5173 --strictPort
npm run build
npm run preview -- --port 4173 --strictPort
npm test
RITME_BASE_PATH=/Ritme/ npm run test:e2e
npm run format:check
git diff --check
```

Playwright start zelf een productiepreview op 4175, Chromium via `/usr/bin/chromium` (elders `CHROMIUM_PATH` of Playwright-installatie). Geïsoleerde profielen; tests raken geen persoonlijke browseropslag. Voor de visuele ronde is een aparte preview op 4176 gebruikt met `/Ritme/`; servers moeten in een nieuwe sessie opnieuw gestart worden. Stop geen onbekende bestaande processen.

## Controles in deze ronde

- Formatting en `git diff --check`: geslaagd.
- TypeScript en productiebuild voor `/Ritme/`: geslaagd. Alleen bestaande onschuldige Zod-annotatiewaarschuwingen.
- **39 unit-/opslagtests geslaagd** (29 model, 8 nieuwe inzicht/status, 2 IndexedDB). Onder meer vier meetwijzen, vandaag/verleden/toekomst, datumgrenzen/DST, expliciete bevestiging, nul versus ontbrekend, snapshots/correcties/eenheden, gelijke periodelengten, te weinig gegevens en veranderde doelen.
- **30 Playwright-tests geslaagd** (15 scenario’s × desktop/mobiele Chromium-emulatie). Na de laatste tekstcorrecties en zichtbare vermijdtelling zijn de 8 betrokken tests gericht herhaald: alle 8 geslaagd.
- Toevoegen, +5/+15 ook na succes, stabiele rijpositie, invoerfocus, ongedaan maken, corrigeren, herladen, alle meetwijzen, planning, oude doelen, archief/pauze/hervatten/verwijderen, import/export en oude schema-1-export, offline bewaren/herladen, meerdere tabbladen, bevestigd wissen.
- Nieuwe browsercontroles: dezelfde dagstatus op Vandaag/Inzicht vóór en na lokale middernacht, onbekend/vrij/toekomst onderscheiden, ontbrekende grafiekdag krijgt geen punt of verbindingslijn, echte nul, juiste vergelijking zonder vandaag, toetsenbordbediening van optionele details en behoud van ingevulde details.
- Axe-controles hoofdschermen en panelen in licht/donker: geen overtredingen binnen geteste WCAG-regels. Geen volledige screenreader-audit.
- Visueel bekeken: desktop 1440 px, telefoon 390 px, smal 320 px; Vandaag, week-/maandinzicht met meerdere meetwijzen, grafieken en toevoegpaneel. Geen horizontale overflow in de controles. Screenshot-animaties uitgeschakeld om de voltooide toestand te beoordelen.
- Opslaan bereikbaar bij viewport 320×330; reduced motion en toetsenbordfocus getest. Fysieke iOS/Android-installatie en echte mobiele toetsenborden niet getest.
- Een nieuwe test herlaadde vóór de asynchrone opslagbevestiging; de test wacht nu op het sluiten van het paneel, zoals de bestaande helpers. Daarna geslaagd.

## Publicatie

Repository `harberspepijn/Ritme` is door de gebruiker openbaar gemaakt. Bron staat op `main`, GitHub Pages publiceert `gh-pages` met `/ (root)` en HTTPS. Bestaande publicatieprocedure:

```sh
git add <gewijzigde bestanden>
git commit -m "..."
git push origin HEAD:main
npm run deploy:pages
```

Het script vereist een schoon gecommit werkgebied, bouwt voor `/Ritme/`, controleert de beheermarkering en gebruikt normale pushes, nooit force. `deployment.json` bevat de broncommit. Verander zichtbaarheid of Pages-instellingen niet.

**Update gepubliceerd en openbaar gecontroleerd.** Appbron: `4f4c803737d93932411ea5b49ecb4540882f0a01`; publicatiebranch: `1f59adf`. De bron is normaal naar `main` gepusht en `npm run deploy:pages` heeft `gh-pages` bijgewerkt. De tien opnieuw gebouwde bestanden zijn identiek aan de vooraf gehashte, lokaal geteste productiebuild. Alle tien openbare bestanden zijn daarna via geverifieerde HTTPS opgehaald en op SHA-256 vergeleken: identiek. De canonieke URL geeft HTTP 200 en exact de nieuwe HTML; `deployment.json` bevestigt de broncommit.

Pages-run: https://github.com/harberspepijn/Ritme/actions/runs/39785243142. Workflow succesvol afgerond.

Sluit na het ophalen van de update alle oude Ritme-tabbladen/vensters en open de app opnieuw om een wachtende serviceworker te activeren. Browsergegevens niet wissen. Documentatiecommits na de appbron veranderen de gepubliceerde app niet.

De bestaande GitHub-authenticatie werkt via de beheerde proxy. Git/HTTPS normaal gebruiken, geen tokens uitlezen. Voor GitHub-API-verificatie werkte Python urllib met bestaande proxy en CA-verificatie; de CLI gaf eerder Forbidden. Eerste publicatie was bron `8fc717d`, Pages-run `39654000410`; alle 10 publieke buildbestanden waren destijds identiek aan de geteste build.

Rechtstreekse openbare Chromium-controle mislukte eerder op de cloudproxy-CA (`ERR_CERT_AUTHORITY_INVALID`). Een permanente truststore-wijziging is eerder door automatische goedkeuringscontrole afgewezen; die is niet uitgevoerd en mag niet via een omweg worden herhaald. TLS-verificatie blijft aan. Veilige publicatiecontrole: publieke HTTPS-bestanden met de bestaande Python-trust ophalen en hashen tegen de lokaal in Chromium geteste productiebuild. Dit is geen probleem met het publieke Pages-certificaat.

## Cloudconfiguratie en vervolg

Installatie- en startinstructies zijn eerder als cloudconcept opgeslagen, los van websitehosting. Bestaande instructies moeten worden behouden: npm ci/build/test, bestaande checkout, geen gebruikersgegevens/tokens toevoegen. Het opslaan/publiceren van een cloudconfiguratie is niet nodig om de online app te openen.

Eerstvolgend: gebruikservaring op een fysieke telefoon toetsen, inclusief echt toetsenbord en installatie. Eventuele meldingen, synchronisatie, PIN of native functies blijven aparte uitbreidingen. Bouw verder op deze code en bescherm bestaande opslag.
