<script setup lang="ts">
import { ref } from 'vue';
import { useGeoDataStore } from '../../stores/geoData';

const geoStore = useGeoDataStore();
const isCollapsed = ref(false);
</script>

<template>
  <div class="nav-col" :class="{ collapsed: isCollapsed }">
    <div class="nav-col-header" @click="isCollapsed = !isCollapsed">
      <span>Fylke</span>
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
        <li v-for="f in geoStore.fylker" :key="f.Fylkesnummer">
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
