const express = require('express');
const router = express.Router();
const { knex } = require('../db');

const VALID_STATUS = ['Pending', 'Proses', 'Dikirim', 'Selesai'];

// Query helper: get transaksi with join
const getWithJoin = () =>
  knex('transaksi as t')
    .join('master_helm as m', 't.helm_id', 'm.id')
    .select(
      't.id', 't.nama_pembeli', 't.no_wa', 't.helm_id',
      'm.merk_helm', 't.qty', 'm.harga',
      knex.raw('t.qty * m.harga as total_harga'),
      't.tgl_pembelian', 't.is_lunas', 't.status_pengiriman',
      't.created_at', 't.updated_at'
    );

// GET all transaksi
router.get('/', async (req, res) => {
  try {
    const rows = await getWithJoin().orderBy('t.id', 'desc');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single transaksi
router.get('/:id', async (req, res) => {
  try {
    const row = await getWithJoin().where('t.id', req.params.id).first();
    if (!row) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST buat transaksi baru (dengan validasi stok)
router.post('/', async (req, res) => {
  const { nama_pembeli, no_wa, helm_id, qty, tgl_pembelian, is_lunas, status_pengiriman } = req.body;

  if (!nama_pembeli || !no_wa || !helm_id || !qty || !tgl_pembelian) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  if (parseInt(qty) <= 0) {
    return res.status(400).json({ success: false, message: 'Qty harus lebih dari 0' });
  }
  if (status_pengiriman && !VALID_STATUS.includes(status_pengiriman)) {
    return res.status(400).json({ success: false, message: 'Status pengiriman tidak valid' });
  }

  try {
    let newId;
    await knex.transaction(async (trx) => {
      // Ambil data helm (lock row)
      const helm = await trx('master_helm').where({ id: parseInt(helm_id) }).first();
      if (!helm) throw Object.assign(new Error('Helm tidak ditemukan'), { status: 404 });

      // ✅ VALIDASI STOK
      if (helm.qty < parseInt(qty)) {
        throw Object.assign(
          new Error(`Stok tidak cukup! Stok tersedia: ${helm.qty}, Qty diminta: ${qty}`),
          { status: 400 }
        );
      }

      // Kurangi stok
      await trx('master_helm').where({ id: parseInt(helm_id) }).update({
        qty: helm.qty - parseInt(qty),
        updated_at: knex.fn.now(),
      });

      // Insert transaksi
      const [id] = await trx('transaksi').insert({
        nama_pembeli: nama_pembeli.trim(),
        no_wa: no_wa.trim(),
        helm_id: parseInt(helm_id),
        qty: parseInt(qty),
        tgl_pembelian,
        is_lunas: is_lunas ? 1 : 0,
        status_pengiriman: status_pengiriman || 'Pending',
      });
      newId = id;
    });

    const newRow = await getWithJoin().where('t.id', newId).first();
    res.status(201).json({ success: true, data: newRow, message: 'Transaksi berhasil dibuat' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PUT update transaksi
router.put('/:id', async (req, res) => {
  const { nama_pembeli, no_wa, helm_id, qty, tgl_pembelian, is_lunas, status_pengiriman } = req.body;

  if (status_pengiriman && !VALID_STATUS.includes(status_pengiriman)) {
    return res.status(400).json({ success: false, message: 'Status pengiriman tidak valid' });
  }

  try {
    const existing = await knex('transaksi').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

    await knex.transaction(async (trx) => {
      const qtyLama = existing.qty;
      const qtyBaru = qty !== undefined ? parseInt(qty) : qtyLama;
      const helmIdBaru = helm_id !== undefined ? parseInt(helm_id) : existing.helm_id;

      // Jika helm atau qty berubah, sesuaikan stok
      if (helmIdBaru !== existing.helm_id || qtyBaru !== qtyLama) {
        // Kembalikan stok lama
        await trx('master_helm').where({ id: existing.helm_id }).increment('qty', qtyLama);

        // Cek stok helm baru
        const helmBaru = await trx('master_helm').where({ id: helmIdBaru }).first();
        if (!helmBaru) throw Object.assign(new Error('Helm tidak ditemukan'), { status: 404 });

        if (helmBaru.qty < qtyBaru) {
          throw Object.assign(
            new Error(`Stok tidak cukup! Stok tersedia: ${helmBaru.qty}, Qty diminta: ${qtyBaru}`),
            { status: 400 }
          );
        }

        // Kurangi stok baru
        await trx('master_helm').where({ id: helmIdBaru }).decrement('qty', qtyBaru);
      }

      await trx('transaksi').where({ id: req.params.id }).update({
        nama_pembeli: nama_pembeli !== undefined ? nama_pembeli.trim() : existing.nama_pembeli,
        no_wa: no_wa !== undefined ? no_wa.trim() : existing.no_wa,
        helm_id: helmIdBaru,
        qty: qtyBaru,
        tgl_pembelian: tgl_pembelian || existing.tgl_pembelian,
        is_lunas: is_lunas !== undefined ? (is_lunas ? 1 : 0) : existing.is_lunas,
        status_pengiriman: status_pengiriman || existing.status_pengiriman,
        updated_at: knex.fn.now(),
      });
    });

    const updated = await getWithJoin().where('t.id', req.params.id).first();
    res.json({ success: true, data: updated, message: 'Transaksi berhasil diperbarui' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// DELETE transaksi (kembalikan stok)
router.delete('/:id', async (req, res) => {
  try {
    const existing = await knex('transaksi').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

    await knex.transaction(async (trx) => {
      // Kembalikan stok
      await trx('master_helm').where({ id: existing.helm_id }).increment('qty', existing.qty);
      // Hapus transaksi
      await trx('transaksi').where({ id: req.params.id }).delete();
    });

    res.json({ success: true, message: 'Transaksi berhasil dihapus dan stok dikembalikan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
