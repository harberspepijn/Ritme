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

- De app staat live op https://harberspepijn.github.io/Ritme/. GitHub Pages gebruikt `gh-pages` en `/ (root)`, met HTTPS. De gebruiker heeft de repository openbaar gemaakt en Pages ingeschakeld. Zie de gecontroleerde publicatiestatus onderaan.
- Installatie op fysieke iOS-/Android-apparaten en hun echte toetsenborden is niet getest. Browseremulatie en verkleinde viewport zijn wel getest.
- Gegevens horen bij browser/profiel/origin. Export is de handmatige back-up en overdracht; geen account of automatische synchronisatie.
- Geen meldingen, automatische schermtijdmeting, websiteblokkade of AI. Een bedtijd is een richttijd: een handmatige ja/nee-keuze bepaalt succes, ook bij 00:30.
- Een gedeeltelijke week verlaagt het weekdoel niet automatisch; de app legt beperkte beschikbare dagen uit. Maandinzicht voor weekdoelen telt weken die de maand raken.
- PWA-updates wachten totdat oude tabbladen gesloten zijn. Geen automatische herlaadactie tijdens invoer.
- Rollup meldt onschuldige opmerkingen over annotaties in Zod; de productiebuild slaagt.

## Eerstvolgende concrete stap

Laat Pepijn de app via een gekozen HTTPS-host op zijn telefoon openen, installeren en enkele echte gewoontes invoeren. Verwerk vervolgens feedback over invoer, volgorde en beweging. Test daarbij iOS/Android-installatie en het echte mobiele toetsenbord. Bouw door op deze code; begin niet opnieuw. Onderzoek meldingen, synchronisatie of native functies pas als aparte uitbreiding.

## Publicatie naar GitHub Pages — online

**Open de app: https://harberspepijn.github.io/Ritme/**

De gebruiker heeft de repository openbaar gemaakt en GitHub Pages ingeschakeld. API-controle bevestigt: repository publiek, Pages publiek, HTTPS afgedwongen, bron `gh-pages` met `/ (root)`, status `built`. De Pages-workflow is succesvol afgerond: https://github.com/harberspepijn/Ritme/actions/runs/39654000410.

De gewone openbare URL geeft **HTTP 200** en de Ritme-pagina. De eerste HTTP 404 was een negatieve cache; aanvragen met een verse query toonden direct de gepubliceerde app. De canonieke URL is daarna ook met HTTP 200 gecontroleerd.

Alle **10 bestanden** van de productiebuild zijn via HTTPS opgehaald en met SHA-256 vergeleken met de lokaal geteste build: HTML, JS, CSS, SVG/PNG-iconen, manifest, registratiescript, serviceworker en Workbox. Alles is identiek. `deployment.json` bevestigt broncommit `8fc717d0db48286b6a0ab201fd0322651dbf8024` en basispad `/Ritme/`. Manifest start_url en scope zijn correct. Alle **22 browsertests** zijn eerder op precies deze appbuild onder `/Ritme/` geslaagd, inclusief offline gebruik, mobiele/desktopinteracties en toegankelijkheid.

De extra browsertest rechtstreeks tegen de openbare URL kon in deze cloud niet draaien: Chromium vertrouwt de CA van de cloudproxy niet (`ERR_CERT_AUTHORITY_INVALID`). Automatische goedkeuringscontrole wees het toevoegen van die CA aan de blijvende Chromium-truststore af vanwege de bredere impact op toekomstig browserverkeer. Er is geen truststore gewijzigd en TLS-verificatie is nergens uitgezet. De veiligere controle gebruikte de bestaande, correct geconfigureerde HTTPS-verificatie in Python en vergeleek de publieke bestanden met de al in de browser geteste build. Dit is geen fout in het publieke GitHub Pages-certificaat.

`npm run deploy:pages` is tweemaal uitgevoerd: eerste branchpublicatie en een normale vervolgupdate zonder force-push. De broncode staat op `main`. Toekomstige updates: commit bronwijzigingen, push `main`, voer `npm run deploy:pages` uit en controleer de openbare build. Documentatiewijzigingen na de publicatie vereisen geen app-rebuild.

De GitHub-API is via de bestaande HTTPS-proxy bruikbaar; de CLI gaf eerder Forbidden en de private Pages-API weigerde de integratie. Na het openbaar maken kan de Pages-status worden gelezen. Geen extra tokens of accounts zijn toegevoegd. De opgeslagen cloudstartinstructies zijn als concept bijgewerkt; websitehosting staat los van het publiceren van een cloudomgeving.

### Gebruik op apparaten

- Android: open de link in Chrome, menu ⋮ → App installeren of Toevoegen aan startscherm.
- iPhone/iPad: open in Safari, Deel → Zet op beginscherm.
- Desktop: open de link in een moderne browser; installatie is afhankelijk van de browser.
- Gegevens blijven per apparaat/browser lokaal. Export/import is beschikbaar; geen automatische synchronisatie.

Eerstvolgende stap: Pepijn laat de live app op zijn eigen telefoon installeren en voert echte gewoontes in. Verwerk daarna gebruikservaringen. Controleer installatie en het echte mobiele toetsenbord op fysieke iOS-/Android-apparaten.
