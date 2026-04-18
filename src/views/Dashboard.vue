<template>
  <div class="dashboard-container">
    <div class="header-dashboard">
      <h2>Dashboard de Visitas</h2>
      <div class="descargar">
        <button class="btn-exportar" @click="exportarExcel">
          <Icon icon="mdi:microsoft-excel" /> 
          <span>Descargar Excel</span>
        </button>

        <button class="btn-exportar" @click="exportarPDF">
          <Icon icon="mdi:pdf-box" />
          <span>Descargar PDF</span>
        </button>
      </div>
    </div>

    <div class="filtros-dashboard">
      <div class="input-group">
        <label>Filtrar por mes:</label>
        <input type="month" v-model="mesSeleccionado" class="input-month" />
      </div>
      <button @click="mesSeleccionado = ''" class="btn-limpiar">
        <Icon icon="mdi:broom" /> 
        <span>Limpiar Filtros</span>
      </button>
    </div>

    <div class="graficos-grid">
      <GraficoBarras :data="stats.tecnicos" />
      <GraficoDona :data="stats.comunidades" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../supabase.js'
import GraficoBarras from '../components/dashboard/GraficoBarras.vue'
import GraficoDona from '../components/dashboard/GraficoDona.vue'

const visitas = ref([])
const mesSeleccionado = ref('')

async function cargarVisitas() {
  const { data } = await supabase.from('visitas').select('*')
  if (data) visitas.value = data
}

const stats = computed(() => {
  const filtradas = !mesSeleccionado.value 
    ? visitas.value 
    : visitas.value.filter(v => {
        const [anio, mes] = mesSeleccionado.value.split('-')
        const [vAnio, vMes] = v.fecha.split('-')
        return vAnio === anio && vMes === mes
      })

  const tecnicos = {}
  const comunidades = {}

  filtradas.forEach(v => {
    tecnicos[v.tecnico] = (tecnicos[v.tecnico] || 0) + 1
    comunidades[v.comunidad] = (comunidades[v.comunidad] || 0) + 1
  })

  return { tecnicos, comunidades }
})

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const exportarExcel = () => {
  const datos = visitas.value.map(v => ({
    ID: v.id,
    Fecha: v.fecha,
    Técnico: v.tecnico,
    Comunidad: v.comunidad,
    Hallazgos: v.hallazgos,
    Recomendaciones: v.recomendaciones,
    Observaciones: v.observaciones
  }))

  const ws = XLSX.utils.json_to_sheet(datos)

  // Ancho columnas
  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Visitas')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const file = new Blob([excelBuffer], { type: 'application/octet-stream' })

  saveAs(file, `visitas_${mesSeleccionado.value || 'todas'}.xlsx`)
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const exportarPDF = () => {
  const doc = new jsPDF()

  const rows = visitas.value.map(v => [
    v.id,
    v.fecha,
    v.tecnico,
    v.comunidad,
    v.hallazgos,
    v.recomendaciones,
    v.observaciones
  ])

  autoTable(doc, {
    head: [['ID', 'Fecha', 'Técnico', 'Comunidad', 'Hallazgos', 'Recomendaciones', 'Observaciones']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [46, 204, 113] } // verde
  })

  doc.save(`visitas_${mesSeleccionado.value || 'todas'}.pdf`)
}

onMounted(cargarVisitas)
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-dashboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-dashboard h2 {
  color: #0f172a;
  font-weight: 800;
  margin: 0;
}

.filtros-dashboard {
  display: flex;
  background: white;
  padding: 20px;
  border-radius: 12px;
  align-items: flex-end;
  gap: 15px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}

.input-month {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.graficos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}
.descargar{
  display: flex;
  width: 100%;
  gap: 20px;

}

.btn-exportar {
  background-color: #2ecc71;
  color: white;
  padding: 6px 18px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s;
  width: 150px!important;
}

.btn-limpiar {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-exportar:active, .btn-limpiar:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .dashboard-container { padding: 15px 15px 100px 15px; }
  .filtros-dashboard { flex-direction: column; align-items: stretch; }
  .header-dashboard { flex-direction: column; align-items: flex-start; }
  .btn-exportar, .btn-limpiar { width: 100%; justify-content: center; }
}
</style>