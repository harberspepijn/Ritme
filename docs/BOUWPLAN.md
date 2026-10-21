# Habit-app — bouwplan en startprompt
Datum: 21 oktober 2026
Werknaam: Ritme
Doel: een persoonlijke app om goede gewoontes op te bouwen en ongewenste gewoontes te verminderen. Nederlands, mobiel als uitgangspunt, rustig en verfijnd.

## Keuze voor de eerste versie
Bouw eerst een installeerbare webapp (PWA) voor persoonlijk gebruik. Begin met lokale opslag, zonder account of betaalde dienst. Behandel meldingen, synchronisatie en automatisch schermtijd meten als latere uitbreidingen die apart onderzocht en getest moeten worden. Het eerste product moet een werkende app zijn, geen dashboard met fictieve gegevens.

Dit plan beschrijft de te bouwen app; er is met dit document nog geen app geïmplementeerd.

## Productprincipes
- Dagelijks registreren kost weinig handelingen.
- Opbouwen en verminderen krijgen passende invoer, binnen één samenhangend ontwerp.
- Een leeg vakje betekent onbekend; geen automatische mislukking of succes.
- Vooruitgang telt ook als een dag minder goed gaat. Geen schuldgevoelteksten of verlies van alle historische vooruitgang.
- Alle ingevoerde gewoontes en gegevens zijn persoonlijk. Standaard geen analytics, externe AI of externe gegevensverwerking.
- Ontwerp en beweging zijn onderdeel van de kwaliteit: subtiele animaties bij interacties, samenhangende overgangen en directe feedback.
- Maak geen sociaal platform, leaderboard, punteneconomie of AI-coach in de eerste versie.

## Vier soorten gewoontes
| Soort | Voorbeeld | Dagelijkse invoer | Beoordeling |
| --- | --- | --- | --- |
| Ja/nee | Voor 21:15 in bed | Gelukt / niet gelukt, optioneel tijdstip | Volgens expliciete invoer |
| Minimum | 20 minuten lezen | Minuten of teller, met snelle plusknop | Geregistreerd totaal minstens doel |
| Maximum | Maximaal 30 minuten sociale media | Geregistreerde minuten | Binnen doel na expliciet afronden van de dag |
| Vermijden | Een ongewenste website niet bezoeken | Dag bevestigen of een moment registreren | Alleen bevestigd vermeden wanneer de gebruiker dat aangeeft |

Voorwaarden:
- Een maximumdoel is niet al succesvol omdat er nog niets is ingevuld. Tijdens de dag mag de app 'voorlopig binnen doel' tonen.
- Bij vermijden is 'geen incident geregistreerd' niet hetzelfde als 'dag bevestigd vermeden'.
- Ja/nee ondersteunt een gewenst tijdstip. De app weet zonder registratie niet wanneer iemand echt in bed lag.
- Voor tijdstipdoelen is een expliciete avond/nacht-koppeling nodig, zodat 00:30 niet per ongeluk 'vroeger dan 21:15' is. Voor versie 1 volstaat handmatig gelukt/niet gelukt; alleen een tijd berekenen als de logica correct is uitgewerkt.
- Een teller kan per dag meerdere momenten opslaan. Correctie en ongedaan maken zijn beschikbaar.
- Minimum en maximum ondersteunen een eenheid zoals minuten, keren of glazen. Gebruik geen voeding/calorie-indeling als standaard.

## Navigatie: drie hoofdschermen
### Vandaag
- Datum met compacte weekstrip; andere dagen openen is mogelijk.
- Compacte samenvatting, bijvoorbeeld '3 van 5 afgerond'; vermijd een grote decoratieve score.
- Geplande gewoontes in een rustige lijst met compacte rijen.
- Elke rij: pictogram, naam, klein doel, huidige stand en primaire handeling.
- Ja/nee krijgt een duidelijke voltooiingsknop en een optie voor niet gelukt.
- Aantallen krijgen snelle invoer en plus/min. Minuten zijn ook direct te typen.
- Vermijden toont een actie om een moment te registreren en om de dag te bevestigen.
- Openstaande en afgeronde gewoontes blijven voorspelbaar vindbaar.
- Na afvinken een subtiele checkanimatie en korte feedback; geen confetti per tik.
- Snelle terugblik op gisteren zodat avondgewoontes de volgende ochtend zijn bij te werken.
- Een afgeronde dag of gewoonte kan later gecorrigeerd worden.

