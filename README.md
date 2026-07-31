# SCOOT — deelscooter-navigatie Utrecht

Navigatie-app voor deelscooter-rijders die je **om verboden zones heen** stuurt in plaats van erdoorheen.
Hackathon-project, twee sporen die parallel bouwen tegen één afgesproken contract.

| Spoor | Wie | Wat |
|---|---|---|
| **A — App** | Fabian | Kaart, bestemming intikken, route zien, rijweergave |
| **B — Routing** | Alissa | Route-endpoint dat zones vermijdt en waarschuwingen teruggeeft |

Spoor A bouwt tegen `mock/route.json` en schakelt aan het eind om naar de echte endpoint van spoor B.
Lukt koppelen niet, dan staat de mock-demo overeind.

## Het contract

Dit is het enige wat beide sporen van elkaar hoeven te weten. Zie [`CONTRACT.md`](CONTRACT.md).

**Verzoek**

```
GET /route?start=<lon>,<lat>&eind=<lon>,<lat>&voertuig=snorfiets
```

**Antwoord** — zie `mock/route.json` voor een geldig voorbeeld.

```json
{
  "route": { "type": "LineString", "coordinates": [[5.1189, 52.0855], [5.1214, 52.0907]] },
  "afstand_m": 1450,
  "waarschuwingen": [
    { "bij": [5.1215, 52.0912], "tekst": "Verboden zone: voetgangersgebied" }
  ]
}
```

## Aan de slag

```bash
git clone https://github.com/Fabianhvandijk/scoot-utrecht.git
cd scoot-utrecht
```

**Spoor A** draait als statische site, geen build-stap. Open `index.html`, of:

```bash
python3 -m http.server 5173
```

**Spoor B** is vrij in techniekkeuze. Enige eis: het antwoord volgt `CONTRACT.md` en er staat CORS open zodat de app hem kan aanroepen.

## Afspraken

- Werk op een eigen branch en open een PR naar `main`.
- Breek het contract niet zonder overleg. Extra velden toevoegen mag altijd, bestaande velden hernoemen niet.
- `main` wordt automatisch gepubliceerd op GitHub Pages.
