<template>
  <div class="app">
    
    <h3><Icon icon="mdi:clipboard-text-search" /> Visitas de Campo</h3>
    

    <div class="filtros">
      <input v-model="filtroNombre" placeholder="Buscar por productor" class="buscar" />
      <button class="btn-nueva" @click="abrirModal">+</button>
      <input v-model="filtroFecha" type="date" />
      <button @click="limpiarFiltros" class="limpiar">Limpiar</button>
    </div>

    <div class="cards">
      <div
    
         v-for="v in visitasPaginadas" :key="v.id"
        class="card"
        @click="verDetalle(v)"
      >
        <img v-if="v.foto_url" :src="v.foto_url" class="preview-foto" />
        <div
          v-else
          class="preview-foto inicial-foto"
          :style="{ backgroundColor: generarColor(v.productor) }"
        >
          {{ v.productor?.charAt(0).toUpperCase() || '?' }}
        </div>

        <p class="preview-productor">{{ v.productor }}</p>
        <p>{{ v.comunidad }}</p>
      </div>
    </div>

    <!-- Modal Agregar/Editar -->
    <div class="modal-formulario" v-if="mostrarModal">
      <div class="form-container">

        <!-- HEADER -->
        <div class="form-header">
          <h2>
            <Icon icon="mdi:file-document-edit-outline" />
            {{ editando ? 'Editar Visita' : 'Nueva Visita' }}
          </h2>
          <button class="cerrar" @click="cerrarModal">
            <Icon icon="mdi:close" />
          </button>
        </div>

        <!-- BODY -->
        <form @submit.prevent="guardarVisita" class="form-body">

          <!-- DATOS -->
          <div class="form-section">
            <h4><Icon icon="mdi:account" /> Datos del productor</h4>

            <div class="input-group">
              <Icon icon="mdi:account-outline" />
              <input v-model="visita.productor" placeholder="Nombre del productor" required />
            </div>

            <div class="input-group">
              <Icon icon="mdi:phone-outline" />
              <input v-model="visita.celular" placeholder="Celular" type="tel" />
            </div>

            <div class="input-group">
              <Icon icon="mdi:map-marker-outline" />
              <input v-model="visita.comunidad" placeholder="Comunidad" required />
            </div>
          </div>

          <!-- CULTIVO -->
          <div class="form-section">
            <h4><Icon icon="mdi:sprout" /> Información del cultivo</h4>

            <div class="input-group">
              <Icon icon="mdi:leaf" />
              <input v-model="visita.cultivo" placeholder="Cultivo" required />
            </div>

            <div class="input-group">
              <Icon icon="mdi:ruler-square" />
              <input v-model="visita.area" placeholder="Área de cultivo" />
            </div>

            <div class="input-group">
              <Icon icon="mdi:calendar" />
              <input v-model="visita.fecha" type="date" required />
            </div>

            <div class="input-group">
              <Icon icon="mdi:account-hard-hat" />
              <select v-model="visita.tecnico" required>
                <option disabled value="">Seleccione técnico</option>
                <option value="Técnico 1">Técnico 1</option>
                <option value="Técnico 2">Técnico 2</option>
                <option value="Técnico 3">Técnico 3</option>
              </select>
            </div>
          </div>

          <!-- TEXTO -->
          <div class="form-section">
            <h4><Icon icon="mdi:clipboard-text" /> Hallazgos</h4>
            <textarea v-model="visita.hallazgos" placeholder="Hallazgos"></textarea>

            <h4><Icon icon="mdi:check-circle" /> Recomendaciones</h4>
            <textarea v-model="visita.recomendaciones" placeholder="Recomendaciones"></textarea>

            <h4><Icon icon="mdi:search" /> Observaciones</h4>
            <textarea v-model="visita.observaciones" placeholder="Observaciones"></textarea>
          </div>

          <!-- FOTO -->
          <div class="form-section">
            <h4><Icon icon="mdi:image" /> Foto</h4>
            <input type="file" @change="subirFoto" />
          </div>

          <!-- MAPA -->
          <div class="form-section">
            <h4><Icon icon="mdi:map" /> Ubicación</h4>

            <div id="mapa"></div>

            <button type="button" @click="obtenerUbicacion" class="btn-ubicacion">
              <Icon icon="mdi:crosshairs-gps" /> Ubicación actual
            </button>

            <p v-if="visita.latitud && visita.longitud" class="ubicacion-info">
              {{ visita.latitud.toFixed(5) }}, {{ visita.longitud.toFixed(5) }}
            </p>
          </div>

          <!-- ACCIONES -->
          <div class="form-actions">
            <button type="submit" :disabled="subiendoFoto" class="btn-guardar">
              <Icon icon="mdi:content-save" />
              {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
            </button>

            <button type="button" @click="cerrarModal" class="btn-cancelar">
              <Icon icon="mdi:close" /> Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- Modal Detalle -->
    <div class="modal pantalla-completa" v-if="modalDetalle">
      <div class="modal-detalle">

        <!-- cerrar -->
        <button class="cerrar" @click="cerrarDetalle">
          <Icon icon="mdi:close" />
        </button>

        <!-- imagen / cover -->
        <div class="cover">
          <img v-if="detalle.foto_url" :src="detalle.foto_url" />

          <div
            v-else
            class="cover inicial-foto"
            :style="{ backgroundColor: generarColor(detalle.productor) }"
          >
            {{ detalle.productor?.charAt(0).toUpperCase() || '?' }}
          </div>

          <div class="overlay">
            <h2>{{ detalle.productor }}</h2>
            <span>{{ detalle.comunidad }}</span>
          </div>
        </div>

        <div class="detalle-info">

          <!-- info rápida -->
          <div class="info-grid">
            <div><Icon icon="mdi:phone" /> {{ detalle.celular || '—' }}</div>
            <div><Icon icon="mdi:leaf" /> {{ detalle.cultivo }}</div>
            <div><Icon icon="mdi:ruler" /> {{ detalle.area }}</div>
            <div><Icon icon="mdi:calendar" /> {{ detalle.fecha }}</div>
            <div><Icon icon="mdi:account-hard-hat" /> {{ detalle.tecnico }}</div>
          </div>

          <!-- bloques -->
          <div class="bloque">
            <h4><Icon icon="mdi:magnify" /> Hallazgos</h4>
            <ul>
              <li v-for="linea in detalle.hallazgos?.split('\n')" :key="linea">
                {{ linea.replace(/^[-•]\s*/, '') }}
              </li>
            </ul>
          </div>

          <div class="bloque">
            <h4><Icon icon="mdi:clipboard-text" /> Observaciones</h4>
            <ul>
              <li v-for="linea in detalle.observaciones?.split('\n')" :key="linea">
                {{ linea.replace(/^[-•]\s*/, '') }}
              </li>
            </ul>
          </div>

          <div class="bloque">
            <h4><Icon icon="mdi:check-circle" /> Recomendaciones</h4>
            <ul>
              <li v-for="linea in detalle.recomendaciones?.split('\n')" :key="linea">
                {{ linea.replace(/^[-•]\s*/, '') }}
              </li>
            </ul>
          </div>

          <!-- ubicación -->
          <a
            class="mapa-link"
            :href="`https://www.google.com/maps?q=${detalle.latitud},${detalle.longitud}`"
            target="_blank"
          >
            <Icon icon="mdi:map-marker" /> Ver ubicación
          </a>

          <!-- acciones -->
          <div class="acciones">
            <button @click="editar(detalle)">
              <Icon icon="mdi:pencil" /> Editar
            </button>

            <button class="eliminar" @click="confirmarEliminar(detalle.id)">
              <Icon icon="mdi:delete" /> Eliminar
            </button>

            <button class="whatsapp" @click="enviarWhatsApp(detalle)">
              <Icon icon="mdi:whatsapp" /> WhatsApp
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Confirmación Eliminar -->
    <div class="modal" v-if="mostrarModalEliminar">
      <div class="modal-content">
        <h3>¿Seguro que deseas eliminar esta visita?</h3>
        <div class="btn-group">
          <button @click="eliminar(idEliminar)" class="eliminarConf">Sí, eliminar</button>
          <button @click="cerrarModalEliminar" class="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
    <div class="paginacion">
      <button @click="pagina--" :disabled="pagina === 1">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button @click="pagina++" :disabled="pagina >= totalPaginas">Siguiente</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from '@iconify/vue'

const visitas = ref([])
const mostrarModal = ref(false)
const mostrarModalEliminar = ref(false)
const modalDetalle = ref(false)
const editando = ref(false)
const subiendoFoto = ref(false)
const idEliminar = ref(null)
const detalle = ref({})
const filtroNombre = ref('')
const filtroFecha = ref('')
const map = ref(null)
const marcador = ref(null)

const pagina = ref(1)
const porPagina = 10

const totalPaginas = computed(() => Math.ceil(visitasFiltradas.value.length / porPagina))

const visitasPaginadas = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  return visitasFiltradas.value.slice(inicio, inicio + porPagina)
})

