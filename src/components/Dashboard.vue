<template>
  <div>
    <button @click="abrirDashboard" class="btn-dashboard">📊Dashboard</button>
    
   

    <div class="modal" v-if="mostrarDashboard">
      <div class="modal-content-dashboard">
        <button class="cerrar" @click="cerrarDashboard">X</button>
        <h2>Dashboard de Visitas</h2>
        <button class="btn-exportar">Descargar visitas a Excel</button>
        <div class="filtros-dashboard">
          <label>Filtrar por mes:</label>
          <input type="month" v-model="mesSeleccionado" @change="filtrarPorMes" />
          <button @click="limpiarFiltros" class="btn-limpiar">Limpiar</button>

        </div>

        <canvas ref="graficoTecnicos"></canvas>
        <canvas ref="graficoComunidades"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const visitas = ref([])
const mostrarDashboard = ref(false)
const mesSeleccionado = ref('')
const graficoTecnicos = ref(null)
const graficoComunidades = ref(null)
let chart1 = null
let chart2 = null


import { supabase } from '../supabase.js'

async function cargarVisitas() {
  const { data } = await supabase.from('visitas').select('*')
  if (data) visitas.value = data
}

function abrirDashboard() {
  mostrarDashboard.value = true
  mesSeleccionado.value = ''
  nextTick(() => {
    renderizarGraficos(visitas.value)
  })
}

function cerrarDashboard() {
  mostrarDashboard.value = false
  chart1?.destroy()
  chart2?.destroy()
}

function filtrarPorMes() {
  if (!mesSeleccionado.value) return
  const [anio, mes] = mesSeleccionado.value.split('-')
  const visitasFiltradas = visitas.value.filter(v => {
    const [a, m] = v.fecha.split('-')
    return a === anio && m === mes
  })
  renderizarGraficos(visitasFiltradas)
}
function limpiarFiltros() {
  mesSeleccionado.value = ''
  renderizarGraficos(visitas.value)
}


function renderizarGraficos(data) {
  const tecnicos = {}
  const comunidades = {}

  data.forEach(v => {
    tecnicos[v.tecnico] = (tecnicos[v.tecnico] || 0) + 1
    comunidades[v.comunidad] = (comunidades[v.comunidad] || 0) + 1
  })

  chart1?.destroy()
  chart2?.destroy()

  chart1 = new Chart(graficoTecnicos.value, {
    type: 'bar',
    data: {
      labels: Object.keys(tecnicos),
      datasets: [{
        label: 'Visitas',
        data: Object.values(tecnicos),
        backgroundColor: '#2ecc71'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Visitas por Técnico' }
      }
    }
  })

  chart2 = new Chart(graficoComunidades.value, {
    type: 'pie',
    data: {
      labels: Object.keys(comunidades),
      datasets: [{
        label: 'Visitas',
        data: Object.values(comunidades),
        backgroundColor: [
          '#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Comunidades más visitadas' }
      }
    }
  })
}

onMounted(cargarVisitas)
</script>

<style scoped>
.btn-dashboard {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 10px;
}

.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  overflow-y: auto;
  padding: 20px; /* para que no toque bordes en móvil */
  box-sizing: border-box;
}

.modal-content-dashboard {
  background: white;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  border-radius: 10px;
  position: relative;
  box-sizing: border-box;
  max-height: 90vh; /* para que no exceda altura de pantalla */
  overflow-y: auto;
}

.cerrar {
  position: absolute;
  top: 2px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
}

.filtros-dashboard {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn-exportar {
  background-color: #2ecc71 !important;
  color: white;
  padding: 8px 12px;
  margin-bottom: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

canvas {
  width: 100% !important;
  height: auto !important;
  margin-top: 20px;
  max-height: 400px;
}
.btn-limpiar {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 10px;
}



@media (max-width: 600px) {
  .modal-content-dashboard {
    padding: 15px;
    background: white;
    padding: 20px;
    width: 100%;
    max-width: 1200px;
    border-radius: 10px;
    position: relative;
    box-sizing: border-box;
    height: 100vh; /* para que no exceda altura de pantalla */
    overflow-y: auto;
  }
  .btn-limpiar {
    margin-left: 0;
    margin-top: 10px;
  }
    .btn-dashboard {
        width: 50%;
        margin-bottom: 10px;
        margin-left: 25%;
    }
  .filtros-dashboard {
    flex-direction: column;
    align-items: flex-start;
  }

  .cerrar {
    padding: 5px 8px;
    font-size: 14px;
  }
}
</style>

