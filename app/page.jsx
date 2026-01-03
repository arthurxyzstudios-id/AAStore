"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function buy(plan) {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (data.payment_url) {
        // Redirect ke link QRIS
        window.location.href = data.payment_url;
      } else {
        alert("Gagal order: " + (data.error || "Unknown error"));
        setLoading(false);
      }
    } catch (e) {
      alert("Error: " + e.message);
      setLoading(false);
    }
  }

  return (
    <main className="main-container">
      <div className="content">
        <h1 className="title">⚡ STORE PANEL</h1>
        <p className="subtitle">Server kenceng, harga pelajar. Auto create via QRIS.</p>

        <div className="grid">
          {/* PLAN BASIC */}
          <div className="card">
            <div className="badge">POPULAR</div>
            <h2>Basic Plan</h2>
            <div className="price">Rp 10.000<span>/bulan</span></div>
            
            <ul className="features">
              <li>🚀 RAM 2 GB</li>
              <li>💾 Disk 10 GB</li>
              <li>⚡ CPU 100%</li>
              <li>🛡️ Anti-DDoS</li>
            </ul>

            <button 
              onClick={() => buy('basic')} 
              disabled={loading}
              className="btn"
            >
              {loading ? 'Memproses...' : 'Beli via QRIS'}
            </button>
          </div>

          {/* PLAN PREMIUM */}
          <div className="card premium">
            <div className="badge gold">SULTAN</div>
            <h2>Premium Plan</h2>
            <div className="price">Rp 40.000<span>/bulan</span></div>
            
            <ul className="features">
              <li>🚀 RAM 8 GB</li>
              <li>💾 Disk 40 GB</li>
              <li>⚡ CPU 300%</li>
              <li>🛡️ Prioritas Support</li>
            </ul>

            <button 
              onClick={() => buy('premium')} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Memproses...' : 'Beli via QRIS'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
