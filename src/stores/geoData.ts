import { defineStore } from 'pinia';
import { 
  mockFylker, 
  mockKommuner, 
  mockPostnummer, 
  mockPostnummerKategorier,
  type County, 
  type Municipality, 
  type PostalCode 
} from '../services/mockData';

// Simple but robust CSV parser that handles quotes and newlines
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue);
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentValue);
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  if (row.length > 0 || currentValue !== '') {
    row.push(currentValue);
    lines.push(row);
  }
  
  return lines;
}

// Find header index by checking multiple potential names (case-insensitive)
function findHeaderIndex(headers: string[], candidates: string[]): number {
  const cleanHeaders = headers.map(h => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = cleanHeaders.indexOf(candidate.toLowerCase());
    if (idx !== -1) return idx;
  }
  
  // Fuzzy search: starts with or contains
  for (let i = 0; i < cleanHeaders.length; i++) {
    const h = cleanHeaders[i] || '';
    for (const candidate of candidates) {
      const c = candidate.toLowerCase();
      if (h.includes(c) || c.includes(h)) return i;
    }
  }
  return -1;
}

export const useGeoDataStore = defineStore('geoData', {
  state: () => ({
    spreadsheetId: (import.meta.env.VITE_SPREADSHEET_ID || '') as string,
    sheetNames: {
      fylker: 'fylker',
      kommuner: 'kommuner',
      postnummer: 'postnummer',
      postnummerKategori: 'PostnummerKategori'
    },
    fylker: [] as County[],
    kommuner: [] as Municipality[],
    postnummer: [] as PostalCode[],
    postnummerKategorier: {} as Record<string, string>,
    loading: {
      fylker: false,
      kommuner: false,
      postnummer: false,
      postnummerKategori: false
    },
    errors: {
      fylker: null as string | null,
      kommuner: null as string | null,
      postnummer: null as string | null,
      postnummerKategori: null as string | null
    },
    isDemoMode: !import.meta.env.VITE_SPREADSHEET_ID,
    lastSynced: null as string | null,
    
    // UI selection & search state
    searchQuery: '',
    searchType: 'all' as 'all' | 'fylke' | 'kommune' | 'postnummer',
    selectedFylkeId: null as string | null,
    selectedKommuneId: null as string | null,
    selectedPostnummerId: null as string | null
  }),
  
  getters: {
    isSyncing(state): boolean {
      return state.loading.fylker || state.loading.kommuner || state.loading.postnummer || state.loading.postnummerKategori;
    },
    
    hasSyncError(state): boolean {
      return !!(state.errors.fylker || state.errors.kommuner || state.errors.postnummer || state.errors.postnummerKategori);
    },
    
    countyMap(state): Map<string, County> {
      return new Map(state.fylker.map(f => [f.Fylkesnummer, f]));
    },
    
    municipalityMap(state): Map<string, Municipality> {
      return new Map(state.kommuner.map(k => [k.Kommunenummer, k]));
    },
    
    postnummerMap(state): Map<string, PostalCode> {
      return new Map(state.postnummer.map(p => [p.Postnummer, p]));
    },
    
    // Get counts of municipalities per county
    countyMunicipalityCounts(state): Record<string, number> {
      const counts: Record<string, number> = {};
      state.kommuner.forEach(k => {
        counts[k.Fylkesnummer] = (counts[k.Fylkesnummer] || 0) + 1;
      });
      return counts;
    },
    
    // Get count of postal codes per municipality
    municipalityPostnummerCounts(state): Record<string, number> {
      const counts: Record<string, number> = {};
      state.postnummer.forEach(p => {
        counts[p.Kommunenummer] = (counts[p.Kommunenummer] || 0) + 1;
      });
      return counts;
    },
    
    // Complex combined search results
    searchResults(state) {
      const query = state.searchQuery.trim().toLowerCase();
      if (!query) return null;
      
      const matchedFylker: County[] = [];
      const matchedKommuner: (Municipality & { countyName: string })[] = [];
      const matchedPostnummer: (PostalCode & { municipalityName: string, countyName: string })[] = [];
      
      const cMap = this.countyMap;
      const mMap = this.municipalityMap;
      
      // 1. Match Counties (Fylker)
      if (state.searchType === 'all' || state.searchType === 'fylke') {
        state.fylker.forEach(f => {
          if (f.Fylkesnummer.includes(query) || f.Fylkesnavn.toLowerCase().includes(query)) {
            matchedFylker.push(f);
          }
        });
      }
      
      // 2. Match Municipalities (Kommuner)
      if (state.searchType === 'all' || state.searchType === 'kommune') {
        state.kommuner.forEach(k => {
          const county = cMap.get(k.Fylkesnummer);
          const countyName = county ? county.Fylkesnavn : 'Ukjent';
          if (
            k.Kommunenummer.includes(query) || 
            k.Kommunenavn.toLowerCase().includes(query) ||
            countyName.toLowerCase().includes(query)
          ) {
            matchedKommuner.push({ ...k, countyName });
          }
        });
      }
      
      // 3. Match Postal Codes (Postnummer)
      if (state.searchType === 'all' || state.searchType === 'postnummer') {
        state.postnummer.forEach(p => {
          const muni = mMap.get(p.Kommunenummer);
          const muniName = muni ? muni.Kommunenavn : 'Ukjent';
          const county = muni ? cMap.get(muni.Fylkesnummer) : null;
          const countyName = county ? county.Fylkesnavn : 'Ukjent';
          
          if (
            p.Postnummer.includes(query) || 
            p.Poststed.toLowerCase().includes(query) ||
            muniName.toLowerCase().includes(query) ||
            countyName.toLowerCase().includes(query)
          ) {
            matchedPostnummer.push({ 
              ...p, 
              municipalityName: muniName, 
              countyName 
            });
          }
        });
      }
      
      return {
        fylker: matchedFylker,
        kommuner: matchedKommuner,
        postnummer: matchedPostnummer
      };
    }
  },
  
  actions: {
    loadConfig() {
      // Configuration is loaded from environment variables on startup.
    },
    
    resetToDemo() {
      this.fylker = [...mockFylker];
      this.kommuner = [...mockKommuner];
      this.postnummer = [...mockPostnummer];
      this.postnummerKategorier = { ...mockPostnummerKategorier };
      
      this.errors = { fylker: null, kommuner: null, postnummer: null, postnummerKategori: null };
      this.lastSynced = new Date().toLocaleString('no-NO');
      
      // Reset selection
      this.selectedFylkeId = null;
      this.selectedKommuneId = null;
      this.selectedPostnummerId = null;
    },
    
    async syncData() {
      if (!this.spreadsheetId) {
        this.resetToDemo();
        return;
      }
      
      this.errors = { fylker: null, kommuner: null, postnummer: null, postnummerKategori: null };
      
      // Fetch concurrently
      await Promise.all([
        this.fetchSheet('fylker'),
        this.fetchSheet('kommuner'),
        this.fetchSheet('postnummer'),
        this.fetchSheet('postnummerKategori')
      ]);
      
      if (!this.errors.fylker && !this.errors.kommuner && !this.errors.postnummer && !this.errors.postnummerKategori) {
        this.lastSynced = new Date().toLocaleString('no-NO');
      }
    },
    
    async fetchSheet(type: 'fylker' | 'kommuner' | 'postnummer' | 'postnummerKategori') {
      this.loading[type] = true;
      this.errors[type] = null;
      
      const sheetName = this.sheetNames[type];
      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP feil! Status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
          throw new Error('Fanearket er tomt eller mangler overskriftsrad.');
        }
        
        const headers = rows[0] || [];
        const dataRows = rows.slice(1);
        
        if (type === 'fylker') {
          const fylkeNrIdx = findHeaderIndex(headers, ['fylkesnr', 'fylkesnummer', 'fylke_nr', 'fylke_nummer', 'code', 'id', 'fylkenr']);
          const fylkeNavnIdx = findHeaderIndex(headers, ['fylkesnavn', 'fylke_navn', 'navn', 'name', 'fylke navn']);
          
          if (fylkeNrIdx === -1 || fylkeNavnIdx === -1) {
            throw new Error(`Mangler påkrevde kolonner i fylkesarket. Fant overskrifter: [${headers.join(', ')}]. Vennligst ha kolonner for 'Fylkesnummer' og 'Fylkesnavn'.`);
          }
          
          this.fylker = dataRows.map(row => ({
            Fylkesnummer: String(row[fylkeNrIdx] || '').trim().padStart(2, '0'),
            Fylkesnavn: String(row[fylkeNavnIdx] || '').trim()
          })).filter(f => f.Fylkesnavn);
          
        } else if (type === 'kommuner') {
          const kommuneNrIdx = findHeaderIndex(headers, ['kommunenr', 'kommunenummer', 'kommune_nr', 'kommune_nummer', 'code', 'id']);
          const kommuneNavnIdx = findHeaderIndex(headers, ['kommunenavn', 'kommune_navn', 'navn', 'name']);
          const fylkeNrIdx = findHeaderIndex(headers, ['fylkesnr', 'fylkesnummer', 'fylke_nr', 'fylke_nummer', 'fylke nr', 'fylkenr']);
          
          if (kommuneNrIdx === -1 || kommuneNavnIdx === -1 || fylkeNrIdx === -1) {
            throw new Error(`Mangler påkrevde kolonner i kommunearket. Fant overskrifter: [${headers.join(', ')}]. Vennligst ha kolonner for 'Kommunenummer', 'Kommunenavn' og 'Fylkesnummer'.`);
          }
          
          this.kommuner = dataRows.map(row => ({
            Kommunenummer: String(row[kommuneNrIdx] || '').trim().padStart(4, '0'),
            Kommunenavn: String(row[kommuneNavnIdx] || '').trim(),
            Fylkesnummer: String(row[fylkeNrIdx] || '').trim().padStart(2, '0')
          })).filter(k => k.Kommunenavn);
          
        } else if (type === 'postnummer') {
          const postnrIdx = findHeaderIndex(headers, ['postnr', 'postnummer', 'zip', 'postal code', 'postnummer']);
          const poststedIdx = findHeaderIndex(headers, ['poststed', 'sted', 'by', 'city', 'postadresse']);
          const kommuneNrIdx = findHeaderIndex(headers, ['kommunenr', 'kommunenummer', 'kommune_nr', 'kommune_nummer', 'kommune nr', 'kommunenr']);
          const kategoriIdx = findHeaderIndex(headers, ['kategori', 'category', 'type']);
          
          if (postnrIdx === -1 || poststedIdx === -1 || kommuneNrIdx === -1) {
            throw new Error(`Mangler påkrevde kolonner i postnummerarket. Fant overskrifter: [${headers.join(', ')}]. Vennligst ha kolonner for 'Postnummer', 'Poststed' og 'Kommunenummer'.`);
          }
          
          this.postnummer = dataRows.map(row => ({
            Postnummer: String(row[postnrIdx] || '').trim().padStart(4, '0'),
            Poststed: String(row[poststedIdx] || '').trim().toUpperCase(),
            Kommunenummer: String(row[kommuneNrIdx] || '').trim().padStart(4, '0'),
            Kategori: kategoriIdx !== -1 ? String(row[kategoriIdx] || '').trim().toUpperCase() : undefined
          })).filter(p => p.Postnummer);
          
        } else if (type === 'postnummerKategori') {
          const kategoriIdx = findHeaderIndex(headers, ['kategori', 'category', 'type', 'id', 'code']);
          const beskrivelseIdx = findHeaderIndex(headers, ['beskrivelse', 'description', 'navn', 'name', 'forklaring']);
          
          if (kategoriIdx === -1 || beskrivelseIdx === -1) {
            throw new Error(`Mangler påkrevde kolonner i PostnummerKategori-arket. Fant overskrifter: [${headers.join(', ')}]. Vennligst ha kolonner for 'Kategori' og 'Beskrivelse'.`);
          }
          
          const kMap: Record<string, string> = {};
          dataRows.forEach(row => {
            const key = String(row[kategoriIdx] || '').trim().toUpperCase();
            const val = String(row[beskrivelseIdx] || '').trim();
            if (key && val) {
              kMap[key] = val;
            }
          });
          this.postnummerKategorier = kMap;
        }
        
      } catch (err: any) {
        console.error(`Feil ved henting av ${type}:`, err);
        this.errors[type] = err.message || `Ukjent feil under synkronisering av ${type}`;
      } finally {
        this.loading[type] = false;
      }
    },
    
    selectFylke(id: string | null) {
      this.selectedFylkeId = id;
      this.selectedKommuneId = null;
      this.selectedPostnummerId = null;
      
      // Auto-clear search query when navigating hierarchy to keep UX clean
      this.searchQuery = '';
    },
    
    selectKommune(id: string | null) {
      this.selectedKommuneId = id;
      if (id) {
        const muni = this.kommuner.find(k => k.Kommunenummer === id);
        if (muni) {
          this.selectedFylkeId = muni.Fylkesnummer;
        }
      }
      this.selectedPostnummerId = null;
      this.searchQuery = '';
    },
    
    selectPostnummer(id: string | null) {
      this.selectedPostnummerId = id;
      if (id) {
        const p = this.postnummer.find(x => x.Postnummer === id);
        if (p) {
          this.selectedKommuneId = p.Kommunenummer;
          const muni = this.kommuner.find(k => k.Kommunenummer === p.Kommunenummer);
          if (muni) {
            this.selectedFylkeId = muni.Fylkesnummer;
          }
        }
      }
    }
  }
});
