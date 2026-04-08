<template>
  <div class="modal pantalla-completa">
    <div class="modal-detalle card-detalle">
      <button class="cerrar" @click="$emit('close')">✕</button>
      
      <div class="detalle-imagen">
        <img v-if="detalle.foto_url" :src="detalle.foto_url" alt="Foto visita" />
        <div v-else class="imagen-placeholder" :style="{ background: generarColor(detalle.productor) }">
          {{ detalle.productor?.charAt(0).toUpperCase() || '?' }}
        </div>
      </div>

      <h3 class="subtitulo">{{ detalle.fecha }}</h3>
      <h2 class="titulo-detalle">{{ detalle.productor }}</h2>

      <div class="seccion">
        <h3>Datos generales</h3>
        <div class="grid-datos">
          <span><strong><Icon icon="mdi:account" /> Técnico:</strong> {{ detalle.tecnico }}</span>
          <span><strong><Icon icon="mdi:plant" /> Cultivo:</strong> {{ detalle.cultivo }}</span>
          <span><strong><Icon icon="mdi:phone" /> Celular:</strong> {{ detalle.celular || 'N/D' }}</span>
          <span><strong><Icon icon="mdi:city" /> Comunidad:</strong> {{ detalle.comunidad }}</span>
          <span><strong><Icon icon="mdi:map-marker" /> Área:</strong> {{ detalle.area }}</span>
        </div>
      </div>

      <div class="seccion" v-if="detalle.hallazgos">
        <h3><Icon icon="mdi:magnify" /> Hallazgos</h3>
        <ul>
          <li v-for="l in detalle.hallazgos?.split('\n')" :key="l">{{ l }}</li>
        </ul>
      </div>

      <div class="seccion" v-if="detalle.recomendaciones">
        <h3><Icon icon="mdi:check-circle" /> Recomendaciones</h3>
        <ul>
          <li v-for="l in detalle.recomendaciones?.split('\n')" :key="l">{{ l }}</li>
        </ul>
      </div>

      <div class="acciones-detalle">
        <button @click="enviarWhatsApp">
          <Icon icon="mdi:whatsapp" /> WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  detalle: Object
})

const emit = defineEmits(['close'])

function generarColor(nombre) {
  let hash = 0
  for (let i = 0; i < (nombre?.length || 0); i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, 65%, 55%)`
}

function enviarWhatsApp() {
  const v = props.detalle
  if (!v.celular) return alert('Sin número')
  const msg = `📅 Fecha: ${v.fecha}\n👨‍🌾 Productor: ${v.productor}\n🌱 Cultivo: ${v.cultivo}`
  window.open(`https://wa.me/505${v.celular.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
}
</script>

<style scoped>
/* Copia aquí los estilos del modal (.pantalla-completa, .seccion, .grid-datos, etc.) */
</style>