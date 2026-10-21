# Ritme — overdracht

Bijgewerkt: 21 oktober 2026. Eerste bouwronde uitgevoerd vanuit `docs/BOUWPLAN.md`.

## Wat af is

- Werkende Nederlandstalige React/TypeScript/Vite-app met rustige groene vormgeving, mobiele ondernavigatie, desktopnavigatie, panelen, animaties en reduced motion.
- Vandaag, Gewoontes en Inzicht; lege eerste start met optionele voorbeelden. Geen ingevulde demo-historie.
- Vier meetwijzen, snelle invoer, dagcorrecties, ongedaan maken, optioneel werkelijk tijdstip voor ja/nee.
- Dagelijkse planning, vaste weekdagen en echte weekdoelen. Lokale kalenderdagen, maandag-zondag, onbekende en niet-geplande dagen onderscheiden.
- Gewoontes aanpassen, pauzeren, hervatten, archiveren en bevestigd verwijderen; optionele reden en eigen reactie op een verleiding.
- Historische doelversies en snapshots. Gewijzigde doelen/planning vanaf morgen, bij weekplanning vanaf volgende maandag. Naam en toelichtingen veranderen direct. Meetwijze blijft vast.
- Week-/maandkalenders, passende cijfers per gewoonte, onbekende dagen, gemiddelden van geregistreerde dagen. Geen samengestelde score.
- IndexedDB, geserialiseerde updates, Web Locks en synchronisatie tussen tabbladen via BroadcastChannel. Bewaarfouten overschrijven de vorige gegevens niet.
- JSON-export, schemavalidatie en vervangoverzicht vóór import, expliciete bevestiging vóór verwijderen/wissen. Systeem-, licht- en donkerthema.
- PWA-manifest, PNG-iconen en offline app-shell. Offline lezen, registreren en herladen getest.

## Starten

Werk in de bestaande checkout `/workspace/Ritme`. Cloudtaken zijn al geïsoleerd; maak alleen een extra Git-worktree als de gebruiker daarom vraagt.

- Node 22.12+; getest met Node 24.19.0 en npm 11.9.0. Pin in `.nvmrc`.
- Dependencies: `npm ci --cache /workspace/.npm-cache --no-fund --no-audit`.
- Ontwikkelen: `npm run dev -- --port 5173 --strictPort`.
- Productie/offline controleren: `npm run build`, dan `npm run preview -- --port 4173 --strictPort`.
- Browsercontroles: `npm run test:e2e` start zelf een aparte productiepreview op poort 4175.
- Chromium: `/usr/bin/chromium` in deze cloudomgeving. Elders `CHROMIUM_PATH` instellen of `npx playwright install chromium` gebruiken.
- Servers zijn processen en moeten in een nieuwe sessie opnieuw worden gestart. Een gepubliceerde cloudomgeving is niet hetzelfde als publieke app-hosting.

## Omgevingsconfiguratie

`install_script` en `start_skill` zijn als concept opgeslagen in de cloudomgeving. Installatie via het lockfile, productiebuild, tests en beide startcommando’s zijn uitgevoerd. Het concept is nog niet gepubliceerd; de gebruiker kan de instellingen controleren, opslaan en de omgeving publiceren. Dit publiceert geen publieke website.

## Gecontroleerd

- Schone installatie met `npm ci`, productiebuild en TypeScript: geslaagd.
- Ontwikkelserver: toevoegen en persistentie na herladen in de browser gecontroleerd. Productiepreview: HTML, manifest en serviceworker gecontroleerd.
- Formatting en `git diff --check`: geslaagd.
- Vitest: **31 tests geslaagd**. Vier meetwijzen, lokale kalender/DST, pauzes, archiveren/hervatten, weekdoelen, doelversies, importvalidatie en IndexedDB.
- Playwright: **22 tests geslaagd** (11 scenario’s op desktop Chromium en mobiele Chromium-emulatie). Volledige invoer/persistentie, correcties, archiveren, export/import, offline herladen en offline bewaren, meerdere tabbladen, bevestigde verwijdering/wissen, datumwisselingen en historische doelen.
- Axe: geen overtredingen bij de geteste hoofdschermen en panelen, licht/donker, tegen WCAG 2 A/AA, 2.1 AA en 2.2 AA-regels. Dit is geen volledige handmatige toegankelijkheidsaudit.
- Screenshots visueel bekeken op desktop en mobiel. Geen horizontale overflow op 320/390 px. Opslaan blijft bereikbaar bij een verkleinde viewport; invoerfocus en reduced motion getest.
- Productieafhankelijkheden: `npm audit --omit=dev --audit-level=high` meldde 0 kwetsbaarheden.
- Problemen gevonden tijdens testen (serviceworker nam eerste pagina niet over, focus in toevoegpaneel, tekstcontrast) zijn hersteld en opnieuw gecontroleerd.

