<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useGeoDataStore } from './stores/geoData';
import pkg from '../package.json';
import CountyList from './components/explorer/CountyList.vue';
import MunicipalityList from './components/explorer/MunicipalityList.vue';
import PostalCodeList from './components/explorer/PostalCodeList.vue';
import DetailInspector from './components/inspector/DetailInspector.vue';

const geoStore = useGeoDataStore();
const isStatsExpanded = ref(false);

// Initialization
onMounted(() => {
  geoStore.syncData();
});

// Count of matches
const matchedCount = computed(() => {
  const results = geoStore.searchResults;
  if (!results) return 0;
  return results.fylker.length + results.kommuner.length + results.postnummer.length;
});

function handleUpdateClick() {
  if (geoStore.isDemoMode) {
    alert("Mangler ID for Google Regnearket i environment-filen (.env)");
    return;
  }
  geoStore.syncData();
}
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
      <span v-if="geoStore.isSyncing" class="badge-sync info" title="Synkroniserer..." style="padding: 0.5rem; justify-content: center;">
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A8.97 8.97 0 0 0 20 12c0-4.97-4.03-9-9-9zm0 12c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A8.97 8.97 0 0 0 4 12c0 4.97 4.03 9 9 9v3l4-4-4-4v3c-3.31 0-6-2.69-6-6h2z"/>
        </svg>
      </span>
      <span v-else-if="geoStore.isDemoMode" class="badge-sync demo" title="Demo-modus" style="padding: 0.5rem; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </span>
      <span v-else-if="geoStore.hasSyncError" class="badge-sync error" title="Noen ark feilet i synkroniseringen" style="padding: 0.5rem; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </span>
      <span v-else class="badge-sync success" :title="`Oppdatert ${geoStore.lastSynced || 'Aldri'}`" style="padding: 0.5rem; justify-content: center; cursor: help;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </span>

      <!-- Toggle stats button -->
      <button 
        class="btn btn-secondary" 
        @click="isStatsExpanded = !isStatsExpanded"
        :title="isStatsExpanded ? 'Skjul info' : 'Vis info'"
        style="padding: 0.5rem 0.85rem;"
      >
        {{ isStatsExpanded ? 'Skjul info' : 'Vis info' }}
      </button>

      <!-- Action Buttons -->
      <button 
        class="btn btn-secondary" 
        @click="handleUpdateClick" 
        :disabled="geoStore.isSyncing"
        title="oppdater data"
        style="padding: 0.5rem; display: flex; align-items: center; justify-content: center;"
      >
        <svg :class="{'animate-spin': geoStore.isSyncing}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </button>
    </div>
  </header>

  <!-- Compact Info Panel -->
  <transition name="slide-fade">
    <section v-if="isStatsExpanded" class="compact-info-panel">
      <!-- Info Icon (Left) -->
      <div class="info-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>

      <!-- Info Tables Split (Right) -->
      <div class="info-tables-container">
        <!-- Count Stats Table -->
        <div class="info-sub-table">
          <div class="info-row">
            <span class="info-row-label">Fylker:</span>
            <span class="info-row-value">{{ geoStore.fylker.length }}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Kommuner:</span>
            <span class="info-row-value">{{ geoStore.kommuner.length }}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Postnummer:</span>
            <span class="info-row-value">{{ geoStore.postnummer.length }}</span>
          </div>
        </div>

        <!-- Sync Timestamps Table -->
        <div class="info-sub-table">
          <div class="info-row">
            <span class="info-row-label">Data hentet:</span>
            <span class="info-row-value">{{ geoStore.isDemoMode ? 'Demo modus' : (geoStore.lastSynced || 'Aldri') }}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Data oppdatert:</span>
            <span class="info-row-value">{{ geoStore.isDemoMode ? 'Demo modus' : (geoStore.lastUpdatedSource || 'Aldri') }}</span>
          </div>
        </div>
      </div>
    </section>
  </transition>

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
      <li v-if="geoStore.errors.postnummerKategori"><strong>Kategorier:</strong> {{ geoStore.errors.postnummerKategori }}</li>
      <li v-if="geoStore.errors.config"><strong>Konfigurasjon (Config):</strong> {{ geoStore.errors.config }}</li>
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
          class="btn btn-secondary" 
          @click="geoStore.selectFylke(null)"
          :disabled="!geoStore.searchQuery && !geoStore.selectedFylkeId"
          style="padding: 0.5rem 0.75rem;"
        >
          Nullstill
        </button>
      </div>



      <!-- Active Search Results Notification -->
      <div v-if="geoStore.searchQuery && matchedCount === 0" class="empty-state" style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-muted); text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.01);">
        Ingen søketreff for "{{ geoStore.searchQuery }}"
      </div>

      <!-- Navigation Columns -->
      <div class="nav-columns">
        <CountyList />
        <MunicipalityList />
        <PostalCodeList />
      </div>
    </section>

    <!-- Right Column: Detail Inspector -->
    <DetailInspector />
  </main>
</template>

<style scoped>
/* Scoped overrides/adjustments */
</style>
