# Design-preview (spoor A)

Klikbare preview van de app, gebouwd vanuit het Figma-designdagbestand.
Eén los HTML-bestand, geen build-stap, geen externe requests: dubbelklik `index.html` of open de Pages-URL.

**Waarvoor is dit wel bedoeld**
- Laten zien hoe het ontwerp eruitziet als werkende interface
- De flow doorklikken tijdens de pitch
- Referentie voor de echte app: kleuren, typografie, componenten en copy staan hier al goed

**Waarvoor niet**
- De kaart is met de hand getekend op een canvas, niet MapLibre met echte tiles
- Coördinaten zijn een lokaal metrisch stelsel, geen WGS84
- De route is vast, er wordt niets aan een API gevraagd

De echte app komt in de root van de repo en gebruikt wél MapLibre, echte tiles en het contract uit
[`../CONTRACT.md`](../CONTRACT.md).

## Zone-regimes

De preview spreekt dezelfde taal als de verkeersbesluit-agent (spoor C), zodat de overstap klein is:

| regime | kleur | betekenis |
|---|---|---|
| `verboden` | rood | hier mag de scooter niet komen, soms alleen binnen een tijdvenster |
| `rijbaan` | oranje | snorfiets moet naar de rijbaan, daarmee ontstaat helmplicht |
| `fietspad` | groen | fietspad toegestaan |

Zie [`../mock/regels-utrecht.geojson`](../mock/regels-utrecht.geojson) voor het bronformaat.
