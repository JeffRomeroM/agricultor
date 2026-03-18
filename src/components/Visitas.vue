<template>
  <div class="app">
    <h3>Visitas de Campo</h3>

    <div class="filtros">
      <input v-model.lazy="filtroNombre" placeholder="Buscar por productor" class="buscar" />
      <button class="btn-nueva" @click="abrirModal">
        <Icon icon="mdi:plus" />
      </button>
      <input v-model="filtroFecha" type="date" />
      <button @click="limpiarFiltros" class="limpiar">Limpiar</button>
    </div>

    <div v-if="cargando" class="loader-container">
      <div class="loader"></div>
      <span class="loader-text">Cargando visitas...</span>
    </div>

    <div v-else class="cards">
      <div 
        v-for="v in visitas" 
        :key="v.id" 
        class="card" 
        @click="verDetalle(v)"
      >
        <img v-if="v.foto_url" :src="v.foto_url" class="preview-foto" loading="lazy" />
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

    <div class="paginacion" v-if="totalPaginas > 1">
      <button @click="pagina--" :disabled="pagina === 1 || cargando">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button @click="pagina++" :disabled="pagina >= totalPaginas || cargando">Siguiente</button>
    </div>

    <div class="modal" v-if="mostrarModal">
      <div class="modal-content">
        <h2>{{ editando ? 'Editar' : 'Nueva' }} Visita</h2>
        <form @submit.prevent="guardarVisita" class="form-container-responsive">
          <div class="form-inputs">
            <input v-model="visita.productor" placeholder="Nombre del productor" required />
            <input v-model="visita.celular" placeholder="Celular" type="tel" />
            <input v-model="visita.comunidad" placeholder="Comunidad" required />
            <input v-model="visita.cultivo" placeholder="Cultivo" required />
            <input v-model="visita.area" placeholder="Área de cultivo" />
            <textarea v-model="visita.hallazgos" placeholder="Principales Hallazgos"></textarea>
            <textarea v-model="visita.recomendaciones" placeholder="Recomendaciones"></textarea>
            <textarea v-model="visita.observaciones" placeholder="Observaciones"></textarea>
            <input v-model="visita.fecha" type="date" required />
            <select v-model="visita.tecnico" required>
              <option disabled value="">Seleccione técnico</option>
              <option value="Técnico 1">Técnico 1</option>
              <option value="Técnico 2">Técnico 2</option>
              <option value="Técnico 3">Técnico 3</option>
            </select>
            <input type="file" @change="subirFoto" />
          </div>

          <div class="form-mapa-section">
            <div id="mapa"></div>
            <button type="button" @click="obtenerUbicacion" class="btn-ubicacion">
              Usar ubicación actual
            </button>
            <p v-if="visita.latitud && visita.longitud" class="ubicacion-info">
              Ubicación seleccionada: {{ visita.latitud.toFixed(5) }}, {{ visita.longitud.toFixed(5) }}
            </p>

            <div class="btn-group-main">
              <button type="submit" :disabled="subiendoFoto || cargando" class="btn-guardar">
                {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
              </button>
              <button type="button" @click="cerrarModal" class="btn-cancelar">Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="modal pantalla-completa" v-if="modalDetalle">
      <div class="modal-detalle card-detalle">
        <button class="cerrar" @click="cerrarDetalle">✕</button>
        <div class="detalle-imagen">
          <img v-if="detalle.foto_url" :src="detalle.foto_url" alt="Foto visita" />
          <div v-else class="imagen-placeholder" :style="{ background: generarColor(detalle.productor || '') }">
            {{ detalle.productor?.charAt(0).toUpperCase() || '?' }}
          </div>
        </div>
        <h3 class="subtitulo"> {{ detalle.fecha }}</h3>
        <h2 class="titulo-detalle">{{ detalle.productor }}</h2>

        <div class="seccion">
          <h3>📋 Datos generales</h3>
          <div class="grid-datos">
            <span><strong><Icon icon="mdi:account" class="nav-icon" /></strong> {{ detalle.tecnico }}</span>
            <span><strong><Icon icon="mdi:leaf" class="nav-icon" /> Cultivo:</strong> {{ detalle.cultivo }}</span>
            <span><strong><Icon icon="mdi:phone" class="nav-icon" /> Celular:</strong> {{ detalle.celular || 'N/D' }}</span>
            <span><strong><Icon icon="mdi:place" class="nav-icon" /> Comunidad:</strong> {{ detalle.comunidad }}</span>
            <span><strong><Icon icon="mdi:map" class="nav-icon" /> Área:</strong> {{ detalle.area }}</span>
          </div>
        </div>

        <div class="seccion" v-if="detalle.hallazgos">
          <h3><Icon icon="mdi:search" class="nav-icon" /> Hallazgos</h3>
          <ul>
            <li v-for="l in detalle.hallazgos?.split('\n')" :key="l">
              {{ l.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>
        </div>

        <div class="seccion" v-if="detalle.observaciones">
          <h3><Icon icon="mdi:eye" class="nav-icon" /> Observaciones</h3>
          <ul>
            <li v-for="l in detalle.observaciones?.split('\n')" :key="l">
              {{ l.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>
        </div>

        <div class="seccion" v-if="detalle.recomendaciones">
          <h3><Icon icon="mdi:chart-arc" class="nav-icon" /> Recomendaciones</h3>
          <ul>
            <li v-for="l in detalle.recomendaciones?.split('\n')" :key="l">
              {{ l.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>
        </div>

        <a v-if="detalle.latitud" class="link-mapa" :href="`https://www.google.com/maps?q=${detalle.latitud},${detalle.longitud}`" target="_blank">
          <Icon icon="mdi:map-marker" class="nav-icon" /> Ver ubicación en Google Maps
        </a>

        <div class="acciones-detalle">
          <button @click="editar(detalle)"><Icon icon="mdi:edit" class="nav-icon" /> Editar</button>
          <button class="eliminar" @click="confirmarEliminar(detalle.id)"><Icon icon="mdi:delete" class="nav-icon" /> Eliminar</button>
          <button @click="enviarWhatsApp(detalle)"><Icon icon="mdi:whatsapp" class="nav-icon" /> WhatsApp</button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="mostrarModalEliminar">
      <div class="modal-content">
        <h3>¿Seguro que deseas eliminar esta visita?</h3>
        <div class="btn-group">
          <button @click="eliminar(idEliminar)" class="eliminarConf">Sí, eliminar</button>
          <button @click="cerrarModalEliminar" class="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { supabase } from '../supabase.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from '@iconify/vue'

const visitas = ref([])
const cargando = ref(false)
const pagina = ref(1)
const porPagina = 10
const totalPaginas = ref(1)
const filtroNombre = ref('')
const filtroFecha = ref('')
const mostrarModal = ref(false)
const mostrarModalEliminar = ref(false)
const modalDetalle = ref(false)
const editando = ref(false)
const subiendoFoto = ref(false)
const idEliminar = ref(null)
const detalle = ref({})
const map = ref(null)
const marcador = ref(null)

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

// CARGAR DATOS CON PAGINACIÓN DE SERVIDOR
async function cargarVisitas() {
  cargando.value = true
  const desde = (pagina.value - 1) * porPagina
  const hasta = desde + porPagina - 1
  try {
    let query = supabase.from('visitas').select('*', { count: 'exact' })
    if (filtroNombre.value) query = query.ilike('productor', `%${filtroNombre.value}%`)
    if (filtroFecha.value) query = query.eq('fecha', filtroFecha.value)

    const { data, count, error } = await query
      .order('fecha', { ascending: false })
      .range(desde, hasta)

    if (error) throw error
    visitas.value = data
    totalPaginas.value = Math.ceil(count / porPagina)
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false
  }
}

watch([pagina, filtroNombre, filtroFecha], () => {
  if (filtroNombre.value || filtroFecha.value) pagina.value = 1
  cargarVisitas()
})

function initMapa() {
  const container = document.getElementById('mapa')
  if (!container) return
  if (map.value) {
    map.value.remove()
    map.value = null
  }

  const latInit = visita.latitud || 12.1124
  const lngInit = visita.longitud || -84.4562

  map.value = L.map('mapa').setView([latInit, lngInit], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value)

  marcador.value = L.marker([latInit, lngInit], { draggable: true }).addTo(map.value)
  marcador.value.on('dragend', () => {
    const pos = marcador.value.getLatLng()
    visita.latitud = pos.lat
    visita.longitud = pos.lng
  })
}

function abrirModal() {
  Object.assign(visita, {
    id: null,
    productor: '',
    foto_url: '',
    latitud: 12.1124,
    longitud: -84.4562,
    fecha: new Date().toISOString().split('T')[0]
  })
  editando.value = false
  mostrarModal.value = true
  nextTick(() => setTimeout(initMapa, 300))
}

async function editar(v) {
  Object.assign(visita, v)
  editando.value = true
  mostrarModal.value = true
  modalDetalle.value = false
  nextTick(() => setTimeout(initMapa, 300))
}

async function guardarVisita() {
  cargando.value = true
  const { id, ...datos } = visita
  const res = editando.value 
    ? await supabase.from('visitas').update(datos).eq('id', id) 
    : await supabase.from('visitas').insert([datos])
  
  if (!res.error) {
    cerrarModal()
    cargarVisitas()
  }
  cargando.value = false
}

async function eliminar(id) {
  await supabase.from('visitas').delete().eq('id', id)
  cerrarModalEliminar()
  cargarVisitas()
}

function cerrarModal() {
  mostrarModal.value = false
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

function verDetalle(v) {
  detalle.value = v
  modalDetalle.value = true
}

function cerrarDetalle() {
  modalDetalle.value = false
}

function confirmarEliminar(id) {
  idEliminar.value = id
  mostrarModalEliminar.value = true
  modalDetalle.value = false
}

function cerrarModalEliminar() {
  mostrarModalEliminar.value = false
}

function limpiarFiltros() {
  filtroNombre.value = ''
  filtroFecha.value = ''
  pagina.value = 1
}

function generarColor(n) {
  let h = 0
  for (let i = 0; i < (n?.length || 0); i++) h = n.charCodeAt(i) + ((h << 5) - h)
  return `hsl(${h % 360},65%, 55%)`
}

async function subirFoto(e) {
  const file = e.target.files[0]
  if (!file) return
  subiendoFoto.value = true
  const path = `visitas/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from('fotos').upload(path, file)
  if (!error) {
    const { data } = supabase.storage.from('fotos').getPublicUrl(path)
    visita.foto_url = data.publicUrl
  }
  subiendoFoto.value = false
}

function obtenerUbicacion() {
  navigator.geolocation.getCurrentPosition((pos) => {
    visita.latitud = pos.coords.latitude
    visita.longitud = pos.coords.longitude
    if (map.value) {
      map.value.setView([visita.latitud, visita.longitud], 17)
      marcador.value.setLatLng([visita.latitud, visita.longitud])
    }
  })
}


function enviarWhatsApp(v) {
  if (!v.celular) return alert('Número de celular no disponible')
  const mensaje = `📅 Fecha: ${v.fecha}\n👨‍🌾 Productor: ${v.productor}\n🌱 Cultivo: ${v.cultivo}\n🔍 Hallazgos: ${v.hallazgos || 'Ninguno'}\n📋 Observaciones: ${v.observaciones || 'Ninguna'}\n✅ Recomendaciones: ${v.recomendaciones || 'Ninguna'}`
  const url = `https://wa.me/505${v.celular.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}

onMounted(cargarVisitas)
</script>

<style scoped>
.app {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: sans-serif;
}

.app h3 {
  text-align: center;
  margin-bottom: 5px;
  margin-top: -10px;
}

.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.buscar,
input[type="date"] {
  padding: 3px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  max-width: 200px;
  box-sizing: border-box;
}

.btn-nueva {
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0px 5px;
  cursor: pointer;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.limpiar {
  background-color: #2ecc71;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.card {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.preview-foto {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
}

.preview-productor {
  font-weight: bold;
}

.inicial-foto {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 55px;
  font-weight: bold;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
}

.modal-content {
  background: white;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  margin-top: 32vh;
  border-radius: 10px;
}
.nav-icon{
  color:#14a51c;
}
@media (min-width: 1024px) {
  .modal-content {
    max-width: 900px;
    margin-top: 50px;
  }

  .form-container-responsive {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  #mapa {
    height: 400px !important;
  }
}

.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

#mapa {
  height: 250px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.btn-ubicacion {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-guardar {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: 600;
}

.btn-cancelar {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.pantalla-completa {
  background: white;
  overflow-y: auto;
}

.modal-detalle {
  width: 100%;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  position: relative;
  z-index: 2005;
}

.card-detalle {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.detalle-imagen img,
.imagen-placeholder {
  width: 100%;
  height: 220px;
  border-radius: 12px;
  object-fit: cover;
}

.imagen-placeholder {
  background: #2ecc71;
  color: white;
  font-size: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.titulo-detalle {
  margin-top: 15px;
  text-align: center;
}

.subtitulo {
  text-align: end;
  color: #000;
  margin-top: 10px !important;
  margin-left: 50%;
}

.seccion {
  margin-top: 20px;
  background-color: #fafafa;
  border-radius: 10px;
  padding: 10px;
}

.seccion h3 {
  margin-bottom: 8px;
  color: #2ecc71;
}

.grid-datos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  font-size: 0.95em;
}

.link-mapa {
  display: block;
  margin: 15px 0;
  color: #3498db;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.acciones-detalle {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.acciones-detalle button {
  flex: 1;
  margin: 0 4px;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: #2ecc71;
  color: white;
  cursor: pointer;
}

.acciones-detalle .eliminar {
  background: #e74c3c;
}

.eliminarConf{
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
.cancelar {
  background-color: #14a51c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 5px;
}
.cerrar {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 16px;
  z-index: 2100!important;
  pointer-events: auto;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.paginacion button {
  padding: 0.2rem 0.5rem;
  border: none;
  border-radius: 5px;
  background-color: #2ecc71;
  color: white;
  cursor: pointer;
}

.paginacion button:disabled {
  background-color: #53f597;
  cursor: not-allowed;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
}

.loader {
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2ecc71;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: #2ecc71;
  font-weight: bold;
}

@media (max-width: 600px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 20px;
  }
}
</style>