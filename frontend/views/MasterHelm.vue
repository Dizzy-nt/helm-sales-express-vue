<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-title">
        <div class="icon-wrap">📦</div>
        <div>
          <h1>Master Helm</h1>
          <p class="text-muted" style="font-size:13px;margin-top:2px">Kelola data inventaris helm</p>
        </div>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <span>＋</span> Tambah Helm
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Total Produk</div>
        <div class="stat-value">{{ helms.length }}</div>
        <div class="stat-sub">jenis helm</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Stok</div>
        <div class="stat-value">{{ totalStok }}</div>
        <div class="stat-sub">unit tersedia</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nilai Inventaris</div>
        <div class="stat-value" style="font-size:1.15rem">{{ formatRupiah(nilaiInventaris) }}</div>
        <div class="stat-sub">estimasi nilai stok</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Stok Menipis</div>
        <div class="stat-value" style="color:var(--warning)">{{ stokMenipis }}</div>
        <div class="stat-sub">produk ≤ 5 unit</div>
      </div>
    </div>

    <!-- Search -->
    <div class="card" style="margin-bottom:16px;padding:16px 20px">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="search" class="form-control" placeholder="Cari merk helm..." />
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
          <div class="emoji">📦</div>
          <p>{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada data helm' }}</p>
          <button v-if="!search" class="btn btn-primary" style="margin-top:16px" @click="openAdd">Tambah Helm Pertama</button>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Merk Helm</th>
              <th>Stok</th>
              <th>Harga Satuan</th>
              <th>Nilai Stok</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, i) in filtered" :key="h.id">
              <td class="text-muted">{{ i + 1 }}</td>
              <td>
                <div class="fw-600">{{ h.merk_helm }}</div>
                <div style="font-size:11.5px;color:var(--text-muted)">ID: #{{ h.id }}</div>
              </td>
              <td>
                <span class="fw-700" :style="{ color: stockColor(h.qty) }">{{ h.qty }}</span>
                <span class="text-muted"> unit</span>
              </td>
              <td class="fw-600">{{ formatRupiah(h.harga) }}</td>
              <td>{{ formatRupiah(h.qty * h.harga) }}</td>
              <td><StockBadge :qty="h.qty" /></td>
              <td>
                <div class="flex gap-2" style="justify-content:flex-end">
                  <button class="btn btn-sm btn-ghost" title="Edit" @click="openEdit(h)">✏️ Edit</button>
                  <button class="btn btn-sm btn-danger" title="Hapus" @click="confirmDelete(h)">🗑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah / Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ editId ? '✏️ Edit Helm' : '＋ Tambah Helm Baru' }}</h2>
          <button class="btn btn-icon btn-ghost" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger">⚠ {{ formError }}</div>

            <div class="form-group">
              <label>Merk Helm *</label>
              <input v-model="form.merk_helm" class="form-control" :class="{ error: errors.merk_helm }"
                placeholder="Contoh: Arai RX-7V Evo" />
              <div v-if="errors.merk_helm" class="form-error">{{ errors.merk_helm }}</div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="form-group">
                <label>Qty Stok *</label>
                <input v-model.number="form.qty" type="number" min="0" class="form-control" :class="{ error: errors.qty }"
                  placeholder="0" />
                <div v-if="errors.qty" class="form-error">{{ errors.qty }}</div>
              </div>
              <div class="form-group">
                <label>Harga Satuan (Rp) *</label>
                <input v-model.number="form.harga" type="number" min="0" class="form-control" :class="{ error: errors.harga }"
                  placeholder="0" />
                <div v-if="errors.harga" class="form-error">{{ errors.harga }}</div>
              </div>
            </div>

            <div v-if="form.harga > 0 && form.qty > 0" class="alert alert-warning" style="padding:10px 14px">
              💰 Total nilai stok: <strong>{{ formatRupiah(form.harga * form.qty) }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <div v-if="submitting" class="spinner" style="width:14px;height:14px;border-width:2px"></div>
              {{ editId ? 'Simpan Perubahan' : 'Tambah Helm' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-box" style="max-width:400px">
        <div class="modal-header">
          <h2>🗑 Hapus Helm</h2>
          <button class="btn btn-icon btn-ghost" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger">
            ⚠ Anda yakin ingin menghapus <strong>{{ deleteTarget.merk_helm }}</strong>?
            Tindakan ini tidak dapat dibatalkan.
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
import { masterAPI } from '../api/index.js'
import StockBadge from '../components/StockBadge.vue'

const showToast = inject('showToast')

const helms      = ref([])
const loading    = ref(true)
const showModal  = ref(false)
const editId     = ref(null)
const deleteTarget = ref(null)
const submitting = ref(false)
const formError  = ref('')
const search     = ref('')

const form = ref({ merk_helm: '', qty: 0, harga: 0 })
const errors = ref({})

// Computed
const filtered = computed(() => {
  if (!search.value) return helms.value
  return helms.value.filter(h =>
    h.merk_helm.toLowerCase().includes(search.value.toLowerCase())
  )
})
const totalStok       = computed(() => helms.value.reduce((s, h) => s + h.qty, 0))
const nilaiInventaris = computed(() => helms.value.reduce((s, h) => s + h.qty * h.harga, 0))
const stokMenipis     = computed(() => helms.value.filter(h => h.qty <= 5).length)

// Methods
async function loadData() {
  loading.value = true
  try {
    const { data } = await masterAPI.getAll()
    helms.value = data.data
  } catch { showToast('Gagal memuat data', 'error') }
  finally { loading.value = false }
}

function openAdd() {
  editId.value = null
  form.value = { merk_helm: '', qty: 0, harga: 0 }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

function openEdit(h) {
  editId.value = h.id
  form.value = { merk_helm: h.merk_helm, qty: h.qty, harga: h.harga }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

function validate() {
  errors.value = {}
  if (!form.value.merk_helm.trim()) errors.value.merk_helm = 'Merk helm wajib diisi'
  if (form.value.qty < 0) errors.value.qty = 'Qty tidak boleh negatif'
  if (form.value.harga <= 0) errors.value.harga = 'Harga harus lebih dari 0'
  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validate()) return
  submitting.value = true
  formError.value = ''
  try {
    if (editId.value) {
      await masterAPI.update(editId.value, form.value)
      showToast('Helm berhasil diperbarui ✓')
    } else {
      await masterAPI.create(form.value)
      showToast('Helm berhasil ditambahkan ✓')
    }
    closeModal()
    await loadData()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Terjadi kesalahan'
  } finally { submitting.value = false }
}

function confirmDelete(h) { deleteTarget.value = h }

async function doDelete() {
  submitting.value = true
  try {
    await masterAPI.remove(deleteTarget.value.id)
    showToast('Helm berhasil dihapus ✓')
    deleteTarget.value = null
    await loadData()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus', 'error')
  } finally { submitting.value = false }
}

function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}
function stockColor(qty) {
  if (qty === 0) return 'var(--danger)'
  if (qty <= 5) return 'var(--warning)'
  return 'var(--success)'
}

onMounted(loadData)
</script>
