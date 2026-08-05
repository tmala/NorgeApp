# NorgeExplorer 🇳🇴

NorgeExplorer er en moderne, interaktiv Vue 3-applikasjon (Vite + Pinia) som henter og visualiserer geografiske data for norske fylker, kommuner og postnummer direkte fra et delt Google Regneark. Applikasjonen tilbyr et premium, mørkt dashboard-grensesnitt med glassmorfisme, sanntidssøk, drill-down utforsking og detaljvisning med kartlenker.

---

## Funksjoner

* **Google Regneark Synkronisering:** Data hentes direkte fra nettleseren uten API-nøkkel ved bruk av Google Sheets' Visualisering-API (`gviz/tq`).
* **Fuzzy Kolonnesøk:** Synkroniseringen gjenkjenner automatisk kolonnenavn uavhengig av om de er skrevet i små/store bokstaver eller med forkortelser (f.eks. `Fylkesnr`, `kommunenummer` eller `Poststed`).
* **Robust Demo-modus:** Inneholder et innebygd ekte sett med norske fylker, kommuner og postnummer som lastes inn hvis ingen Spreadsheet-ID er konfigurert.
* **Avansert Søk:** Søk på tvers av postnummer, poststed, kommunenavn og fylker samtidig.
* **Underkatalog-støtte:** Konfigurert til å kunne hostes under `/nex/` på en produksjonswebserver.

---

## Konfigurasjon av Google Regneark

Applikasjonen forventer et Google Regneark med tre spesifikke faner:

1. `fylker` med kolonnene: `Fylkesnummer` og `Fylkesnavn`.
2. `kommuner` med kolonnene: `Kommunenummer`, `Kommunenavn` og `Fylkesnummer`.
3. `postnummer` med kolonnene: `Postnummer`, `Poststed` og `Kommunenummer`.

### Trinn for oppsett:
1. Åpne regnearket i Google Sheets.
2. Klikk på **Fil** -> **Del** -> **Publiser på nettet**.
3. Velg **Hele dokumentet** og **Webside**, og klikk på **Publiser**.
4. Kopier regnearkets ID fra URL-en i nettleseren din (den lange strengen mellom `/d/` og `/edit`).
5. Opprett en `.env`-fil i prosjektets rotmappe, og lim inn ID-en:
   ```env
   VITE_SPREADSHEET_ID=din_regneark_id_her
   ```

---

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

### Bygge for produksjon
Kompiler og minimer kildekoden for produksjon:
```sh
npm run build
```
Dette oppretter en `dist`-mappe med produksjonsklare filer, der alle stier er prefikset med `/nex/` for hosting under underkatalogen `/nex`.

---

## Prosjektstruktur

```
NorgeApp/
├── .env                  # Inneholder Google Spreadsheet ID
├── index.html            # Hoved HTML-fil med Google Fonts
├── vite.config.ts        # Vite-konfigurasjon med base: '/nex/'
├── src/
│   ├── main.ts           # Oppstartsskript og registrering av Pinia
│   ├── App.vue           # Hovedkomponenten for dashboardet og søk
│   ├── assets/
│   │   ├── base.css      # Design system variabler og base resets
│   │   └── main.css      # Dashboard- og komponent-spesifikke stiler
│   ├── services/
│   │   └── mockData.ts   # Ekte demo-geodata for offline/demo fallback
│   └── stores/
│     └── geoData.ts     # Pinia store med CSV-parsing og app-tilstand
```
