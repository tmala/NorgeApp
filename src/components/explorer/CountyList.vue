<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGeoDataStore } from '../../stores/geoData';

const geoStore = useGeoDataStore();
const isCollapsed = ref(false);

const displayedFylker = computed(() => {
  const query = geoStore.searchQuery.trim().toLowerCase();
  if (!query) return geoStore.fylker;
  return geoStore.fylker.filter(f => 
    f.Fylkesnummer.includes(query) || f.Fylkesnavn.toLowerCase().includes(query)
  );
});

const selectedCounty = computed(() => {
  return geoStore.fylker.find(f => f.Fylkesnummer === geoStore.selectedFylkeId) || null;
});
</script>

<template>
  <div class="nav-col" :class="{ collapsed: isCollapsed }">
    <div class="nav-col-header" @click="isCollapsed = !isCollapsed">
      <span style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
        <span>Fylke</span>
        <span v-if="geoStore.searchQuery" style="text-transform: none; color: var(--color-text-secondary); font-size: 0.75rem; font-weight: 500; background: rgba(255, 255, 255, 0.06); padding: 0.05rem 0.3rem; border-radius: 4px;">
          {{ displayedFylker.length }}
        </span>
        <span v-if="selectedCounty" style="text-transform: none; color: var(--color-success); font-weight: 600; font-size: 0.82rem;">
          : {{ selectedCounty.Fylkesnavn }} ({{ selectedCounty.Fylkesnummer }})
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
        <li v-if="displayedFylker.length === 0" class="empty-state" style="padding: 1rem; font-size: 0.8rem; color: var(--color-text-muted); text-align: center;">
          Ingen fylker funnet
        </li>
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
    </transition>
  </div>
</template>
