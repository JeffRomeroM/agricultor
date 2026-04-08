<template>
  <div id="mapa-visitas" class="mapa-full"></div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  puntos: Array
})

const emit = defineEmits(['seleccionar'])

let map = null

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function initMapa() {
  map = L.map('mapa-visitas').setView([12.1124, -84.4562], 9)
  
  const callejero = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

  L.control.layers({ "Mapa": callejero, "Satélite": satelite }).addTo(map);
}

function dibujarMarcadores() {
  if (!map) return
  // Limpiar marcadores existentes si es necesario
  props.puntos.forEach(v => {
    const marker = L.marker([v.latitud, v.longitud], { icon: greenIcon }).addTo(map)
    marker.bindTooltip(v.productor, { permanent: true, direction: 'top', className: 'tooltip-productor' })
    marker.on('click', () => emit('seleccionar', v))
  })
}

onMounted(() => {
  initMapa()
  dibujarMarcadores()
})

// Por si los puntos tardan en cargar de Supabase
watch(() => props.puntos, () => dibujarMarcadores(), { deep: true })
</script>

<style>
.mapa-full { width: 100%; height: 100%; border-radius: 12px; }
.tooltip-productor {
  background: #27ae60;
  color: white;
  border: 1px solid #1e8449;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>