## Beperkingen en bewuste keuzes

- Publicatiebestanden staan op GitHub in `gh-pages`, de broncode staat op `main`. GitHub Pages is nog niet ingeschakeld: de gekoppelde integratie krijgt HTTP 403 bij Pages-beheer. De website zelf geeft nog HTTP 404. Zie de actuele publicatiestatus onderaan.
- Installatie op fysieke iOS-/Android-apparaten en hun echte toetsenborden is niet getest. Browseremulatie en verkleinde viewport zijn wel getest.
- Gegevens horen bij browser/profiel/origin. Export is de handmatige back-up en overdracht; geen account of automatische synchronisatie.
- Geen meldingen, automatische schermtijdmeting, websiteblokkade of AI. Een bedtijd is een richttijd: een handmatige ja/nee-keuze bepaalt succes, ook bij 00:30.
- Een gedeeltelijke week verlaagt het weekdoel niet automatisch; de app legt beperkte beschikbare dagen uit. Maandinzicht voor weekdoelen telt weken die de maand raken.
- PWA-updates wachten totdat oude tabbladen gesloten zijn. Geen automatische herlaadactie tijdens invoer.
- Rollup meldt onschuldige opmerkingen over annotaties in Zod; de productiebuild slaagt.

## Eerstvolgende concrete stap

Laat Pepijn de app via een gekozen HTTPS-host op zijn telefoon openen, installeren en enkele echte gewoontes invoeren. Verwerk vervolgens feedback over invoer, volgorde en beweging. Test daarbij iOS/Android-installatie en het echte mobiele toetsenbord. Bouw door op deze code; begin niet opnieuw. Onderzoek meldingen, synchronisatie of native functies pas als aparte uitbreiding.

## Publicatie naar GitHub Pages — actuele status

Op verzoek van de gebruiker is een openbare, op verschillende apparaten te openen versie voorbereid. `RITME_BASE_PATH` ondersteunt `/Ritme/`, ook voor manifest, iconen, serviceworker en offline navigatie. De browsersuite is aangepast zodat dezelfde controles op een submap kunnen draaien. `npm run deploy:pages` bouwt en publiceert statische bestanden naar een eigen `gh-pages`-branch, zonder een worktree te maken of repository-zichtbaarheid te wijzigen.

De broncode is gepusht naar `main` en de volledige productiebuild naar `gh-pages`. De build is voor `/Ritme/`, bevat `.nojekyll` en `deployment.json` met de broncommit. De gebouwde branch is met de GitHub API teruggelezen en gecontroleerd. Alle **22 browsertests** slagen ook onder dit subpad, inclusief manifest/serviceworker en offline herladen.

De gewone GitHub-CLI gaf aanvankelijk een verbindingsfout (`Forbidden`). Een vervolgaanroep via Python urllib en de bestaande HTTPS-proxy werkte: dezelfde geïnjecteerde authenticatie geeft repositorybeheer en laat Git-push, contents-API en accountinformatie toe. Dit was dus geen bewezen netwerkblokkade. Alleen de specifieke Pages-API weigert de integratie: **HTTP 403, Resource not accessible by integration** bij zowel aanmaken als uitlezen. Verzoek geen dubbele GitHub-login of token zonder deze scopebeperking te onderbouwen. Repository `Ritme` is privé; de zichtbaarheid is niet gewijzigd.

De omgevingsconfiguratie bevat als concept de specifieke domeinen `api.github.com` en `harberspepijn.github.io`, met behoud van presets. Dit is nog niet gepubliceerd. De daadwerkelijke huidige HTTPS-route kan beide domeinen al bereiken; een netwerkwijziging is nu geen bewezen prerequisite.

### Wat de gebruiker nog moet doen

Open `https://github.com/harberspepijn/Ritme/settings/pages` en kies:

- Source: **Deploy from a branch**
- Branch: **gh-pages**
- Folder: **/ (root)**
- **Save**

Als GitHub Pages wegens het abonnement niet beschikbaar is voor deze privé-repository: wijzig niet zomaar de bronrepository naar publiek. Bespreek een publieke repository met alleen de gebouwde app, of gebruik externe statische hosting met de daarvoor benodigde toegang.

Na de instelling: controleer `https://harberspepijn.github.io/Ritme/` tot die de app serveert; test de juiste broncommit in `deployment.json`, het manifest, de iconen en offline gedrag in een browser op desktop/mobiel. Het adres gaf bij de laatste controle **HTTP 404**, dus er is nog geen online-succes gemeld. Openen op verschillende apparaten synchroniseert gegevens niet; export/import is de beschikbare overdracht.

Voor nieuwe versies: commit de broncode, push naar `main` en voer `npm run deploy:pages` uit. De deployhelper update alleen een eerder door zichzelf beheerde branch en pusht nooit geforceerd.