### Gewoontes
- Lijst met actieve en gearchiveerde gewoontes.
- Toevoegen, wijzigen, pauzeren, archiveren en verwijderen.
- Toevoegen via een compact paneel met eerst 'Opbouwen' of 'Verminderen'.
- Daarna naam, meetwijze, doel, eenheid, planning, optioneel tijdstip en pictogram.
- Planning: dagelijks, gekozen weekdagen of een aantal keer per week.
- Een wekelijkse frequentie is een echt weekdoel: bijvoorbeeld drie leesdagen per kalenderweek; niet zeven dagelijkse verplichtingen.
- Optioneel één korte reden: 'Waarom wil ik dit?'
- Optionele reactie op een verleiding: 'Als ik wil scrollen, leg ik mijn telefoon weg en lees ik vijf minuten.' Gewoon tekst, geen AI nodig.
- Detailpagina met recente registraties en eigen voortgang.

### Inzicht
- Week- en maandoverzicht.
- Per gewoonte: passende maatstaf, zoals behaalde geplande dagen, gemiddelde geregistreerde minuten of geregistreerde momenten.
- Toon hoeveel dagen onbekend zijn. Bereken gemiddelden niet alsof ontbrekende registraties nul zijn.
- Een kleine kalender maakt gelukt, niet gelukt, onbekend en niet gepland onderscheidbaar.
- Reeksen zijn optioneel secundair; bij weekdoelen liever behaalde weken.
- Geen verzonnen historische data en geen onvergelijkbare totaalscore voor alle gewoontes samen.

Instellingen zijn bereikbaar via een klein icoon: thema, export/import, gegevens wissen en uitleg over lokale opslag.

## Planning en historische juistheid
- Sla records op per lokale kalenderdatum; gebruik geen UTC-datumafsnede voor een lokale dag.
- Een week loopt maandag t/m zondag.
- Meerdere registraties op één dag tellen op.
- Een gewoonte telt niet mee op dagen vóór de aanmaak of tijdens een pauze.
- Wijzigingen van doelen/planning overschrijven oude beoordelingen niet. Bewaar doelversies met ingangsdatum, of een doel/planning-snapshot bij historische records.
- Onbekende dagen blijven onbekend. Terugwerkende registratie is herkenbaar te wijzigen.
- Archiveren bewaart historie; definitief verwijderen vraagt om bevestiging.
- Een maximumdoel dat wordt overschreden, is niet alsnog geslaagd door op 'dag afgerond' te tikken.
- Een vermijddag met een geregistreerd moment kan niet tegelijk als volledig vermeden gelden.

## Visuele richting
Een rustig persoonlijk hulpmiddel met de afwerking van een zorgvuldig ontworpen mobiele app.

- Warme gebroken witte achtergrond, bijna zwarte tekst en één gedempte groene accentkleur.
- Beperkte functionele statuskleuren, altijd ondersteund door tekst of vorm.
- Verzorgde typografie, duidelijke hiërarchie, fijne lijnen en veel rustige ruimte.
- Compacte rijen; geen pagina vol grote afgeronde kaarten.
- Onderste navigatie met drie heldere bestemmingen.
- Geen paarse/blauwe verlopen, glazen panelen, emoji als hoofddesign, overmatige schaduwen of generieke dashboardtegels.
- Consequente lijniconen; vorm en beweging geven de app een eigen karakter.
- Beweging: vinkje tekent in, teller verandert vloeiend, toevoegenpaneel schuift natuurlijk omhoog, actieve navigatie beweegt subtiel mee.
- Gewone feedback ongeveer 150–250 ms; paneelovergangen ongeveer 250–350 ms. Geen merkbare wachttijd voor invoer.
- Respecteer reduced motion. Zorg voor voldoende contrast, zichtbare focus, labels en ruime tikvlakken.
- Controleer echte interacties op mobiel én desktop. Beweging moet ook bij snel herhaald tikken goed blijven werken.

Eerder vastgelegde ontwerpvoorkeuren van Pepijn: clean, professioneel, levendig; samenhangende overgangen; passende knopfeedback; geen beweging zonder doel; browsercontrole is nodig naast screenshots.

## Technische richting
Voorstel voor een nieuw zelfstandig Codex-project:
- React, TypeScript en Vite.
- Een lichte animatiebibliotheek alleen wanneer nodig voor de gewenste interacties.
- IndexedDB voor gewoontes en registraties; gescheiden opslag-, berekenings- en presentatielogica.
- PWA-manifest en offline app-shell. Test of de gebouwde app daadwerkelijk offline opent.
- Lokale opslag is browser/profielgebonden en geen beveiligde kluis of automatische back-up.
- JSON-export en gevalideerde import voor overdraagbaarheid. Controleer bestandsschema vóór import en toon een overzicht vóór overschrijven.
- Geen account, backend, AI-API, betaalde afhankelijkheden of automatisch verzonden privégegevens in versie 1.
- Geen gevoelige gewoonten standaard in de startdata. Eerste gebruik begint leeg met optionele algemene voorbeelden.
- Houd persoonsgegevens en registraties uit consolelogs.

