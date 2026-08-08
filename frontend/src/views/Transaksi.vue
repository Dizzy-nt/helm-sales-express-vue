<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-title">
        <div class="icon-wrap">🧾</div>
        <div>
          <h1>Transaksi Penjualan</h1>
          <p class="text-muted" style="font-size:13px;margin-top:2px">Kelola semua data penjualan helm</p>
        </div>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <span>＋</span> Tambah Transaksi
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Total Transaksi</div>
        <div class="stat-value">{{ transaksis.length }}</div>
        <div class="stat-sub">semua transaksi</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sudah Lunas</div>
        <div class="stat-value" style="color:var(--success)">{{ lunas }}</div>
        <div class="stat-sub">transaksi lunas</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Belum Lunas</div>
        <div class="stat-value" style="color:var(--danger)">{{ belumLunas }}</div>
        <div class="stat-sub">transaksi pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Omzet</div>
        <div class="stat-value" style="font-size:1.05rem">{{ formatRupiah(totalOmzet) }}</div>
        <div class="stat-sub">semua transaksi</div>
      </div>
    </div>

    <!-- Filter + Search -->
    <div class="card" style="margin-bottom:16px;padding:16px 20px">
      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Baris Atas: Cari & Filter Status -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div class="search-box" style="flex:1;min-width:200px">
            <span class="search-icon">🔍</span>
            <input v-model="search" class="form-control" placeholder="Cari nama pembeli / no WA..." />
          </div>
          <select v-model="filterStatus" class="form-control" style="width:180px">
            <option value="">Semua Status Pengiriman</option>
            <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ s }}</option>
          </select>
          <select v-model="filterLunas" class="form-control" style="width:160px">
            <option value="">Semua Pembayaran</option>
            <option value="1">Lunas</option>
            <option value="0">Belum Lunas</option>
          </select>
        </div>
        <!-- Baris Bawah: Rentang Tanggal & Urutan -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div style="display:flex;align-items:center;gap:8px">
            <label class="text-muted" style="font-size:12px;font-weight:500;">Mulai:</label>
            <input type="date" v-model="filterStartDate" class="form-control" style="width:150px" />
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label class="text-muted" style="font-size:12px;font-weight:500;">Sampai:</label>
            <input type="date" v-model="filterEndDate" class="form-control" style="width:150px" />
          </div>
          <div style="flex:1"></div>
          <select v-model="sortOrder" class="form-control" style="width:170px">
            <option value="desc">📅 Tanggal Terbaru</option>
            <option value="asc">📅 Tanggal Terlama</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-wrap">
        <div v-if="loading" style="padding:48px;text-align:center">
          <div class="spinner" style="margin:0 auto"></div>
          <p class="text-muted" style="margin-top:12px">Memuat data...</p>
        </div>

        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="emoji">🧾</div>
          <p>{{ search || filterStatus || filterLunas || filterStartDate || filterEndDate ? 'Tidak ada hasil pencarian' : 'Belum ada transaksi' }}</p>
          <button v-if="!search && !filterStatus && !filterLunas && !filterStartDate && !filterEndDate" class="btn btn-primary" style="margin-top:16px" @click="openAdd">
            Buat Transaksi Pertama
          </button>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Pembeli</th>
              <th>Helm</th>
              <th>Qty</th>
              <th>Total</th>
              <th @click="toggleSort" style="cursor:pointer;user-select:none" title="Klik untuk mengubah urutan tanggal">
                Tgl Beli {{ sortOrder === 'desc' ? '⬇' : '⬆' }}
              </th>
              <th>Pembayaran</th>
              <th>Pengiriman</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in filtered" :key="t.id">
              <td class="text-muted">{{ i + 1 }}</td>
              <td>
                <div class="fw-600">{{ t.nama_pembeli }}</div>
                <div style="font-size:11.5px;color:var(--text-muted)">📱 {{ t.no_wa }}</div>
              </td>
              <td>
                <div class="fw-600">{{ t.merk_helm }}</div>
                <div style="font-size:11.5px;color:var(--text-muted)">{{ formatRupiah(t.harga) }}/unit</div>
              </td>
              <td><span class="fw-700">{{ t.qty }}</span> <span class="text-muted">unit</span></td>
              <td class="fw-700" style="color:var(--accent-light)">{{ formatRupiah(t.total_harga) }}</td>
              <td>{{ formatDate(t.tgl_pembelian) }}</td>
              <td>
                <span :class="['badge', t.is_lunas ? 'badge-success' : 'badge-danger']">
                  {{ t.is_lunas ? '✓ Lunas' : '⏳ Belum' }}
                </span>
              </td>
              <td><ShippingBadge :status="t.status_pengiriman" /></td>
              <td>
                <div class="flex gap-2" style="justify-content:flex-end">
                  <button class="btn btn-sm btn-ghost" @click="openEdit(t)">✏️ Edit</button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(t)">🗑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah / Edit Transaksi -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box" style="max-width:580px">
        <div class="modal-header">
          <h2>{{ editId ? '✏️ Edit Transaksi' : '＋ Transaksi Baru' }}</h2>
          <button class="btn btn-icon btn-ghost" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger">⚠ {{ formError }}</div>

            <!-- Pembeli -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="form-group">
                <label>Nama Pembeli *</label>
                <input v-model="form.nama_pembeli" class="form-control" :class="{ error: errors.nama_pembeli }"
                  placeholder="Nama lengkap" />
                <div v-if="errors.nama_pembeli" class="form-error">{{ errors.nama_pembeli }}</div>
              </div>
              <div class="form-group">
                <label>No. WhatsApp *</label>
                <input v-model="form.no_wa" class="form-control" :class="{ error: errors.no_wa }"
                  placeholder="08xx-xxxx-xxxx" type="tel" />
                <div v-if="errors.no_wa" class="form-error">{{ errors.no_wa }}</div>
              </div>
            </div>

            <!-- Helm -->
            <div class="form-group">
              <label>Helm yang Dibeli *</label>
              <select v-model="form.helm_id" class="form-control" :class="{ error: errors.helm_id }" @change="onHelmChange">
                <option value="">-- Pilih Helm --</option>
                <option v-for="h in helms" :key="h.id" :value="h.id" :disabled="h.qty === 0">
                  {{ h.merk_helm }} — Stok: {{ h.qty }} unit ({{ formatRupiah(h.harga) }}){{ h.qty === 0 ? ' [HABIS]' : '' }}
                </option>
              </select>
              <div v-if="errors.helm_id" class="form-error">{{ errors.helm_id }}</div>
              <!-- Stok info -->
              <div v-if="selectedHelm" class="form-hint flex items-center gap-2">
                <StockBadge :qty="selectedHelm.qty" />
                <span>Stok tersedia: <strong>{{ selectedHelm.qty }} unit</strong></span>
              </div>
            </div>

            <!-- Qty + Tgl -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="form-group">
                <label>Qty Beli *</label>
                <input
                  v-model.number="form.qty"
                  type="number" min="1"
                  :max="selectedHelm?.qty || 9999"
                  class="form-control" :class="{ error: errors.qty }"
                  :disabled="!form.helm_id"
                  placeholder="0"
                />
                <div v-if="errors.qty" class="form-error">{{ errors.qty }}</div>
                <div v-if="selectedHelm && form.qty > selectedHelm.qty" class="form-error">
                  ⚠ Melebihi stok! Maks: {{ selectedHelm.qty }}
                </div>
              </div>
              <div class="form-group">
                <label>Tanggal Pembelian *</label>
                <input v-model="form.tgl_pembelian" type="date" class="form-control" :class="{ error: errors.tgl_pembelian }" />
                <div v-if="errors.tgl_pembelian" class="form-error">{{ errors.tgl_pembelian }}</div>
              </div>
            </div>

            <!-- Total preview -->
            <div v-if="totalPreview > 0" class="alert alert-warning" style="padding:10px 14px">
              💰 Total harga: <strong>{{ formatRupiah(totalPreview) }}</strong>
            </div>

            <!-- Status -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="form-group">
                <label>Status Pengiriman</label>
                <select v-model="form.status_pengiriman" class="form-control">
                  <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status Pembayaran</label>
                <div style="margin-top:10px" @click="form.is_lunas = !form.is_lunas">
                  <div class="toggle-wrap">
                    <div :class="['toggle', { active: form.is_lunas }]"></div>
                    <span>{{ form.is_lunas ? '✓ Lunas' : 'Belum Lunas' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting || (selectedHelm && form.qty > selectedHelm.qty)">
              <div v-if="submitting" class="spinner" style="width:14px;height:14px;border-width:2px"></div>
              {{ editId ? 'Simpan Perubahan' : 'Buat Transaksi' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-box" style="max-width:400px">
        <div class="modal-header">
          <h2>🗑 Hapus Transaksi</h2>
          <button class="btn btn-icon btn-ghost" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger">
            ⚠ Hapus transaksi <strong>{{ deleteTarget.nama_pembeli }}</strong> untuk helm
            <strong>{{ deleteTarget.merk_helm }}</strong>?
          </div>
          <div class="alert alert-warning" style="margin-top:8px">
            ℹ Stok helm akan dikembalikan sebesar <strong>{{ deleteTarget.qty }} unit</strong>.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteTarget = null">Batal</button>
          <button class="btn btn-danger" :disabled="submitting" @click="doDelete">
            <div v-if="submitting" class="spinner" style="width:14px;height:14px;border-width:2px"></div>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { transaksiAPI, masterAPI } from '../api/index.js'
import StockBadge from '../components/StockBadge.vue'
import ShippingBadge from '../components/ShippingBadge.vue'

const showToast = inject('showToast')

const STATUS_LIST = ['Pending', 'Proses', 'Dikirim', 'Selesai']

const transaksis   = ref([])
const helms        = ref([])
const loading      = ref(true)
const showModal    = ref(false)
const editId       = ref(null)
const deleteTarget = ref(null)
const submitting   = ref(false)
const formError    = ref('')
const search       = ref('')
const filterStatus = ref('')
const filterLunas  = ref('')
const filterStartDate = ref('')
const filterEndDate   = ref('')
const sortOrder    = ref('desc') // 'desc' = terbaru, 'asc' = terlama

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const defaultForm = () => ({
  nama_pembeli: '', no_wa: '', helm_id: '', qty: 1,
  tgl_pembelian: new Date().toISOString().slice(0, 10),
  is_lunas: false, status_pengiriman: 'Pending'
})
const form   = ref(defaultForm())
const errors = ref({})

// Computed
const selectedHelm = computed(() =>
  helms.value.find(h => h.id === Number(form.value.helm_id)) || null
)
const totalPreview = computed(() =>
  selectedHelm.value ? selectedHelm.value.harga * (form.value.qty || 0) : 0
)
const filtered = computed(() => {
  let list = [...transaksis.value]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.nama_pembeli.toLowerCase().includes(q) ||
      t.no_wa.includes(q) ||
      t.merk_helm.toLowerCase().includes(q)
    )
  }
  if (filterStatus.value) list = list.filter(t => t.status_pengiriman === filterStatus.value)
  if (filterLunas.value !== '') list = list.filter(t => String(t.is_lunas) === filterLunas.value)

  if (filterStartDate.value) {
    list = list.filter(t => t.tgl_pembelian >= filterStartDate.value)
  }
  if (filterEndDate.value) {
    list = list.filter(t => t.tgl_pembelian <= filterEndDate.value)
  }

  // Sort by date
  list.sort((a, b) => {
    const timeA = new Date(a.tgl_pembelian).getTime()
    const timeB = new Date(b.tgl_pembelian).getTime()
    if (timeA !== timeB) {
      return sortOrder.value === 'desc' ? timeB - timeA : timeA - timeB
    }
    return sortOrder.value === 'desc' ? b.id - a.id : a.id - b.id
  })

  return list
})

const lunas      = computed(() => transaksis.value.filter(t => t.is_lunas).length)
const belumLunas = computed(() => transaksis.value.filter(t => !t.is_lunas).length)
const totalOmzet = computed(() => transaksis.value.reduce((s, t) => s + (t.total_harga || 0), 0))

// Methods
async function loadData() {
  loading.value = true
  try {
    const [trx, mst] = await Promise.all([transaksiAPI.getAll(), masterAPI.getAll()])
    transaksis.value = trx.data.data
    helms.value = mst.data.data
  } catch { showToast('Gagal memuat data', 'error') }
  finally { loading.value = false }
}

function openAdd() {
  editId.value = null
  form.value = defaultForm()
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

function openEdit(t) {
  editId.value = t.id
  form.value = {
    nama_pembeli: t.nama_pembeli,
    no_wa: t.no_wa,
    helm_id: t.helm_id,
    qty: t.qty,
    tgl_pembelian: t.tgl_pembelian,
    is_lunas: !!t.is_lunas,
    status_pengiriman: t.status_pengiriman,
  }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

function onHelmChange() { form.value.qty = 1 }

function validate() {
  errors.value = {}
  if (!form.value.nama_pembeli.trim()) errors.value.nama_pembeli = 'Nama wajib diisi'
  if (!form.value.no_wa.trim())        errors.value.no_wa = 'No. WA wajib diisi'
  if (!form.value.helm_id)             errors.value.helm_id = 'Pilih helm terlebih dahulu'
  if (!form.value.qty || form.value.qty < 1) errors.value.qty = 'Qty minimal 1'
  if (!form.value.tgl_pembelian)       errors.value.tgl_pembelian = 'Tanggal wajib diisi'
  if (selectedHelm.value && form.value.qty > selectedHelm.value.qty)
    errors.value.qty = `Stok tidak cukup! Maks: ${selectedHelm.value.qty}`
  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validate()) return
  submitting.value = true
  formError.value = ''
  try {
    const payload = { ...form.value }
    if (editId.value) {
      await transaksiAPI.update(editId.value, payload)
      showToast('Transaksi berhasil diperbarui ✓')
    } else {
      await transaksiAPI.create(payload)
      showToast('Transaksi berhasil dibuat ✓')
    }
    closeModal()
    await loadData()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Terjadi kesalahan'
  } finally { submitting.value = false }
}

function confirmDelete(t) { deleteTarget.value = t }

async function doDelete() {
  submitting.value = true
  try {
    await transaksiAPI.remove(deleteTarget.value.id)
    showToast('Transaksi dihapus & stok dikembalikan ✓')
    deleteTarget.value = null
    await loadData()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus', 'error')
  } finally { submitting.value = false }
}

function formatRupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID') }
function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(loadData)
</script>
