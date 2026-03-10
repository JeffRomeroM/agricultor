<template>
  <div class="map-container">
    <div id="mapa-visitas" class="mapa-full"></div>

    <div class="modal pantalla-completa" v-if="modalDetalle">
      <div class="modal-detalle card-detalle">
        <button class="cerrar" @click="modalDetalle = false">✕</button>
        
        <div class="detalle-imagen">
          <img v-if="detalle.foto_url" :src="detalle.foto_url" alt="Foto visita" />
          <div v-else class="imagen-placeholder" :style="{ background: generarColor(detalle.productor || '') }">
            {{ detalle.productor?.charAt(0).toUpperCase() || '?' }}
          </div>
        </div>

        <h3 class="subtitulo">{{ detalle.fecha }}</h3>
        <h2 class="titulo-detalle">{{ detalle.productor }}</h2>

        <div class="seccion">
          <h3>Datos generales</h3>
          <div class="grid-datos">
            <span><strong><Icon icon="mdi:account" class="nav-icon" /> Técnico:</strong> {{ detalle.tecnico }}</span>
            <span><strong><Icon icon="mdi:plant" class="nav-icon" /> Cultivo:</strong> {{ detalle.cultivo }}</span>
            <span><strong><Icon icon="mdi:phone" class="nav-icon" /> Celular:</strong> {{ detalle.celular || 'N/D' }}</span>
            <span><strong><Icon icon="mdi:city" class="nav-icon" /> Comunidad:</strong> {{ detalle.comunidad }}</span>
            <span><strong><Icon icon="mdi:map-marker" class="nav-icon" /> Área:</strong> {{ detalle.area }}</span>
          </div>
        </div>

        <div class="seccion" v-if="detalle.hallazgos">
          <h3><Icon icon="mdi:magnify" class="nav-icon" /> Hallazgos</h3>
          <ul>
            <li v-for="l in detalle.hallazgos?.split('\n')" :key="l">{{ l }}</li>
          </ul>
        </div>

        <div class="seccion" v-if="detalle.recomendaciones">
          <h3><Icon icon="mdi:check-circle" class="nav-icon" /> Recomendaciones</h3>
          <ul>
            <li v-for="l in detalle.recomendaciones?.split('\n')" :key="l">{{ l }}</li>
          </ul>
        </div>

        <div class="acciones-detalle">
          <button @click="enviarWhatsApp(detalle)">
            <Icon icon="mdi:whatsapp" class="nav-icon" /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from '@iconify/vue'

const visitas = ref([])
const map = ref(null)
const modalDetalle = ref(false)
const detalle = ref({})

// Icono Verde personalizado
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

async function cargarPuntos() {
  const { data } = await supabase
    .from('visitas')
    .select('*')
    .not('latitud', 'is', null)

  if (data) {
    visitas.value = data
    dibujarMarcadores()
  }
}

function initMapa() {
  const latNG = 12.1124
  const lngNG = -84.4562
  
  // Nivel de zoom 9 para ver más área (menos zoom)
  map.value = L.map('mapa-visitas').setView([latNG, lngNG], 9)

  // Capas base
  const callejero = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  });

  const satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
  });

  // Añadir callejero por defecto
  callejero.addTo(map.value);

  // Control de capas
  const baseMaps = {
    "Mapa": callejero,
    "Satélite": satelite
  };

  L.control.layers(baseMaps).addTo(map.value);
}

function dibujarMarcadores() {
  visitas.value.forEach(v => {
    const marker = L.marker([v.latitud, v.longitud], { icon: greenIcon }).addTo(map.value)
    
    marker.bindTooltip(v.productor, {
      permanent: true,
      direction: 'top',
      className: 'tooltip-productor'
    })

    marker.on('click', () => {
      detalle.value = v
      modalDetalle.value = true
    })
  })
}

function generarColor(nombre) {
  let hash = 0
  for (let i = 0; i < (nombre?.length || 0); i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, 65%, 55%)`
}

function enviarWhatsApp(v) {
  if (!v.celular) return alert('Sin número')
  const msg = `📅 Fecha: ${v.fecha}\n👨‍🌾 Productor: ${v.productor}\n🌱 Cultivo: ${v.cultivo}`
  window.open(`https://wa.me/505${v.celular.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
}

onMounted(() => {
  initMapa()
  cargarPuntos()
})
</script>

<style scoped>
.map-container { width: 100%; height: 86vh; position: relative; }
.mapa-full { width: 100%; height: 100%; border-radius: 12px; }

:deep(.tooltip-productor) {
  background: #27ae60;
  color: white;
  border: 1px solid #1e8449;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

/* MODAL FULL SCREEN STYLE */
.pantalla-completa {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: white;
  z-index: 3000;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.modal-detalle {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  position: relative;
}

.card-detalle {
  background: #fff;
  border-radius: 14px;
}

.detalle-imagen img, .imagen-placeholder {
  width: 100%;
  height: 220px;
  border-radius: 12px;
  object-fit: cover;
}

.imagen-placeholder {
  color: white;
  font-size: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.titulo-detalle { margin-top: 15px; text-align: center; color: #2c3e50; }
.subtitulo { text-align: end; font-size: 0.9em; color: #7f8c8d; }

.seccion {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}

.seccion h3 { 
  margin-bottom: 10px; 
  color: #2ecc71; 
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-datos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.acciones-detalle { margin-top: 30px; }
.acciones-detalle button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #2ecc71;
  color: white;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.cerrar {
  position: absolute;
  top: 15px; right: 15px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  z-index: 10;
  cursor: pointer;
  font-weight: bold;
}

.nav-icon { font-size: 1.2em; }

@media (max-width: 600px) {
  .grid-datos { grid-template-columns: 1fr; }
}
</style>