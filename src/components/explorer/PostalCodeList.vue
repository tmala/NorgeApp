<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGeoDataStore } from '../../stores/geoData';

const geoStore = useGeoDataStore();
const isCollapsed = ref(false);

const displayedPostnummer = computed(() => {
  const query = geoStore.searchQuery.trim().toLowerCase();
  if (query) {
    const matched = geoStore.searchResults?.postnummer || [];
    if (geoStore.selectedKommuneId) {
      return matched.filter(p => p.Kommunenummer === geoStore.selectedKommuneId);
    }
    if (geoStore.selectedFylkeId) {
      const munis = geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId).map(k => k.Kommunenummer);
      return matched.filter(p => munis.includes(p.Kommunenummer));
    }
    return matched;
  }

  if (geoStore.selectedKommuneId) {
    return geoStore.postnummer.filter(p => p.Kommunenummer === geoStore.selectedKommuneId);
  }
  if (geoStore.selectedFylkeId) {
    const munis = geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId).map(k => k.Kommunenummer);
    return geoStore.postnummer.filter(p => munis.includes(p.Kommunenummer));
  }
  // Show a subset to avoid rendering performance issues with thousands of items
  return geoStore.postnummer.slice(0, 100);
});

const selectedPost = computed(() => {
  return geoStore.postnummer.find(p => p.Postnummer === geoStore.selectedPostnummerId) || null;
});
</script>

<template>
  <div class="nav-col" :class="{ collapsed: isCollapsed }">
    <div class="nav-col-header" @click="isCollapsed = !isCollapsed">
      <span style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
        <span>Poststed</span>
        <span v-if="geoStore.searchQuery" style="text-transform: none; color: var(--color-text-secondary); font-size: 0.75rem; font-weight: 500; background: rgba(255, 255, 255, 0.06); padding: 0.05rem 0.3rem; border-radius: 4px;">
          {{ displayedPostnummer.length }}
        </span>
        <span v-if="selectedPost" style="text-transform: none; color: var(--color-warning); font-weight: 600; font-size: 0.82rem;">
          : {{ selectedPost.Postnummer }} {{ selectedPost.Poststed }}
        </span>
        <span v-else-if="geoStore.selectedKommuneId && !isCollapsed" style="text-transform: none; color: var(--color-text-muted); font-size: 0.8rem;">
          ({{ displayedPostnummer.length }})
        </span>
      </span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="16" 
        height="16" 
        fill="currentColor"
        class="chevron-icon"
        :style="{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }"
      >
        <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
      </svg>
    </div>
    
    <transition name="slide-fade">
      <ul v-if="!isCollapsed" class="nav-list">
        <li v-if="!geoStore.selectedKommuneId && !geoStore.selectedFylkeId && !geoStore.searchQuery" class="empty-state" style="padding: 1.5rem; font-size: 0.8rem; height: 100%; text-align: center; color: var(--color-text-muted);">
          Velg et fylke eller en kommune for å se poststeder.
        </li>
        <li v-else-if="displayedPostnummer.length === 0" class="empty-state" style="padding: 1rem; font-size: 0.8rem; color: var(--color-text-muted); text-align: center;">
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
    </transition>
  </div>
</template>
