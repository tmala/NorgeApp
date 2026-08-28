import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGeoDataStore } from '../geoData'

describe('useGeoDataStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with demo data on resetToDemo()', () => {
    const store = useGeoDataStore()
    store.resetToDemo()

    expect(store.fylker.length).toBeGreaterThan(0)
    expect(store.kommuner.length).toBeGreaterThan(0)
    expect(store.postnummer.length).toBeGreaterThan(0)
    expect(Object.keys(store.postnummerKategorier).length).toBeGreaterThan(0)
    expect(store.selectedFylkeId).toBeNull()
    expect(store.selectedKommuneId).toBeNull()
    expect(store.selectedPostnummerId).toBeNull()
  })

  describe('Selection & Hierarchy Actions', () => {
    it('selectFylke sets selectedFylkeId and resets child selections and searchQuery', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = 'test'
      store.selectedKommuneId = '0301'
      store.selectedPostnummerId = '0001'

      store.selectFylke('03')

      expect(store.selectedFylkeId).toBe('03')
      expect(store.selectedKommuneId).toBeNull()
      expect(store.selectedPostnummerId).toBeNull()
      expect(store.searchQuery).toBe('')
    })

    it('selectKommune automatically resolves and sets parent selectedFylkeId', () => {
      const store = useGeoDataStore()
      store.resetToDemo()

      // 0301 Oslo is in fylke 03 (Oslo)
      store.selectKommune('0301')

      expect(store.selectedKommuneId).toBe('0301')
      expect(store.selectedFylkeId).toBe('03')
      expect(store.selectedPostnummerId).toBeNull()
      expect(store.searchQuery).toBe('')
    })

    it('selectPostnummer automatically resolves both parent municipality and county', () => {
      const store = useGeoDataStore()
      store.resetToDemo()

      const targetPost = store.postnummer[0]
      expect(targetPost).toBeDefined()
      if (!targetPost) return

      store.selectPostnummer(targetPost.Postnummer)

      expect(store.selectedPostnummerId).toBe(targetPost.Postnummer)
      expect(store.selectedKommuneId).toBe(targetPost.Kommunenummer)
      
      const muni = store.kommuner.find(k => k.Kommunenummer === targetPost.Kommunenummer)
      expect(store.selectedFylkeId).toBe(muni?.Fylkesnummer)
    })
  })

  describe('Getters & Calculations', () => {
    it('countyMunicipalityCounts aggregates municipalities correctly', () => {
      const store = useGeoDataStore()
      store.resetToDemo()

      const counts = store.countyMunicipalityCounts
      expect(counts['03']).toBe(1) // Oslo has 1 municipality (0301)
      expect(typeof counts['46']).toBe('number') // Vestland
    })

    it('municipalityPostnummerCounts aggregates postal codes correctly', () => {
      const store = useGeoDataStore()
      store.resetToDemo()

      const counts = store.municipalityPostnummerCounts
      expect(counts['0301']).toBeGreaterThan(0)
    })

    it('countyMap and municipalityMap provide fast lookup by ID', () => {
      const store = useGeoDataStore()
      store.resetToDemo()

      const osloCounty = store.countyMap.get('03')
      expect(osloCounty).toBeDefined()
      expect(osloCounty?.Fylkesnavn).toBe('Oslo')

      const osloMuni = store.municipalityMap.get('0301')
      expect(osloMuni).toBeDefined()
      expect(osloMuni?.Kommunenavn).toBe('Oslo')
    })
  })

  describe('Search Functionality', () => {
    it('returns null searchResults when query is empty', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = '   '

      expect(store.searchResults).toBeNull()
    })

    it('finds counties matching query', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = 'Oslo'

      const results = store.searchResults
      expect(results).not.toBeNull()
      expect(results?.fylker.some(f => f.Fylkesnavn === 'Oslo')).toBe(true)
    })

    it('finds municipalities matching query and includes countyName', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = 'Bergen'

      const results = store.searchResults
      expect(results).not.toBeNull()
      const bergen = results?.kommuner.find(k => k.Kommunenavn === 'Bergen')
      expect(bergen).toBeDefined()
      expect(bergen?.countyName).toBe('Vestland')
    })

    it('finds postal codes matching query and includes municipality and county names', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = '0001'

      const results = store.searchResults
      expect(results).not.toBeNull()
      const post = results?.postnummer.find(p => p.Postnummer === '0001')
      expect(post).toBeDefined()
      expect(post?.municipalityName).toBe('Oslo')
      expect(post?.countyName).toBe('Oslo')
    })

    it('respects searchType filter', () => {
      const store = useGeoDataStore()
      store.resetToDemo()
      store.searchQuery = 'Oslo'

      store.searchType = 'fylke'
      expect(store.searchResults?.fylker.length).toBeGreaterThan(0)
      expect(store.searchResults?.kommuner.length).toBe(0)
      expect(store.searchResults?.postnummer.length).toBe(0)

      store.searchType = 'kommune'
      expect(store.searchResults?.fylker.length).toBe(0)
      expect(store.searchResults?.kommuner.length).toBeGreaterThan(0)
      expect(store.searchResults?.postnummer.length).toBe(0)
    })
  })
})
