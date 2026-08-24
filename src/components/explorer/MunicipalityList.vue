<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGeoDataStore } from '../../stores/geoData';

const geoStore = useGeoDataStore();
const isCollapsed = ref(false);

const displayedKommuner = computed(() => {
  const query = geoStore.searchQuery.trim().toLowerCase();
  if (query) {
    const matched = geoStore.searchResults?.kommuner || [];
    if (geoStore.selectedFylkeId) {
      const selectedCounty = geoStore.fylker.find(f => f.Fylkesnummer === geoStore.selectedFylkeId);
      const countyMatchesQuery = selectedCounty && (
        selectedCounty.Fylkesnummer.includes(query) ||
        selectedCounty.Fylkesnavn.toLowerCase().includes(query)
      );
      if (countyMatchesQuery) {
        return geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId);
      } else {
        return matched.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId);
      }
    }
    return matched;
  }

  if (geoStore.selectedFylkeId) {
    return geoStore.kommuner.filter(k => k.Fylkesnummer === geoStore.selectedFylkeId);
  }
  return geoStore.kommuner;
});

const selectedMuni = computed(() => {
  return geoStore.kommuner.find(k => k.Kommunenummer === geoStore.selectedKommuneId) || null;
});
</script>

<template>
  <div class="nav-col" :class="{ collapsed: isCollapsed }">
    <div class="nav-col-header" @click="isCollapsed = !isCollapsed">
      <span style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
        <span>Kommune</span>
        <span v-if="geoStore.searchQuery" style="text-transform: none; color: var(--color-text-secondary); font-size: 0.75rem; font-weight: 500; background: rgba(255, 255, 255, 0.06); padding: 0.05rem 0.3rem; border-radius: 4px;">
          {{ displayedKommuner.length }}
        </span>
        <span v-if="selectedMuni" style="text-transform: none; color: var(--color-primary); font-weight: 600; font-size: 0.82rem;">
          : {{ selectedMuni.Kommunenavn }} ({{ selectedMuni.Kommunenummer }})
        </span>
        <span v-else-if="geoStore.selectedFylkeId && !isCollapsed" style="text-transform: none; color: var(--color-text-muted); font-size: 0.8rem;">
          ({{ displayedKommuner.length }})
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
        <li v-if="displayedKommuner.length === 0" class="empty-state" style="padding: 1rem; font-size: 0.8rem; color: var(--color-text-muted); text-align: center;">
          Ingen kommuner funnet
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
    </transition>
  </div>
</template>