Geen automatische schermtijdmeting of websiteblokkade beloven in deze webversie. Handmatige registratie werkt als basis. Onderzoek later of een native Android-uitbreiding de gewenste systeemfuncties kan bieden. Meldingen alleen als aparte, aantoonbaar werkende uitbreiding; een tijdstip bij een gewoonte is op zichzelf geen melding.

## Werkverdeling over twee bouwrondes
### Vandaag: complete eerste versie
1. Zet project en ontwerpregels neer.
2. Bouw één complete route: gewoonte toevoegen → vandaag registreren → herladen → dezelfde data terugzien.
3. Breid uit naar vier meetwijzen en planning.
4. Voeg detail/historie en eenvoudig inzicht toe.
5. Voeg export/import en PWA-basis toe.
6. Controleer kernlogica, mobiele bediening, persistente opslag en animaties.
7. Bewaar voortgang in HANDOFF.md en commit wanneer er een git-repository is.

Doel: een eerste versie die Pepijn dezelfde avond kan gebruiken. Hoeveel binnen het huidige gebruiksbudget past, is vooraf onbekend. Werk in afgeronde stappen zodat de app bruikbaar blijft bij onderbreking.

### Morgen of de volgende sessie
- Laat Pepijn eerst een paar echte gewoontes invoeren.
- Verbeter ongemakkelijke invoer, volgorde en ontbrekende feedback.
- Werk animaties en het inzichtscherm verder af waar dat helpt.
- Onderzoek daarna pas meldingen, apparaatvergrendeling, synchronisatie of native functies.
- Ga verder met bestaande code en HANDOFF.md; begin niet opnieuw.

## Betekenisvolle controles
- Toevoegen, afvinken, aanpassen en archiveren blijven bewaard na herladen.
- Dagelijks minimum werkt met meerdere registraties en met correcties.
- Maximum met lege dag blijft onbekend; expliciet afgerond binnen grens is gelukt; boven grens blijft niet gelukt.
- Vermijden zonder invoer blijft onbekend; een incident en een geslaagde vermijddag kunnen niet tegelijk bestaan.
- Drie keer per week wordt op weekniveau beoordeeld.
- Niet-geplande en gepauzeerde dagen verstoren inzicht niet.
- Historische doelen blijven juist na een wijziging.
- Lokale datumwisseling en een nachttijd bij bedtijd leiden niet tot verkeerde resultaten.
- Export/import doorstaat een rondgang en weigert ongeldige invoer zonder bestaande gegevens te verliezen.
- Mobiele breedte heeft geen horizontale overflow; panelen en toetsenbord blokkeren de opslaanactie niet.

## Startprompt voor Codex
Plak deze sectie in Codex en voeg dit hele bestand toe:

Bouw de persoonlijke habit-app uit het bijgevoegde plan. Werknaam Ritme. Bouw een echte, verzorgde, mobiele app met werkende lokale opslag, geen statische demo. De interface is Nederlands.

Voer vandaag de eerste bouwronde uit. Start met een korte implementatievolgorde en ga direct aan het werk. Volg de vier meetwijzen, dag-/weeklogica, onbekende statussen, historische juistheid en visuele richting uit het plan. Geef prioriteit aan een volledige werkende route en breid daarna uit. Maak zelfstandig redelijke keuzes. Alleen bij een echte blokkade om ontbrekende informatie vragen.

De afwerking moet clean, minimalistisch en eigen voelen. Ontwerp ook de overgang tussen toestanden. Geen generiek AI-dashboard. Controleer de app in de browser op mobiele afmetingen en test de kritieke berekeningen en opslag. Gebruik geen betaalde diensten en voeg geen AI-functionaliteit of accountvereiste toe.

Bewaar tijdens het werk een beknopt HANDOFF.md met: wat af is, hoe het project start, wat getest is, bekende problemen en de eerstvolgende concrete stap. Als er een git-repository is, commit afgeronde stappen. Als de sessie onderbroken wordt, moet de volgende sessie zonder herbouw kunnen doorgaan.

Lever aan het einde een draaiende eerste versie met startinstructie en een eerlijke samenvatting van wat al werkt en wat nog niet.

## Vervolgprompt voor de volgende sessie
Lees HANDOFF.md en het bouwplan. Inspecteer de bestaande app en ga verder met dezelfde code. Herhaal geen afgerond werk. Los eerst de vastgelegde problemen op en verwerk daarna mijn gebruikservaringen. Controleer de kernfunctionaliteit opnieuw alleen waar wijzigingen dat nodig maken. Werk HANDOFF.md bij.

