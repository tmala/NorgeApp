<script setup lang="ts">
import { computed } from 'vue';
import { useGeoDataStore } from '../../stores/geoData';

const geoStore = useGeoDataStore();

// Computed states for the inspection view
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

// List of postal codes in currently selected municipality
const displayedPostnummerForMuni = computed(() => {
  if (geoStore.selectedKommuneId) {
    return geoStore.postnummer.filter(p => p.Kommunenummer === geoStore.selectedKommuneId);
  }
  return [];
});

// List of municipalities in currently selected county
const displayedKommunerForCounty = computed(() => {
  if (geoStore.selectedFylkeId) {
    return geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId);
  }
  return [];
});
</script>

<template>
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

      <div v-if="currentPostcode.Kategori" class="meta-grid" style="margin-top: 1rem;">
        <div class="meta-item" style="grid-column: span 2;">
          <div class="meta-label">Kategori</div>
          <div class="meta-value" style="font-size: 1rem; font-weight: 550; color: var(--color-text-secondary); display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge" style="background: rgba(255, 255, 255, 0.08); color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
              {{ currentPostcode.Kategori }}
            </span>
            <span>
              {{ geoStore.postnummerKategorier[currentPostcode.Kategori] || 'Ukjent kategori' }}
            </span>
          </div>
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
          :href="`https://www.erikbolstad.no/postnummer-koordinatar/?postnummer=${currentPostcode.Postnummer}`" 
          target="_blank" 
          class="btn btn-secondary"
          style="flex: 1; text-align: center; text-decoration: none;"
        >
          Erik Bolstad database
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
          Poststeder i kommune ({{ displayedPostnummerForMuni.length }})
        </h4>
        <div style="max-height: 480px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.5rem; background: rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.4rem;">
            <button 
              v-for="p in displayedPostnummerForMuni" 
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
          <div class="meta-value">{{ displayedKommunerForCounty.length }}</div>
        </div>
      </div>

      <div style="margin-top: 1.5rem;">
        <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.5rem;">
          Kommuner i fylke ({{ displayedKommunerForCounty.length }})
        </h4>
        <div style="max-height: 520px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.5rem; background: rgba(0,0,0,0.1);">
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <button 
              v-for="k in displayedKommunerForCounty" 
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

    <!-- 4. Default Empty State (nothing selected) -->
    <div v-else class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; height: 100%; border: none; padding: 3rem 1.5rem; text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor" style="color: var(--color-text-muted); opacity: 0.5;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <div style="font-weight: 550; font-size: 1.05rem; color: var(--color-text-secondary);">Ingen detaljer valgt</div>
      <p style="font-size: 0.85rem; color: var(--color-text-muted); max-width: 260px; line-height: 1.4;">
        Velg et fylke, en kommune eller et postnummer i navigatøren for å se detaljert informasjon og lenker.
      </p>
    </div>
  </section>
</template>
