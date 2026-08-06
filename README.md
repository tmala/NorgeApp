# NorgeExplorer 🇳🇴

NorgeExplorer er en mobilvennlig Vue3-applikasjon (Vite + Pinia) som viser geografiske data for norske fylker, kommuner og postnummer hentet fra et delt Google Regneark. 

## Funksjoner

* **Google Regneark Synkronisering**<br>Data hentes direkte fra nettleseren<br>uten API-nøkkel ved bruk av Google Sheets' Visualisering-API (`gviz/tq`).

* **Fuzzy Kolonnesøk**<br>Synkroniseringen gjenkjenner automatisk<br>kolonnenavn uavhengig av om de er skrevet i små/store bokstaver<br>eller med forkortelser (f.eks. `Fylkesnr`, `kommunenummer` eller `Poststed`).

* **Mobil-First & PWA-kompatibel:** Tilrettelagt for mobile enheter med meta-tagger for fullskjerm-kjøring, SVG-favicon, og Apple Touch Icon.

* **Robust Demo-modus:** Inneholder et innebygd sett med norske geografiske data og kategorikoder som lastes inn hvis ingen Spreadsheet-ID er konfigurert.


## Google Regneark

Applikasjonen forventer et Google Regneark med fem spesifikke faner:

1. **`Fylker`** med kolonnene:
   * `Fylkesnummer` (f.eks. `11`)
   * `Fylkesnavn` (f.eks. `Rogaland`)
2. **`Kommuner`** med kolonnene:
   * `Kommunenummer` (f.eks. `1103`)
   * `Kommunenavn` (f.eks. `Stavanger`)
   * `Fylkesnummer` (f.eks. `11`)
3. **`Postnummer`** med kolonnene:
   * `Postnummer` (f.eks. `4005`)
   * `Poststed` (f.eks. `STAVANGER`)
   * `Kommunenummer` (f.eks. `1103`)
   * `Kategori` (f.eks. `G` - valgfri kolonne for kategorikode)
4. **`PostnummerKategori`** med kolonnene:
   * `Kategori` (f.eks. `G` eller `B`)
   * `Beskrivelse` (f.eks. `Gateadresse` eller `Postboksadresse`)
5. **`Config`** med kolonnene:
   * `Key` (f.eks. `LAST_UPDATE`)
   * `Value` (f.eks. `2026-08-06T08:23:45.131Z`)

Data kan hentes fra f.eks. https://data.norge.no/datasets

### Trinn for oppsett:
1. Åpne regnearket i Google Sheets.
2. Klikk på **Fil** -> **Del** -> **Publiser på nettet**.
3. Velg **Hele dokumentet** og **Webside**, og klikk på **Publiser**.
4. Kopier regnearkets ID fra URL-en i nettleseren din (den lange strengen mellom `/d/` og `/edit`).
5. Opprett en `.env`-fil i prosjektets rotmappe, og lim inn ID-en:
   ```env
   VITE_SPREADSHEET_ID=din_regneark_id_her
   ```
6. Lag et AppScript i Google Regnearket med følgende kode:
   * Gå til **Utvidelser** -> **AppScript**.
   * Lim inn koden nedenfor i editoren, erstatt eksisterende innhold.  
   * Klikk på **Lagre**-ikonet (diskett) øverst til venstre.
   * Klikk på **Kjør** (play-ikonet) én gang for å autorisere tilgangen.
   
   ```javascript
   function onEdit(e) {
      if (!e || !e.range) return; 
      
      var editedSheet = e.source.getActiveSheet();
      var editedRange = e.range;
      
      // Unngår at scriptet kjører seg selv i en uendelig loop hvis B2 oppdateres
      if (editedSheet.getName() === "Config" && editedRange.getA1Notation() === "B2") {
         return;
      }
      
      var configSheet = e.source.getSheetByName("Config");
      if (configSheet) {
         // Henter gjeldende tid og konverterer til ISO 8601 (UTC)
         var isoString = new Date().toISOString();
         
         // Setter inn verdien som ren tekst (ved hjelp av en apostrof) 
         // slik at Google Sheets ikke automatisk endrer formatet til lokal tid
         configSheet.getRange("B2").setValue("'" + isoString);
      }
   }   
   ```
   Dette gjør at oppdateringsdatoen i applikasjonen stemmer overens med datoen for sist redigering i regnearket.
7. 

## Komme i gang

### Installasjon
Installer prosjektets avhengigheter:
```sh
npm install
```

### Kjøre lokalt (Utvikling)
Start den lokale utviklingsserveren:
```sh
npm run dev
```
Åpne nettleseren på `http://localhost:5173/`.

### TypeScript Type-sjekk
For å verifisere typer på tvers av prosjektet:
```sh
npm run type-check
```

### Kjøre Tester
Du kan kjøre enhetstester og end-to-end (E2E) nettlesertester:

* **Enhetstester (Vitest):**
  ```sh
  npm run test:unit
  ```
* **Nettlesertester (Playwright E2E):**
  ```sh
  npm run test:e2e
  ```

### Bygge for produksjon
Kompiler og minimer kildekoden for produksjon:
```sh
npm run build
```
Dette oppretter en `dist`-mappe med produksjonsklare filer, der alle stier er prefikset med `/nex/` for hosting under underkatalogen `/nex`.


## Prosjektstruktur

```
NorgeApp/
├── .env                  # Inneholder Google Spreadsheet ID
├── index.html            # Hovedfil med PWA-meta-tagger og ikoner
├── vite.config.ts        # Vite-konfigurasjon med base: '/nex/'
├── src/
│   ├── main.ts           # Oppstartsskript og registrering av Pinia
│   ├── App.vue           # App-layout og header/footer håndtering
│   ├── assets/
│   │   ├── base.css      # Design system variabler og base resets
│   │   └── main.css      # Komponenter og stil-definisjoner
│   ├── components/
│   │   ├── explorer/
│   │   │   ├── CountyList.vue        # Kolonneliste for Fylker
│   │   │   ├── MunicipalityList.vue  # Kolonneliste for Kommuner
│   │   │   └── PostalCodeList.vue    # Kolonneliste for Poststeder
│   │   └── inspector/
│   │       └── DetailInspector.vue   # Detaljvisning
│   ├── services/
│   │   └── mockData.ts   # Offline- og kategorikoder for demo/test
│   └── stores/
│       └── geoData.ts    # Pinia store med CSV-parsing, Config og oppdateringstilstand
```

## Utviklingsverktøy
Jeg har brukt følgende verktøy for å utvikle denne applikasjonen:

- Antigravity v2.1.1 med Gemini 3.5 Flash (Medium)
- Google Chrome
- Node v24.18.1
- npm 11.16.0
- git 2.54.0

