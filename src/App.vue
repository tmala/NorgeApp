<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useGeoDataStore } from './stores/geoData';
import pkg from '../package.json';

const geoStore = useGeoDataStore();

// Initialization
onMounted(() => {
  geoStore.syncData();
});

// Helper for computed lists in explorer
const displayedFylker = computed(() => {
  return geoStore.fylker;
});

const displayedKommuner = computed(() => {
  if (geoStore.selectedFylkeId) {
    return geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId);
  }
  return geoStore.kommuner;
});

const displayedPostnummer = computed(() => {
  if (geoStore.selectedKommuneId) {
    return geoStore.postnummer.filter(p => p.Kommunenummer === geoStore.selectedKommuneId);
  }
  if (geoStore.selectedFylkeId) {
    const munis = geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId).map(k => k.Kommunenummer);
    return geoStore.postnummer.filter(p => munis.includes(p.Kommunenummer));
  }
  // To avoid performance issues rendering 4000+ items, we only show a subset if nothing is filtered
  return geoStore.postnummer.slice(0, 100);
});

// Selection details
const currentPostcode = computed(() => {
  if (!geoStore.selectedPostnummerId) return null;
  return geoStore.postnummer.find(p => p.Postnummer === geoStore.selectedPostnummerId) || null;
});

const currentKommune = computed(() => {
  if (currentPostcode.value) {
    return geoStore.kommuner.find(k => k.Kommunenummer === currentPostcode.value!.Kommunenummer) || null;
  }
  if (geoStore.selectedKommuneId) {
    return geoStore.kommuner.find(k => k.Kommunenummer === geoStore.selectedKommuneId) || null;
  }
  return null;
});

const currentFylke = computed(() => {
  const fylkeId = currentKommune.value?.Fylkesnummer || geoStore.selectedFylkeId;
  if (!fylkeId) return null;
  return geoStore.fylker.find(f => f.Fylkesnummer === fylkeId) || null;
});

// Count of matches
const matchedCount = computed(() => {
  const results = geoStore.searchResults;
  if (!results) return 0;
  return results.fylker.length + results.kommuner.length + results.postnummer.length;
});
</script>

