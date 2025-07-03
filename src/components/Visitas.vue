<template>
  <div class="app">
    <h1>Visitas de Campo <strong>El Agricultor</strong></h1>

    <div class="filtros">
      <input v-model="filtroNombre" placeholder="Buscar por productor" class="buscar" />
      <input v-model="filtroFecha" type="date" />
      <button @click="limpiarFiltros" >Limpiar</button>
    </div>

    <button class="btn-nueva" @click="abrirModal">Nueva Visita</button>

    <div class="cards">
      <div
        v-for="v in visitasFiltradas"
        :key="v.id"
        class="card"
        @click="toggleExpand(v.id)"
      >
        <img v-if="v.foto_url" :src="v.foto_url" class="foto" />
        <p><strong>Productor:</strong> {{ v.productor }}</p>

        <template v-if="expandida === v.id">
          <p><strong>Celular:</strong> {{ v.celular }}</p>
          <p><strong>Cultivo:</strong> {{ v.cultivo }}</p>
          <p><strong>Área:</strong> {{ v.area }}</p>
          <p><strong>Hallazgos:</strong> {{ v.hallazgos }}</p>
          <p><strong>Comunidad:</strong> {{ v.comunidad }}</p>
          <p><strong>Fecha:</strong> {{ v.fecha }}</p>
          <p><strong>Técnico:</strong> {{ v.tecnico }}</p>
          <p><strong>Observaciones:</strong> {{ v.observaciones }}</p>
          <p><strong>Recomendaciones:</strong> {{ v.recomendaciones }}</p>
          <button @click.stop="editar(v)">Editar</button>
          <button @click.stop="confirmarEliminar(v.id)" class="eliminar">Eliminar</button>
          <button @click="enviarWhatsApp(v)">Enviar WhatsApp</button>

        </template>
      </div>
    </div>

    <div class="modal" v-if="mostrarModal">
      <div class="modal-content">
        <h2>{{ editando ? 'Editar' : 'Nueva' }} Visita</h2>
        <form @submit.prevent="guardarVisita">
          <input v-model="visita.productor" placeholder="Nombre del productor" required />
          <input v-model="visita.celular" placeholder="Celular" type="tel" />
          <input v-model="visita.cultivo" placeholder="Cultivo" required />
          <input v-model="visita.area" placeholder="Área" required />
          <input v-model="visita.hallazgos" placeholder="Hallazgos" />
          <input v-model="visita.comunidad" placeholder="Comunidad" required />
          <textarea v-model="visita.observaciones" placeholder="Observaciones"></textarea>
          <textarea v-model="visita.recomendaciones" placeholder="Recomendaciones"></textarea>
          <input v-model="visita.fecha" type="date" required />
          <select v-model="visita.tecnico" required>
            <option disabled value="">Seleccione técnico</option>
            <option value="Técnico 1">Técnico 1</option>
            <option value="Técnico 2">Técnico 2</option>
            <option value="Técnico 3">Técnico 3</option>
          </select>
          <input type="file" @change="subirFoto" />
          <button type="submit" :disabled="subiendoFoto">
            {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
          </button>
          <button type="button" @click="cerrarModal">Cancelar</button>
        </form>
      </div>
    </div>

    <div class="modal" v-if="mostrarModalEliminar">
      <div class="modal-content">
        <h3>¿Seguro que quieres eliminar esta visita?</h3>
        <div class="btn-group">
          <button @click="eliminar(idEliminar)" class="eliminar">Sí, eliminar</button>
          <button @click="cerrarModalEliminar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'

const visitas = ref([])
const mostrarModal = ref(false)
const mostrarModalEliminar = ref(false)
const editando = ref(false)
const subiendoFoto = ref(false)
const idEliminar = ref(null)
const expandida = ref(null)
const filtroNombre = ref('')
const filtroFecha = ref('')

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
  foto_url: ''
})

const visitasFiltradas = computed(() => {
  return visitas.value.filter(v => {
    const nombreOk = v.productor.toLowerCase().includes(filtroNombre.value.toLowerCase())
    const fechaOk = !filtroFecha.value || v.fecha === filtroFecha.value
    return nombreOk && fechaOk
  })
})

function toggleExpand(id) {
  expandida.value = expandida.value === id ? null : id
}

