<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">
        <div class="icon-wrap">📊</div>
        <div>
          <h1>Dashboard Penjualan</h1>
          <p class="text-muted mt-1">Ringkasan penjualan helm harian</p>
        </div>
      </div>
      <div class="flex gap-3 items-center">
        <div class="form-group" style="flex-direction: row; align-items: center; gap: 12px;">
          <label style="margin: 0;">Pilih Tanggal:</label>
          <input type="date" class="form-control" v-model="selectedDate" @change="fetchDashboard" style="width: 160px;" />
        </div>
        <button class="btn btn-ghost btn-icon" @click="fetchDashboard" title="Refresh">
          🔄
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">
      <div class="spinner mx-auto mb-3"></div>
      <p>Memuat data dashboard...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger mb-4">
      {{ error }}
    </div>

    <template v-else>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Omset Penjualan (Lunas)</div>
          <div class="stat-value text-success">{{ formatRupiah(data.omset) }}</div>
          <div class="stat-sub mt-1">Pada {{ formatDate(selectedDate) }}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Helm Terjual</div>
          <div class="stat-value">{{ data.totalHelmTerjual }} <span style="font-size: 14px; font-weight: normal; color: var(--text-muted)">pcs</span></div>
          <div class="stat-sub mt-1">Total dari semua status</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Helm Paling Laku</div>
          <div class="stat-value" style="font-size: 1.25rem;">{{ data.helmPalingLaku ? data.helmPalingLaku.merk : '-' }}</div>
          <div class="stat-sub mt-1 text-accent" v-if="data.helmPalingLaku">Terjual {{ data.helmPalingLaku.qty }} pcs</div>
          <div class="stat-sub mt-1 text-muted" v-else>Belum ada penjualan</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Transaksi Belum Lunas</div>
          <div class="stat-value text-danger">{{ data.jumlahBelumLunas }}</div>
          <div class="stat-sub mt-1">Menunggu pembayaran</div>
        </div>
      </div>

      <div class="card mt-4">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
          <h3 class="fw-600">Daftar Transaksi ({{ data.transaksi.length }})</h3>
        </div>
        
        <div v-if="data.transaksi.length === 0" class="empty-state">
          <div class="emoji">📭</div>
          <p>Belum ada transaksi pada tanggal ini.</p>
        </div>
        
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Helm</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Total Harga</th>
                <th class="text-center">Pembayaran</th>
                <th class="text-center">Pengiriman</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in data.transaksi" :key="t.id">
                <td class="text-muted">#{{ t.id }}</td>
                <td>
                  <div class="fw-600">{{ t.nama_pembeli }}</div>
                  <div class="text-muted" style="font-size: 12px;">{{ t.no_wa }}</div>
                </td>
                <td>{{ t.merk_helm }}</td>
                <td class="text-right">{{ t.qty }}</td>
                <td class="text-right fw-600">{{ formatRupiah(t.total_harga) }}</td>
                <td class="text-center">
                  <span :class="['badge', t.is_lunas ? 'badge-success' : 'badge-warning']">
                    {{ t.is_lunas ? 'Lunas' : 'Belum Lunas' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="[
                    'badge',
                    t.status_pengiriman === 'Selesai' ? 'badge-success' : 
                    (t.status_pengiriman === 'Dikirim' ? 'badge-info' : 
                    (t.status_pengiriman === 'Proses' ? 'badge-warning' : 'badge-neutral'))
                  ]">
                    {{ t.status_pengiriman }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const data = ref({
  omset: 0,
  totalHelmTerjual: 0,
  jumlahBelumLunas: 0,
  helmPalingLaku: null,
  transaksi: []
})
const loading = ref(true)
const error = ref('')

const fetchDashboard = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await fetch(`/api/dashboard?date=${selectedDate.value}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.message)
    data.value = json.data
  } catch (err) {
    error.value = err.message || 'Gagal mengambil data dashboard'
  } finally {
    loading.value = false
  }
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(angka)
}

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 24px; }
.text-center { text-align: center; }
.text-accent { color: var(--accent-light); }
</style>
