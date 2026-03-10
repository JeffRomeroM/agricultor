<template>
  <div class="dashboard-container">
    <div class="header-dashboard">
      <h2>Dashboard de Visitas</h2>
      <button class="btn-exportar" @click="exportarExcel">
        <Icon icon="mdi:microsoft-excel" /> Descargar visitas
      </button>
    </div>

    <div class="filtros-dashboard">
      <div class="input-group">
        <label>Filtrar por mes:</label>
        <input type="month" v-model="mesSeleccionado" @change="filtrarPorMes" />
      </div>
      <button @click="limpiarFiltros" class="btn-limpiar">
        <Icon icon="mdi:broom" /> Limpiar
      </button>
    </div>

    <div class="graficos-grid">
      <div class="chart-card">
        <canvas ref="graficoTecnicos"></canvas>
      </div>
      <div class="chart-card">
        <canvas ref="graficoComunidades"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Icon } from '@iconify/vue'
import { supabase } from '../supabase.js'

Chart.register(...registerables)

const visitas = ref([])
const mesSeleccionado = ref('')
const graficoTecnicos = ref(null)
const graficoComunidades = ref(null)
let chart1 = null
let chart2 = null

async function cargarVisitas() {
  const { data } = await supabase.from('visitas').select('*')
  if (data) {
    visitas.value = data
    // Renderizamos automáticamente al cargar los datos
    nextTick(() => renderizarGraficos(visitas.value))
  }
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
        backgroundColor: '#d19a02' // Usando tu color primario
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Visitas por Técnico', font: { size: 16 } }
      }
    }
  })

  chart2 = new Chart(graficoComunidades.value, {
    type: 'doughnut', // Cambiado a doughnut para un look más moderno
    data: {
      labels: Object.keys(comunidades),
      datasets: [{
        data: Object.values(comunidades),
        backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#d19a02']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: 'Distribución por Comunidad', font: { size: 16 } }
      }
    }
  })
}

onMounted(cargarVisitas)
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-dashboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 15px;
}

.header-dashboard h2 {
  color: #1e293b;
  margin: 0;
}

.filtros-dashboard {
  display: flex;
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  align-items: flex-end;
  gap: 15px;
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.graficos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 350px; /* Altura fija para consistencia */
}

.btn-exportar {
  background-color: #10b981;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-limpiar {
  background: #64748b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 10px;
    padding-bottom: 100px; /* Espacio para el nav inferior */
  }
  
  .filtros-dashboard {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-dashboard {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-exportar {
    width: 100%;
    justify-content: center;
  }
}
</style>