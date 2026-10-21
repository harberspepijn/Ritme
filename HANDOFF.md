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

- Geen publieke HTTPS-hosting ingericht. `dist/` kan op een statische host onder `/` worden geplaatst. Publicatie vereist een gekozen bestemming; niets is gepusht of gedeployd.
- Installatie op fysieke iOS-/Android-apparaten en hun echte toetsenborden is niet getest. Browseremulatie en verkleinde viewport zijn wel getest.
- Gegevens horen bij browser/profiel/origin. Export is de handmatige back-up en overdracht; geen account of automatische synchronisatie.
- Geen meldingen, automatische schermtijdmeting, websiteblokkade of AI. Een bedtijd is een richttijd: een handmatige ja/nee-keuze bepaalt succes, ook bij 00:30.
- Een gedeeltelijke week verlaagt het weekdoel niet automatisch; de app legt beperkte beschikbare dagen uit. Maandinzicht voor weekdoelen telt weken die de maand raken.
- PWA-updates wachten totdat oude tabbladen gesloten zijn. Geen automatische herlaadactie tijdens invoer.
- Rollup meldt onschuldige opmerkingen over annotaties in Zod; de productiebuild slaagt.

## Eerstvolgende concrete stap

Laat Pepijn de app via een gekozen HTTPS-host op zijn telefoon openen, installeren en enkele echte gewoontes invoeren. Verwerk vervolgens feedback over invoer, volgorde en beweging. Test daarbij iOS/Android-installatie en het echte mobiele toetsenbord. Bouw door op deze code; begin niet opnieuw. Onderzoek meldingen, synchronisatie of native functies pas als aparte uitbreiding.

## Publicatie naar GitHub Pages in voorbereiding

Op verzoek van de gebruiker is een openbare, op verschillende apparaten te openen versie voorbereid. `RITME_BASE_PATH` ondersteunt `/Ritme/`, ook voor manifest, iconen, serviceworker en offline navigatie. De browsersuite is aangepast zodat dezelfde controles op een submap kunnen draaien. `npm run deploy:pages` bouwt en publiceert statische bestanden naar een eigen `gh-pages`-branch, zonder een worktree te maken of repository-zichtbaarheid te wijzigen.

Huidige toegang: Git read en push-dry-run via de bestaande platformauthenticatie werken. GitHub CLI is aanwezig en GH_TOKEN is gezet, maar de daadwerkelijke API-aanroep naar `api.github.com` werd door het netwerkbeleid geweigerd (Forbidden). De omgevingsconfiguratie bevat nu als concept de domeinen `api.github.com` en `harberspepijn.github.io`, met behoud van de bestaande presets. Dit concept is nog geen runtimewijziging. Herhaal de API-aanroep pas na toepassing van de netwerkinstellingen.

Nog te doen: broncode pushen, de gebouwde branch publiceren, GitHub Pages activeren en het daadwerkelijke openbare adres testen. Een URL in de documentatie is tot die controle alleen de verwachte bestemming.
