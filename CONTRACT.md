# API-contract

Versie 1. Afgesproken aan het begin van de hackathon. Spoor A is de consument, spoor B de leverancier.

## Verzoek

```
GET /route
```

| Parameter | Formaat | Voorbeeld | Verplicht |
|---|---|---|---|
| `start` | `lon,lat` | `5.1189,52.0855` | ja |
| `eind` | `lon,lat` | `5.1214,52.0907` | ja |
| `voertuig` | string | `bromscooter` \| `snorscooter` | ja |

Coördinaten zijn WGS84 en staan in de volgorde **lon, lat** (zoals GeoJSON, niet zoals Google Maps).

## Antwoord

```json
{
  "route": {
    "type": "LineString",
    "coordinates": [[5.1189, 52.0855], [5.1201, 52.0871], [5.1214, 52.0907]]
  },
  "afstand_m": 1450,
  "waarschuwingen": [
    { "bij": [5.1215, 52.0912], "tekst": "Verboden zone: voetgangersgebied" }
  ]
}
```

### Verplichte velden

| Veld | Type | Betekenis |
|---|---|---|
| `route` | GeoJSON `LineString` | De te rijden lijn, in volgorde van start naar eind |
| `afstand_m` | number | Totale afstand in meters |
| `waarschuwingen` | array | Kan leeg zijn |
| `waarschuwingen[].bij` | `[lon, lat]` | Punt op of vlak bij de route waar de waarschuwing geldt |
| `waarschuwingen[].tekst` | string | Wat de rijder te zien krijgt |

### Optionele velden

Spoor A gebruikt deze als ze er zijn en valt terug op een schatting als ze ontbreken.

| Veld | Type | Betekenis |
|---|---|---|
| `duur_s` | number | Verwachte reistijd in seconden |
| `zones` | array | Vlakken om op de kaart te kleuren |
| `zones[].type` | `verboden` \| `stapvoets` \| `toegestaan` | Bepaalt de kleur |
| `zones[].naam` | string | Label op de kaart |
| `zones[].polygon` | GeoJSON `Polygon` | De vorm van de zone |
| `waarschuwingen[].type` | `verboden` \| `stapvoets` | Zonder dit veld gaat A uit van `verboden` |

## Fouten

Bij een fout: HTTP-statuscode buiten de 200-serie en een body met een `fout`-veld.

```json
{ "fout": "Geen route gevonden die de verboden zones vermijdt" }
```

## CORS

De app draait op een ander domein dan de API. Zet `Access-Control-Allow-Origin` open, anders blokkeert de browser het verzoek.
