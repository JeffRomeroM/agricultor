<template>
  <div class="chart-card">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'


const props = defineProps({ data: Object })
const canvas = ref(null)
let chart = null

const renderChart = () => {
  if (!canvas.value || !props.data || Object.keys(props.data).length === 0) return

  chart?.destroy()

  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: Object.keys(props.data),
      datasets: [{
        label: 'Visitas',
        data: Object.values(props.data),
        backgroundColor: '#2ecc71'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Visitas por Técnico'
        }
      },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  renderChart()
})

watch(() => props.data, renderChart, { deep: true })
</script>

<style scoped>
.chart-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 350px;
  border: 1px solid #f1f5f9;
  width: 94%;
}
</style>