const tecnicosUnicos = computed(() => {
  const set = new Set(visitas.value.map((v) => v.tecnico))
  return Array.from(set)
})



function generarColor(nombre) {
  // Generar un color basado en el nombre para que sea siempre igual
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`
  return color
}


const visita = reactive({
  id: null,
  productor: '',
  cultivo: '',
  hallazgos: '',
  celular: '',
  area: '',
  comunidad: '',
  observaciones: '',
  recomendaciones: '',
  fecha: '',
  tecnico: '',
  foto_url: '',
  latitud: null,
  longitud: null
})

const visitasFiltradas = computed(() => {
  return visitas.value
    .filter(v => {
      const nombreOk = v.productor.toLowerCase().includes(filtroNombre.value.toLowerCase())
      const fechaOk = !filtroFecha.value || v.fecha === filtroFecha.value
      return nombreOk && fechaOk
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

function limpiarFiltros() {
  filtroNombre.value = ''
  filtroFecha.value = ''
}
function abrirModal() {
  Object.assign(visita, {
    id: null, productor: '', cultivo: '', hallazgos: '', celular: '',
    area: '', comunidad: '', observaciones: '', recomendaciones: '',
    fecha: '', tecnico: '', foto_url: '', latitud: null, longitud: null
  })
  mostrarModal.value = true
  editando.value = false

  // Espera a que el DOM actualice
  nextTick(() => {
    setTimeout(initMapa, 100) // pequeño delay para asegurar que el #mapa exista
  })
}



import { nextTick } from 'vue'

function cerrarModal() {
  mostrarModal.value = false
  if (map.value) {
    map.value.remove()
    map.value = null
    marcador.value = null
  }
}

function verDetalle(v) {
  detalle.value = v
  modalDetalle.value = true
}

function cerrarDetalle() {
  modalDetalle.value = false
}


async function editar(v) {
  Object.assign(visita, v)
  visita.latitud = Number(v.latitud)
  visita.longitud = Number(v.longitud)
  mostrarModal.value = true
  editando.value = true
  modalDetalle.value = false

  await nextTick()
  initMapa()
}



function confirmarEliminar(id) {
  idEliminar.value = id
  mostrarModalEliminar.value = true
  modalDetalle.value = false
}

function cerrarModalEliminar() {
  mostrarModalEliminar.value = false
  idEliminar.value = null
}

async function subirFoto(e) {
  const file = e.target.files[0]
  if (!file) return
  subiendoFoto.value = true
  const fileName = `visitas/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, file)
  if (!uploadError) {
    const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName)
    visita.foto_url = urlData.publicUrl
  }
  subiendoFoto.value = false
}

