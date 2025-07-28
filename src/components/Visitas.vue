<template>
  <div class="app">
    <div class="info">
      <img src="/logo.png" alt="" class="logo" />
      <h1>El agricultor</h1>
      

    </div>
    <h3>Visitas de Campo</h3>
    
    <Dashboard :visible="mostrarDashboard" @cerrar="mostrarDashboard = false" />

    <div class="filtros">
      <input v-model="filtroNombre" placeholder="Buscar por productor" class="buscar" />
      <button class="btn-nueva" @click="abrirModal">+</button>
      <input v-model="filtroFecha" type="date" />
      <button @click="limpiarFiltros" class="limpiar">Limpiar</button>
    </div>

    <div v-if="cargando" class="loader-container">
      <div class="loader"></div>
      <span class="loader-text">Cargando visitas...</span>
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
    <div class="modal" v-if="mostrarModal">
      <div class="modal-content">
        <h2>{{ editando ? 'Editar' : 'Nueva' }} Visita</h2>
        <form @submit.prevent="guardarVisita">
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

          <!-- Mapa -->
          <div id="mapa"></div>
          <button type="button" @click="obtenerUbicacion" class="btn-ubicacion">
            Usar ubicación actual
          </button>
          <p v-if="visita.latitud && visita.longitud" class="ubicacion-info">
            Ubicación seleccionada: {{ visita.latitud.toFixed(5) }}, {{ visita.longitud.toFixed(5) }}
          </p>
          


          <button type="submit" :disabled="subiendoFoto" class="btn-guardar">
            {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
          </button>
          <button type="button" @click="cerrarModal" class="btn-cancelar">Cancelar</button>
        </form>
      </div>
    </div>

    <!-- Modal Detalle -->
    <div class="modal pantalla-completa" v-if="modalDetalle">
      <div class="modal-detalle">
        <button class="cerrar" @click="cerrarDetalle">X</button>
        <img v-if="detalle.foto_url" :src="detalle.foto_url" class="detalle-foto" />
        <div class="detalle-info">
          <p><strong>Productor:</strong> {{ detalle.productor }}</p>
          <p><strong>Celular:</strong> {{ detalle.celular }}</p>
          <p><strong>Cultivo:</strong> {{ detalle.cultivo }}</p>
          <p><strong>Área:</strong> {{ detalle.area }}</p>
          <p><strong>Comunidad:</strong> {{ detalle.comunidad }}</p>
          <p><strong>Fecha:</strong> {{ detalle.fecha }}</p>
          <p><strong>Técnico:</strong> {{ detalle.tecnico }}</p>

          <p><strong>Hallazgos:</strong></p>
          <ul>
            <li class="lista" v-for="linea in detalle.hallazgos?.split('\n')" :key="linea">
              {{ linea.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>
          <p><strong>Observaciones:</strong></p>
          <ul>
            <li class="lista" v-for="linea in detalle.observaciones?.split('\n')" :key="linea">
              {{ linea.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>
          <p><strong>Recomendaciones:</strong></p>
          <ul>
            <li class="lista" v-for="linea in detalle.recomendaciones?.split('\n')" :key="linea">
              {{ linea.replace(/^[-•]\s*/, '') }}
            </li>
          </ul>

          <!-- <p v-if="detalle.latitud && detalle.longitud">
            <strong>Ubicación:</strong>
            <a :href="`https://www.google.com/maps?q=${detalle.latitud},${detalle.longitud}`" target="_blank" rel="noopener noreferrer">
              Ver en Google Maps
            </a>
          </p> -->
          <p v-if="Number.isFinite(visita.latitud) && Number.isFinite(visita.longitud)" class="ubicacion-info">
            Ubicación seleccionada: {{ visita.latitud.toFixed(5) }}, {{ visita.longitud.toFixed(5) }}
          </p>
          <a :href="`https://www.google.com/maps?q=${detalle.latitud},${detalle.longitud}`" target="_blank" rel="noopener noreferrer">
              Ver en Google Maps
          </a>





          <div class="acciones">
            <button @click="editar(detalle)">Editar</button>
            <button class="eliminar" @click="confirmarEliminar(detalle.id)">Eliminar</button>
            <button @click="enviarWhatsApp(detalle)">Enviar WhatsApp</button>
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
import Dashboard from './Dashboard.vue'
const mostrarDashboard = ref(false)

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


const cargando = ref(false)

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

// async function guardarVisita() {
//   const datos = { ...visita }
//   delete datos.id
//   let res
//   if (editando.value && visita.id) {
//     res = await supabase.from('visitas').update(datos).eq('id', visita.id)
//   } else {
//     res = await supabase.from('visitas').insert([datos])
//   }
//   if (!res.error) {
//     cerrarModal()
//     cargarVisitas()
//   }
// }

// async function eliminar(id) {
//   const { data } = await supabase.from('visitas').select('foto_url').eq('id', id).single()
//   if (data?.foto_url) {
//     const path = data.foto_url.split('/public/')[1]
//     if (path) await supabase.storage.from('fotos').remove([path])
//   }
//   await supabase.from('visitas').delete().eq('id', id)
//   cerrarModalEliminar()
//   cargarVisitas()
// }

function enviarWhatsApp(v) {
  if (!v.celular) return alert('Número de celular no disponible')
  const mensaje = `📅 Fecha: ${v.fecha}\n👨‍🌾 Productor: ${v.productor}\n🌱 Cultivo: ${v.cultivo}\n🔍 Hallazgos: ${v.hallazgos || 'Ninguno'}\n📋 Observaciones: ${v.observaciones || 'Ninguna'}\n✅ Recomendaciones: ${v.recomendaciones || 'Ninguna'}`
  const url = `https://wa.me/505${v.celular.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
} 

// async function cargarVisitas() {
//   const { data } = await supabase.from('visitas').select('*')
//   if (data) visitas.value = data
// }
// ...existing code...
async function cargarVisitas() {
  cargando.value = true
  const { data } = await supabase.from('visitas').select('*')
  if (data) visitas.value = data
  cargando.value = false
}

async function guardarVisita() {
  cargando.value = true
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
    await cargarVisitas()
  }
  cargando.value = false
}

async function eliminar(id) {
  cargando.value = true
  const { data } = await supabase.from('visitas').select('foto_url').eq('id', id).single()
  if (data?.foto_url) {
    const path = data.foto_url.split('/public/')[1]
    if (path) await supabase.storage.from('fotos').remove([path])
  }
  await supabase.from('visitas').delete().eq('id', id)
  cerrarModalEliminar()
  await cargarVisitas()
  cargando.value = false
}
// ...existing code...

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
:deep(#mapa) {
  height: 300px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  z-index: 1;
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
  to { transform: rotate(360deg); }
}

.loader-text {
  color: #2ecc71;
  font-weight: bold;
  font-size: 16px;
}


.app {
  max-width: 900px;
  margin: auto;
  padding: 20px;
  font-family: sans-serif;
}
.info {
  display: flex;
  text-align: right;
  margin-bottom: 20px;
}
.logo {
  width: 40px;
  display: block;
  margin-right: 20px;
  border-radius: 5px;
}
.app h3 {
  text-align: center;
  margin-bottom: 5px;
  margin-top: -10px;
}
.lista{
  margin-top: 10px;
  margin-left: 20px;
}
.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.buscar, input[type="date"] {
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
}
.limpiar {
  background-color: #2ecc71;
  border: none;
  padding: 10px 5px;
  border-radius: 5px;
  color: white;
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
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
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
  background-color: #2ecc71;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 55px;
  box-sizing: border-box;
  font-weight: bold;
}

.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  scroll-behavior: smooth;
}
.modal-content {
  background: white;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  height: auto;
  margin-top: 32vh;
  border-radius: 10px;
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
}
.btn-guardar {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  margin-left: 3px;
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
}
.detalle-foto {
  width: 100%;
  border-radius: 6px;
  margin-bottom: 10px;
  object-fit: cover;
}
.detalle-info p {
  text-align: left;
  padding: 4px;
}
.acciones button {
  margin: 5px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: #2ecc71;
  color: white;
  cursor: pointer;
}
.acciones .eliminar {
  background: #e74c3c;
}
.eliminarConf {
  background: #e74c3c;
  color: white;
  border-radius: 5px;
  padding: 6px 12px;
  margin-right: 10px;
  border: none;
  cursor: pointer;
}
.cancelar {
  background: #3498db;
  color: white;
  border-radius: 5px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
}
.cerrar {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 16px;
}
.ubicacion-info {
  margin: 10px 0 15px 0;
  font-weight: 600;
  font-size: 0.9em;
  color: #555;
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
  font-size: 0.9em;
  
}
.paginacion button:disabled {
  background-color: #53f597;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .card {
    width: 95%;
    margin: auto;
  }
  .cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 20px;
  }
  .buscar {
    height: 35px;
  }
  .btn-nueva {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 0px 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 15px;
    font-size: 30px;
  }
}
</style>
