const express = require('express');
const router = express.Router();
const { knex } = require('../db');

// GET all master helm
router.get('/', async (req, res) => {
  try {
    const rows = await knex('master_helm').orderBy('id', 'asc');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single master helm
router.get('/:id', async (req, res) => {
  try {
    const row = await knex('master_helm').where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST tambah helm baru
router.post('/', async (req, res) => {
  const { merk_helm, qty, harga } = req.body;
  if (!merk_helm || qty === undefined || harga === undefined) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  if (parseInt(qty) < 0)   return res.status(400).json({ success: false, message: 'Qty tidak boleh negatif' });
  if (parseFloat(harga) < 0) return res.status(400).json({ success: false, message: 'Harga tidak boleh negatif' });

  try {
    const [id] = await knex('master_helm').insert({
      merk_helm: merk_helm.trim(),
      qty: parseInt(qty),
      harga: parseFloat(harga),
    });
    const newRow = await knex('master_helm').where({ id }).first();
    res.status(201).json({ success: true, data: newRow, message: 'Helm berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update helm
router.put('/:id', async (req, res) => {
  const { merk_helm, qty, harga } = req.body;
  if (!merk_helm || qty === undefined || harga === undefined) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }
  if (parseInt(qty) < 0)   return res.status(400).json({ success: false, message: 'Qty tidak boleh negatif' });
  if (parseFloat(harga) < 0) return res.status(400).json({ success: false, message: 'Harga tidak boleh negatif' });

  try {
    const existing = await knex('master_helm').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    await knex('master_helm').where({ id: req.params.id }).update({
      merk_helm: merk_helm.trim(),
      qty: parseInt(qty),
      harga: parseFloat(harga),
      updated_at: knex.fn.now(),
    });

    const updated = await knex('master_helm').where({ id: req.params.id }).first();
    res.json({ success: true, data: updated, message: 'Helm berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE helm
router.delete('/:id', async (req, res) => {
  try {
    const existing = await knex('master_helm').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    // Cek apakah ada transaksi aktif
    const activeCount = await knex('transaksi')
      .where({ helm_id: req.params.id })
      .whereNot({ status_pengiriman: 'Selesai' })
      .count('id as c')
      .first();

    if (parseInt(activeCount.c) > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus: ada ${activeCount.c} transaksi aktif untuk helm ini`
      });
    }

    await knex('master_helm').where({ id: req.params.id }).delete();
    res.json({ success: true, message: 'Helm berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