async function guardarVisita() {
  const datos = { ...visita }
  delete datos.id
  let res
  if (editando.value && visita.id) {
    res = await supabase.from('visitas').update(datos).eq('id', visita.id)
  } else {
    res = await supabase.from('visitas').insert([datos])
  }
  if (!res.error) {
    cerrarModal()
    cargarVisitas()
  }
}

async function eliminar(id) {
  const { data } = await supabase.from('visitas').select('foto_url').eq('id', id).single()
  if (data?.foto_url) {
    const path = data.foto_url.split('/public/')[1]
    if (path) await supabase.storage.from('fotos').remove([path])
  }
  await supabase.from('visitas').delete().eq('id', id)
  cerrarModalEliminar()
  cargarVisitas()
}

function enviarWhatsApp(v) {
  if (!v.celular) return alert('Número de celular no disponible')
  const mensaje = `📅 Fecha: ${v.fecha}\n👨‍🌾 Productor: ${v.productor}\n🌱 Cultivo: ${v.cultivo}\n🔍 Hallazgos: ${v.hallazgos || 'Ninguno'}\n📋 Observaciones: ${v.observaciones || 'Ninguna'}\n✅ Recomendaciones: ${v.recomendaciones || 'Ninguna'}`
  const url = `https://wa.me/505${v.celular.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
} 

async function cargarVisitas() {
  const { data } = await supabase.from('visitas').select('*')
  if (data) visitas.value = data
}


function obtenerUbicacion() {
  if (!navigator.geolocation) {
    alert('Geolocalización no soportada por este navegador.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      visita.latitud = lat
      visita.longitud = lng

      if (map.value) {
        map.value.setView([lat, lng], 17)
        if (marcador.value) {
          marcador.value.setLatLng([lat, lng])
        } else {
          marcador.value = L.marker([lat, lng], { draggable: true }).addTo(map.value)
          marcador.value.on('dragend', () => {
            const pos = marcador.value.getLatLng()
            visita.latitud = pos.lat
            visita.longitud = pos.lng
          })
        }
      }
    },
    (error) => {
      alert('No se pudo obtener la ubicación: ' + error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}


function moverMarcadorAUbicacion() {
  if (!navigator.geolocation) {
    alert('Geolocalización no soportada por el navegador')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      visita.latitud = lat
      visita.longitud = lng

      if (marcador.value) {
        marcador.value.setLatLng([lat, lng])
      }
      if (map.value) {
        map.value.setView([lat, lng], 13)
      }
    },
    (err) => {
      alert('Error al obtener ubicación: ' + err.message)
    }
  )
}

function initMapa() {
  if (map.value) {
    map.value.remove()
    map.value = null
    marcador.value = null
  }

  const latInit = visita.latitud || 12.131
  const lngInit = visita.longitud || -86.2504
  map.value = L.map('mapa').setView([latInit, lngInit], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  marcador.value = L.marker([latInit, lngInit], { draggable: true }).addTo(map.value)

  marcador.value.on('dragend', () => {
    const pos = marcador.value.getLatLng()
    visita.latitud = pos.lat
    visita.longitud = pos.lng
  })

  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    visita.latitud = lat
    visita.longitud = lng
    marcador.value.setLatLng(e.latlng)
  })
}

onMounted(cargarVisitas)
</script>

<style scoped>
/* ===== MAPA ===== */
:deep(#mapa) {
  height: 300px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  z-index: 1;
}

/* ===== LAYOUT ===== */
.app {
  max-width: 950px;
  margin: auto;
  padding: 20px;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
}

h3 {
  text-align: center;
  margin-bottom: 10px;
}

/* ===== FILTROS ===== */
.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.buscar,
input[type="date"] {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  max-width: 200px;
}

/* ===== BOTONES ===== */
.btn-nueva {
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 26px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-nueva:hover { transform: scale(1.05); }

.limpiar {
  background: #2ecc71;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

/* ===== CARDS ===== */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.card {
  border-radius: 12px;
  background: white;
  padding: 8px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: 0.2s;
}
.card:hover { transform: translateY(-3px); }

.preview-foto {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.preview-productor {
  font-weight: bold;
  margin-top: 5px;
}

.inicial-foto {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: white;
  font-size: 45px;
  font-weight: bold;
  border-radius: 8px;
}

/* ===== MODAL GENERAL ===== */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

/* ===== MODAL FORM ===== */
.modal-content {
  background: rgb(255, 255, 255);
  padding: 20px;
  width: 95%;
  max-width: 500px;
  border-radius: 12px;
  margin: auto;

}

/* modal */
.modal-formulario {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

/* contenedor */
.form-container {
  width: 100%;
  max-width: 500px;
  height: 95vh;
  background: white;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* header */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #2ecc71;
  color: white;
}

.form-header h2 {
  display: flex;
  gap: 6px;
  font-size: 1.1rem;
}

.cerrar {
  background: rgba(0,0,0,0.3);
  border: none;
  color: white;
  border-radius: 50%;
  padding: 6px;
}

/* body */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

/* secciones */
.form-section {
  margin-bottom: 20px;
}

.form-section h4 {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

/* inputs */
.input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f6f7;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.input-group input,
.input-group select {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
}

textarea {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  resize: none;
}

/* mapa */
#mapa {
  height: 200px;
  border-radius: 10px;
  margin-bottom: 10px;
}

/* botones */
.btn-ubicacion {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  display: flex;
  gap: 5px;
}

/* acciones */
.form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  display: flex;
  gap: 10px;
  padding-top: 10px;
}

.form-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  gap: 5px;
}

.btn-guardar { background: #2ecc71; }
.btn-cancelar { background: #e74c3c; }

/* responsive */
@media (min-width: 600px) {
  .modal-formulario {
    align-items: center;
  }

  .form-container {
    height: auto;
    max-height: 90vh;
    border-radius: 16px;
  }
}

.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* ===== BOTONES FORM ===== */
.btn-guardar {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cancelar {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
}

.btn-ubicacion {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

/* ===== MODAL DETALLE APP STYLE ===== */
.modal-detalle {
  width: 100%;
  max-width: 500px;
  height: 95vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease;
}

/* animación */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* ===== HEADER ===== */
.cover {
  position: relative;
  height: 180px;
  flex-shrink: 0;
}

.cover img,
.cover.inicial-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

/* botón cerrar SIEMPRE visible */
.cerrar {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  background: #e74c3c;
  border: none;
  color: white;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
}

/* ===== CONTENIDO ===== */
.detalle-info {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  padding-bottom: 80px;
}

/* info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 8px;
  margin-bottom: 15px;
}

.info-grid div {
  background: #f4f6f7;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  gap: 5px;
}

/* listas */
.lista {
  margin-left: 15px;
}

.bloque {
  margin-top: 12px;
}

.bloque h4 {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.bloque li {
  font-size: 0.9rem;
  margin-bottom: 4px;
}

/* mapa */
.mapa-link {
  display: inline-flex;
  gap: 5px;
  margin-top: 10px;
  color: #25d366;
  font-weight: 600;
  text-decoration: none;
}

/* ===== ACCIONES FIJAS ===== */
.acciones {
  position: fixed;
  bottom: 0;
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #eee;
}

.acciones button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  display: flex;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}

/* colores */
.acciones button:first-child { background:#3498db; }
.acciones .eliminar { background:#e74c3c; }
.acciones .whatsapp { background:#25d366; }

/* ===== MODAL ELIMINAR ===== */
.eliminarConf {
  background: #e74c3c;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  border: none;
}
.cancelar {
  background: #3498db;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  border: none;
}

/* ===== PAGINACIÓN ===== */
.paginacion {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.paginacion button {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: #2ecc71;
  color: white;
  cursor: pointer;
}

.paginacion button:disabled {
  background: #8ef0b8;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-detalle {
    height: 100%;
    border-radius: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 600px) {
  .modal {
    align-items: center;
  }

  .modal-detalle {
    border-radius: 16px;
    height: auto;
    max-height: 90vh;
  }
}
</style>