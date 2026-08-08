import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import MasterHelm from '../views/MasterHelm.vue'
import Transaksi from '../views/Transaksi.vue'

const routes = [
  { path: '/',          redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard,  meta: { title: 'Dashboard' } },
  { path: '/master',    component: MasterHelm, meta: { title: 'Master Helm' } },
  { path: '/transaksi', component: Transaksi,  meta: { title: 'Transaksi' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — HelmSales` : 'HelmSales'
})

export default router