function limpiarFiltros() {
  filtroNombre.value = ''
  filtroFecha.value = ''
}

async function cargarVisitas() {
  const { data, error } = await supabase
    .from('visitas')
    .select('*')
    .order('fecha', { ascending: false })

  if (!error) visitas.value = data || []
}

function abrirModal() {
  Object.assign(visita, {
    id: null, productor: '', cultivo: '', hallazgos: '', celular: '',
    area: '', comunidad: '', observaciones: '', recomendaciones: '',
    fecha: '', tecnico: '', foto_url: ''
  })
  mostrarModal.value = true
  editando.value = false
}

function cerrarModal() {
  mostrarModal.value = false
}

function editar(v) {
  Object.assign(visita, v)
  mostrarModal.value = true
  editando.value = true
}

async function subirFoto(e) {
  const file = e.target.files[0]
  if (!file) return
  subiendoFoto.value = true
  const fileName = `visitas/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, file, { upsert: false })
  if (uploadError) return subiendoFoto.value = false

  const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(fileName)
  visita.foto_url = urlData?.publicUrl || ''
  subiendoFoto.value = false
}

async function guardarVisita() {
  const datos = { ...visita }
  delete datos.id

  let resultado
  if (editando.value && visita.id) {
    resultado = await supabase.from('visitas').update(datos).eq('id', visita.id)
  } else {
    resultado = await supabase.from('visitas').insert([datos])
  }
  if (!resultado.error) {
    cerrarModal()
    cargarVisitas()
  }
}

function confirmarEliminar(id) {
  idEliminar.value = id
  mostrarModalEliminar.value = true
}

function cerrarModalEliminar() {
  mostrarModalEliminar.value = false
  idEliminar.value = null
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

onMounted(cargarVisitas)

function enviarWhatsApp(v) {
  if (!v.celular) {
    alert('Este productor no tiene número de celular registrado.')
    return
  }

  const numero = v.celular.replace(/\D/g, '') // quitar caracteres no numéricos
  const mensaje = `
    👩‍🌾 *Productor:* ${v.productor}
    🌾 *Cultivo:* ${v.cultivo}
    🔍 *Hallazgos:* ${v.hallazgos || 'Ninguno'}
    📋 *Observaciones:* ${v.observaciones || 'Ninguna'}
    ✅ *Recomendaciones:* ${v.recomendaciones || 'Ninguna'}
    📅 *Fecha:* ${v.fecha}
    `.trim()

  const mensajeCodificado = encodeURIComponent(mensaje)
  const enlace = `https://wa.me/505${numero}?text=${mensajeCodificado}`

  window.open(enlace, '_blank')
}

</script>

<style scoped>
.app {
  max-width: 900px;
  margin: auto ;
  padding: 20px;
  font-family: sans-serif;
}
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}
.card {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.card p {
  margin: 5px 0;
}
.foto {
  width: 100%;
  height:300px;
  border-radius: 6px;
  margin-bottom: 10px;
}
button {
  padding: 6px 10px;
  border: none;
  background: #2ecc71;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #27ae60;
}
.eliminar {
  background: #e74c3c;
  margin-left: 5px;
}
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  width: 90%;
  margin: auto;
  max-width: 500px;
  border-radius: 10px;
}
.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 95%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.modal-content button {
  margin-left: 5px;
}
.btn-nueva {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border-radius: 6px;
}
.btn-nueva:hover {
  background-color: #2980b9;
}
.btn-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.filtros .buscar {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  max-width: 200px;
  box-sizing: border-box;
}
.filtros input[type="date"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  max-width: 200px;
  box-sizing: border-box;
}

@media (max-width: 600px) {
    .app h1{
        font-size: 1.6em;
        text-align: center;
    }
  .filtros {
    flex-direction: column;
    align-items: stretch;
  }

    .filtros .buscar{
       padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        width: 100%;
        max-width: 200px;
        box-sizing: border-box; 
        margin: auto;
    }
    .filtros input[type="date"] {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 14px;
        margin: auto;
        width: 100%;
        max-width: 200px;
        box-sizing: border-box;
    }
    .filtros button {
        width: 72%;
        margin: auto;
        padding: 10px;
    }

    .cards {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .card {
    width: 95%;
  }
    
}

</style>