<template>
  <!-- Header -->
  <header class="glass-panel dashboard-header">
    <div class="brand">
      <div class="logo-wrapper">
        <!-- Map/Globe SVG Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/>
        </svg>
      </div>
      <div>
        <h1 style="display: flex; align-items: baseline; gap: 0.5rem;">
          NorgeExplorer
          <span style="font-size: 0.85rem; font-style: italic; font-weight: normal; color: var(--color-text-secondary); opacity: 0.85;">
            v{{ pkg.version }}
          </span>
        </h1>
        <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Fylker, kommuner og postnummer</p>
      </div>
    </div>
    
    <div class="sync-status-container">
      <!-- Sync State Indicator -->
      <span v-if="geoStore.isSyncing" class="badge-sync success">
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A8.97 8.97 0 0 0 20 12c0-4.97-4.03-9-9-9zm0 12c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A8.97 8.97 0 0 0 4 12c0 4.97 4.03 9 9 9v3l4-4-4-4v3c-3.31 0-6-2.69-6-6h2z"/>
        </svg>
        Synkroniserer...
      </span>
      <span v-else-if="geoStore.isDemoMode" class="badge-sync demo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        Demo-modus
      </span>
      <span v-else-if="geoStore.hasSyncError" class="badge-sync error" title="Noen ark feilet i synkroniseringen">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Synk-feil
      </span>
      <span v-else class="badge-sync success">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Google Sheets synkronisert
      </span>

      <!-- Action Buttons -->
      <button 
        class="btn btn-secondary" 
        @click="geoStore.syncData()" 
        :disabled="geoStore.isSyncing"
        title="Synkroniser data på nytt"
      >
        <svg :class="{'animate-spin': geoStore.isSyncing}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right: 0.25rem;">
          <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        Synkroniser
      </button>
    </div>
  </header>

  <!-- Stats Grid -->
  <section class="stats-grid">
    <div class="glass-panel stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ geoStore.fylker.length }}</span>
        <span class="stat-label">Fylker</span>
      </div>
    </div>

    <div class="glass-panel stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V9h8v2z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ geoStore.kommuner.length }}</span>
        <span class="stat-label">Kommuner</span>
      </div>
    </div>

    <div class="glass-panel stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ geoStore.postnummer.length }}</span>
        <span class="stat-label">Postnummer</span>
      </div>
    </div>

    <div class="glass-panel stat-card">
      <div class="stat-icon" style="color: var(--color-text-secondary); background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M21 10.12h-6.78l.84-3.89L15 6.08 9.42 11.66c-.28.27-.42.64-.42 1.03v6.62c0 .77.63 1.4 1.4 1.4h6.58c.58 0 1.08-.35 1.3-.87l2.63-6.14c.07-.17.11-.36.11-.56V11.5c0-.76-.64-1.38-1.42-1.38zM4 20h3v-8H4v8z"/>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-value" style="font-size: 0.95rem; font-weight: 600;">
          {{ geoStore.isDemoMode ? 'Lokal demo-data' : 'Google Sheets' }}
        </span>
        <span class="stat-label">Kilde (Synk: {{ geoStore.lastSynced || 'Aldri' }})</span>
      </div>
    </div>
  </section>

  <!-- Error Banners -->
  <div v-if="geoStore.hasSyncError" class="glass-panel" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); padding: 1rem 1.5rem;">
    <h3 style="color: var(--color-error); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      Tilkoblingsfeil for Google Regneark
    </h3>
    <ul style="padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem;">
      <li v-if="geoStore.errors.fylker"><strong>Fylker:</strong> {{ geoStore.errors.fylker }}</li>
      <li v-if="geoStore.errors.kommuner"><strong>Kommuner:</strong> {{ geoStore.errors.kommuner }}</li>
      <li v-if="geoStore.errors.postnummer"><strong>Postnummer:</strong> {{ geoStore.errors.postnummer }}</li>
    </ul>
    <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 0.75rem;">
      Tips: Sjekk at regnearket har faner med riktig navn, at det er publisert offentlig til nettet, og at regneark-ID-en i <code>.env</code>-filen er korrekt.
    </p>
  </div>

  <!-- Dashboard Main Grid Layout -->
  <main class="dashboard-content">
    
    <!-- Left Column: Search & Explorer -->
    <section class="glass-panel explorer-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="geoStore.searchQuery" 
            type="text" 
            placeholder="Søk på poststed, postnr, kommune eller fylke..." 
          />
        </div>
        
        <button 
          v-if="geoStore.searchQuery" 
          class="btn btn-secondary" 
          @click="geoStore.searchQuery = ''"
          style="padding: 0.5rem 0.75rem;"
        >
          Nullstill
        </button>
      </div>

      <!-- Filters/Tabs for Search Scope -->
      <div class="tabs-wrapper">
        <button 
          class="tab-btn" 
          :class="{ active: geoStore.searchType === 'all' }" 
          @click="geoStore.searchType = 'all'"
        >
          Alle resultater
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: geoStore.searchType === 'fylke' }" 
          @click="geoStore.searchType = 'fylke'"
        >
          Fylker
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: geoStore.searchType === 'kommune' }" 
          @click="geoStore.searchType = 'kommune'"
        >
          Kommuner
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: geoStore.searchType === 'postnummer' }" 
          @click="geoStore.searchType = 'postnummer'"
        >
          Postnummer
        </button>
      </div>

      <!-- Active Search Results rendering -->
      <div v-if="geoStore.searchQuery" class="search-results-container">
        <div v-if="matchedCount === 0" class="empty-state">
          Ingen treff for "{{ geoStore.searchQuery }}". Prøv et annet søk eller sjekk skrivemåten.
        </div>
        
        <div v-else>
          <!-- Fylker Results -->
          <div v-if="geoStore.searchResults?.fylker.length" style="margin-bottom: 1.25rem;">
            <h4 class="search-section-title">Fylker ({{ geoStore.searchResults.fylker.length }})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <button 
                v-for="f in geoStore.searchResults.fylker" 
                :key="f.Fylkesnummer" 
                class="result-item" 
                @click="geoStore.selectFylke(f.Fylkesnummer)"
              >
                <div class="result-main">
                  <span>{{ f.Fylkesnavn }}</span>
                  <span class="badge-county">Fylke #{{ f.Fylkesnummer }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Kommuner Results -->
          <div v-if="geoStore.searchResults?.kommuner.length" style="margin-bottom: 1.25rem;">
            <h4 class="search-section-title">Kommuner ({{ geoStore.searchResults.kommuner.length }})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <button 
                v-for="k in geoStore.searchResults.kommuner" 
                :key="k.Kommunenummer" 
                class="result-item"
                @click="geoStore.selectKommune(k.Kommunenummer)"
              >
                <div class="result-main">
                  <span>{{ k.Kommunenavn }}</span>
                  <span class="badge-muni">Kommune #{{ k.Kommunenummer }}</span>
                </div>
                <div class="result-sub">Tilhører: {{ k.countyName }} fylke</div>
              </button>
            </div>
          </div>

          <!-- Postnummer Results -->
          <div v-if="geoStore.searchResults?.postnummer.length" style="margin-bottom: 1.25rem;">
            <h4 class="search-section-title">Postnummer ({{ geoStore.searchResults.postnummer.length }})</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <button 
                v-for="p in geoStore.searchResults.postnummer" 
                :key="p.Postnummer" 
                class="result-item"
                @click="geoStore.selectPostnummer(p.Postnummer)"
              >
                <div class="result-main">
                  <span>{{ p.Postnummer }} {{ p.Poststed }}</span>
                  <span class="badge-zip">Postnummer</span>
                </div>
                <div class="result-sub">Kommune: {{ p.municipalityName }} ({{ p.Kommunenummer }}), Fylke: {{ p.countyName }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Standard Navigation Columns -->
      <div v-else class="nav-columns">
        <!-- Fylker Column -->
        <div class="nav-col">
          <div class="nav-col-header">Fylke</div>
          <ul class="nav-list">
            <li v-for="f in displayedFylker" :key="f.Fylkesnummer">
              <button 
                class="nav-item" 
                :class="{ active: geoStore.selectedFylkeId === f.Fylkesnummer }"
                @click="geoStore.selectFylke(f.Fylkesnummer)"
              >
                <span>{{ f.Fylkesnavn }}</span>
                <span class="badge">{{ geoStore.countyMunicipalityCounts[f.Fylkesnummer] || 0 }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Kommuner Column -->
        <div class="nav-col">
          <div class="nav-col-header">
            Kommune 
            <span v-if="geoStore.selectedFylkeId" style="text-transform: none; color: var(--color-primary); font-weight: 550;">
              ({{ displayedKommuner.length }})
            </span>
          </div>
          <ul class="nav-list">
            <li v-if="displayedKommuner.length === 0" class="empty-state" style="padding: 1rem; font-size: 0.8rem;">
              Ingen kommuner tilgjengelig
            </li>
            <li v-for="k in displayedKommuner" :key="k.Kommunenummer">
              <button 
                class="nav-item" 
                :class="{ active: geoStore.selectedKommuneId === k.Kommunenummer }"
                @click="geoStore.selectKommune(k.Kommunenummer)"
              >
                <span>{{ k.Kommunenavn }}</span>
                <span class="badge">{{ geoStore.municipalityPostnummerCounts[k.Kommunenummer] || 0 }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Postnummer Column -->
        <div class="nav-col">
          <div class="nav-col-header">
            Poststed
            <span v-if="geoStore.selectedKommuneId" style="text-transform: none; color: var(--color-success); font-weight: 550;">
              ({{ displayedPostnummer.length }})
            </span>
          </div>
          <ul class="nav-list">
            <li v-if="!geoStore.selectedKommuneId && !geoStore.selectedFylkeId" class="empty-state" style="padding: 1.5rem; font-size: 0.8rem; height: 100%;">
              Velg et fylke eller en kommune for å se poststeder.
            </li>
            <li v-else-if="displayedPostnummer.length === 0" class="empty-state" style="padding: 1rem; font-size: 0.8rem;">
              Ingen postnummer funnet
            </li>
            <li v-for="p in displayedPostnummer" :key="p.Postnummer">
              <button 
                class="nav-item"
                :class="{ active: geoStore.selectedPostnummerId === p.Postnummer }"
                @click="geoStore.selectPostnummer(p.Postnummer)"
              >
                <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 600;">{{ p.Postnummer }}</span>
                  <span style="font-size: 0.8rem; color: var(--color-text-secondary);">{{ p.Poststed }}</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Right Column: Detail Inspector -->
    <section class="glass-panel inspector-section">
      <!-- 1. Postnummer detail view -->
      <div v-if="currentPostcode">
        <div class="inspector-card-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="badge-zip" style="margin-bottom: 0.5rem; display: inline-block;">Postnummer detalj</span>
              <h2 style="font-size: 1.8rem; font-weight: 700; line-height: 1.2;">
                {{ currentPostcode.Postnummer }} {{ currentPostcode.Poststed }}
              </h2>
            </div>
            <button class="close-btn" @click="geoStore.selectPostnummer(null)" title="Lukk detaljvisning">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Postnummer</div>
            <div class="meta-value" style="color: var(--color-warning);">{{ currentPostcode.Postnummer }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Poststed</div>
            <div class="meta-value">{{ currentPostcode.Poststed }}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item" style="cursor: pointer;" @click="geoStore.selectKommune(currentKommune?.Kommunenummer || null)">
            <div class="meta-label">Kommune</div>
            <div class="meta-value" style="color: var(--color-primary); text-decoration: underline;">
              {{ currentKommune ? currentKommune.Kommunenavn : 'Ukjent' }}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Nr: {{ currentPostcode.Kommunenummer }}</div>
          </div>
          <div class="meta-item" style="cursor: pointer;" @click="geoStore.selectFylke(currentFylke?.Fylkesnummer || null)">
            <div class="meta-label">Fylke</div>
            <div class="meta-value" style="color: var(--color-success); text-decoration: underline;">
              {{ currentFylke ? currentFylke.Fylkesnavn : 'Ukjent' }}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Nr: {{ currentKommune?.Fylkesnummer }}</div>
          </div>
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 0.75rem;">
          <a 
            :href="`https://www.google.com/maps/search/?api=1&query=${currentPostcode.Postnummer}+${currentPostcode.Poststed}+Norway`" 
            target="_blank" 
            class="btn btn-primary"
            style="flex: 1; text-align: center; text-decoration: none;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right: 0.25rem;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Åpne i Google Maps
          </a>
          <a 
            :href="`https://www.norgeskart.no/#!?searchText=${currentPostcode.Postnummer}`" 
            target="_blank" 
            class="btn btn-secondary"
            style="flex: 1; text-align: center; text-decoration: none;"
          >
            Åpne i Norgeskart
          </a>
        </div>
      </div>

      <!-- 2. Kommune detail view -->
      <div v-else-if="currentKommune">
        <div class="inspector-card-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="badge-muni" style="margin-bottom: 0.5rem; display: inline-block;">Kommune detalj</span>
              <h2 style="font-size: 1.8rem; font-weight: 700; line-height: 1.2;">
                {{ currentKommune.Kommunenavn }}
              </h2>
            </div>
            <button class="close-btn" @click="geoStore.selectKommune(null)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Kommunenummer</div>
            <div class="meta-value" style="color: var(--color-primary);">{{ currentKommune.Kommunenummer }}</div>
          </div>
          <div class="meta-item" style="cursor: pointer;" @click="geoStore.selectFylke(currentFylke?.Fylkesnummer || null)">
            <div class="meta-label">Tilhører Fylke</div>
            <div class="meta-value" style="color: var(--color-success); text-decoration: underline;">
              {{ currentFylke ? currentFylke.Fylkesnavn : 'Ukjent' }}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Fylkesnr: {{ currentKommune.Fylkesnummer }}</div>
          </div>
        </div>

        <div style="margin-top: 1.5rem;">
          <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.5rem;">
            Poststeder i kommune ({{ displayedPostnummer.length }})
          </h4>
          <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.5rem; background: rgba(0,0,0,0.1);">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.4rem;">
              <button 
                v-for="p in displayedPostnummer" 
                :key="p.Postnummer" 
                class="nav-item"
                style="padding: 0.4rem 0.5rem;"
                @click="geoStore.selectPostnummer(p.Postnummer)"
              >
                <span style="font-size: 0.85rem; font-weight: 550;">{{ p.Postnummer }}</span>
                <span style="font-size: 0.7rem; color: var(--color-text-secondary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 80px;">
                  {{ p.Poststed }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
          <a 
            :href="`https://www.google.com/maps/search/?api=1&query=${currentKommune.Kommunenavn}+kommune+Norway`" 
            target="_blank" 
            class="btn btn-primary"
            style="flex: 1; text-align: center; text-decoration: none;"
          >
            Vis i Google Maps
          </a>
        </div>
      </div>

      <!-- 3. Fylke detail view -->
      <div v-else-if="currentFylke">
        <div class="inspector-card-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="badge-county" style="margin-bottom: 0.5rem; display: inline-block;">Fylke detalj</span>
              <h2 style="font-size: 1.8rem; font-weight: 700; line-height: 1.2;">
                {{ currentFylke.Fylkesnavn }}
              </h2>
            </div>
            <button class="close-btn" @click="geoStore.selectFylke(null)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Fylkesnummer</div>
            <div class="meta-value" style="color: var(--color-success);">{{ currentFylke.Fylkesnummer }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Antall Kommuner</div>
            <div class="meta-value">{{ displayedKommuner.length }}</div>
          </div>
        </div>

        <div style="margin-top: 1.5rem;">
          <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.5rem;">
            Kommuner i fylke ({{ displayedKommuner.length }})
          </h4>
          <div style="max-height: 280px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.5rem; background: rgba(0,0,0,0.1);">
            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <button 
                v-for="k in displayedKommuner" 
                :key="k.Kommunenummer" 
                class="nav-item"
                @click="geoStore.selectKommune(k.Kommunenummer)"
              >
                <span>{{ k.Kommunenavn }}</span>
                <span class="badge">Nr: {{ k.Kommunenummer }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Default Info Panel (nothing selected) -->
      <div v-else>
        <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="color: var(--color-primary);">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          Om NorgeExplorer
        </h2>
        
        <div class="setup-guide">
          <p>Dette systemet henter data direkte fra et delt Google Regneark med tre faner:</p>
          <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.90rem; margin: 0.75rem 0;">
            <li><strong>fylker:</strong> Oversikt over alle fylker med <code>Fylkesnummer</code> og <code>Fylkesnavn</code>.</li>
            <li><strong>kommuner:</strong> Oversikt over alle kommuner med <code>Kommunenummer</code>, <code>Kommunenavn</code> og tilhørende <code>Fylkesnummer</code>.</li>
            <li><strong>postnummer:</strong> Oversikt over alle postnummer med <code>Postnummer</code>, <code>Poststed</code> og tilhørende <code>Kommunenummer</code>.</li>
          </ul>

          <div class="glass-panel" style="margin-top: 1.5rem; border-color: var(--color-primary-glow); background: rgba(99, 102, 241, 0.05); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 0.5rem;">
              💡 <strong>Konfigurasjon via miljøvariabel:</strong>
            </p>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.4;">
              Regneark-ID er lagret sikkert i prosjektets <code>.env</code>-fil som <code>VITE_SPREADSHEET_ID</code>. For å oppdatere ID-en, endre verdien i denne filen.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Scoped overrides/adjustments */
</style>
