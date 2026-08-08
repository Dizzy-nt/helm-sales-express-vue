const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: require('path').join(__dirname, 'helm_sales.db'),
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, cb) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    }
  }
});

async function initDB() {
  // Create master_helm table
  const hasMaster = await knex.schema.hasTable('master_helm');
  if (!hasMaster) {
    await knex.schema.createTable('master_helm', (t) => {
      t.increments('id').primary();
      t.string('merk_helm').notNullable();
      t.integer('qty').notNullable().defaultTo(0);
      t.float('harga').notNullable().defaultTo(0);
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Tabel master_helm dibuat');

    // Seed data awal
    await knex('master_helm').insert([
      { merk_helm: 'Arai RX-7V Evo',  qty: 5,  harga: 8500000 },
      { merk_helm: 'Shoei X-SPR Pro',  qty: 3,  harga: 9200000 },
      { merk_helm: 'KYT NX Race',      qty: 15, harga: 1850000 },
      { merk_helm: 'INK CL-Max 3',     qty: 20, harga: 850000  },
      { merk_helm: 'GM Airborne 3',    qty: 10, harga: 650000  },
      { merk_helm: 'HJC RPHA 11',      qty: 8,  harga: 4200000 },
    ]);
    console.log('✅ Seed data master helm berhasil ditambahkan');
  }

  // Create transaksi table
  const hasTrx = await knex.schema.hasTable('transaksi');
  if (!hasTrx) {
    await knex.schema.createTable('transaksi', (t) => {
      t.increments('id').primary();
      t.string('nama_pembeli').notNullable();
      t.string('no_wa').notNullable();
      t.integer('helm_id').notNullable().references('id').inTable('master_helm');
      t.integer('qty').notNullable();
      t.date('tgl_pembelian').notNullable();
      t.boolean('is_lunas').notNullable().defaultTo(false);
      t.string('status_pengiriman').notNullable().defaultTo('Pending');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Tabel transaksi dibuat');
  }
}

module.exports = { knex, initDB };

