<template>
  <div class="map-view-container">
    <MapaVisitas 
      :puntos="visitas" 
      @seleccionar="abrirDetalle" 
    />

    <ModalDetalle 
      v-if="modalDetalle" 
      :detalle="detalleSeleccionado" 
      @close="modalDetalle = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js' // Ajusta la ruta
import MapaVisitas from '../components/mapa/MapaVisitas.vue'
import ModalDetalle from '../components/mapa/ModalDetalle.vue'

const visitas = ref([])
const modalDetalle = ref(false)
const detalleSeleccionado = ref({})

async function cargarDatos() {
  const { data } = await supabase
    .from('visitas')
    .select('*')
    .not('latitud', 'is', null)
  
  if (data) visitas.value = data
}

function abrirDetalle(visita) {
  detalleSeleccionado.value = visita
  modalDetalle.value = true
}

onMounted(cargarDatos)
</script>

<style scoped>
.map-view-container { 
  width: 100%; 
  height: 86vh; 
  position: relative; 
}
</style>