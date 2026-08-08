const express = require('express');
const router = express.Router();
const { knex } = require('../db');

// GET /api/dashboard?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    // Semua transaksi pada tanggal tersebut (dengan join)
    const allTrx = await knex('transaksi as t')
      .join('master_helm as m', 't.helm_id', 'm.id')
      .select(
        't.id', 't.nama_pembeli', 't.no_wa', 't.helm_id',
        'm.merk_helm', 't.qty', 'm.harga',
        knex.raw('t.qty * m.harga as total_harga'),
        't.tgl_pembelian', 't.is_lunas', 't.status_pengiriman',
        't.created_at'
      )
      .where('t.tgl_pembelian', date)
      .orderBy('t.id', 'desc');

    // Omset (hanya yang lunas)
    const omset = allTrx
      .filter(t => t.is_lunas)
      .reduce((sum, t) => sum + t.total_harga, 0);

    // Total helm terjual (semua transaksi hari itu)
    const totalHelmTerjual = allTrx.reduce((sum, t) => sum + t.qty, 0);

    // Jumlah belum lunas
    const jumlahBelumLunas = allTrx.filter(t => !t.is_lunas).length;

    // Helm paling laku (berdasarkan qty terbanyak)
    const helmMap = {};
    for (const t of allTrx) {
      if (!helmMap[t.merk_helm]) helmMap[t.merk_helm] = 0;
      helmMap[t.merk_helm] += t.qty;
    }
    let helmPalingLaku = null;
    let maxQty = 0;
    for (const [merk, qty] of Object.entries(helmMap)) {
      if (qty > maxQty) {
        maxQty = qty;
        helmPalingLaku = merk;
      }
    }

    res.json({
      success: true,
      data: {
        date,
        omset,
        totalHelmTerjual,
        jumlahBelumLunas,
        helmPalingLaku: helmPalingLaku ? { merk: helmPalingLaku, qty: maxQty } : null,
        transaksi: allTrx,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
