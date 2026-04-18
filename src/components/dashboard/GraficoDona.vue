<template>
  <div class="chart-card">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js'

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
)

const props = defineProps({ data: Object })
const canvas = ref(null)
let chart = null

const renderChart = () => {
  if (!canvas.value) return

  chart?.destroy()

  chart = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(props.data || {}),
      datasets: [{
        data: Object.values(props.data || {}),
        backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#1abc9c', '#2ecc71'],
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Distribución por Comunidad'
        },
        legend: {
          position: 'bottom'
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(renderChart)
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