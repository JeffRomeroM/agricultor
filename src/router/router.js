import { createRouter, createWebHistory } from 'vue-router'
import Visitas from '../components/Visitas.vue'
import Dashboard from '../views/Dashboard.vue';
import Mapa from '../views/Mapa.vue';



    const routes = [ 
  { path: '/', name: 'Visitas', component: Visitas },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/mapa', name: 'Mapa', component: Mapa }
  // otras rutas
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;
