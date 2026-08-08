<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="brand-icon">🪖</span>
      <span class="brand-name">HelmSales</span>
      <span class="brand-tag">v1.0</span>
    </div>
    <div class="navbar-links">
      <router-link to="/dashboard" class="nav-link" active-class="active">
        <span class="nav-icon">📊</span>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/master" class="nav-link" active-class="active">
        <span class="nav-icon">📦</span>
        <span>Master Helm</span>
      </router-link>
      <router-link to="/transaksi" class="nav-link" active-class="active">
        <span class="nav-icon">🧾</span>
        <span>Transaksi</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 60px;
  background: rgba(19, 22, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 8px rgba(99,102,241,0.6));
}
.brand-name {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}
.brand-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--accent-glow);
  border: 1px solid rgba(99,102,241,0.3);
  color: var(--accent-light);
  font-weight: 600;
}

.navbar-links {
  display: flex;
  gap: 4px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.18s ease;
}
.nav-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
.nav-link.active {
  color: var(--accent-light);
  background: var(--accent-glow);
  border: 1px solid rgba(99,102,241,0.25);
}
.nav-icon { font-size: 15px; }

@media (max-width: 480px) {
  .navbar { padding: 0 16px; }
  .brand-tag, .brand-name { display: none; }
}
</style>
