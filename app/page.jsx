// app/page.jsx
"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [status, setStatus] = useState("");
  const [trxId, setTrxId] = useState("");

  const handleOrder = async (plan) => {
    setLoading(true);
    setStatus("Sedang membuat tagihan...");
    setQrImage(null);

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (data.success && data.qr_image) {
        setQrImage(data.qr_image); // Langsung pakai gambar dari server
        setTrxId(data.trx_id);
        setStatus(`Scan QRIS di bawah (Rp ${data.amount.toLocaleString('id-ID')})`);
      } else {
        setStatus(`Gagal: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="content">
        <h1 className="title">AA STORE</h1>
        <p className="subtitle">Hosting Pterodactyl Otomatis</p>

        {qrImage ? (
          <div className="card" style={{ margin: '0 auto', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '10px' }}>Pembayaran</h2>
            <p style={{ color: '#fbbf24', fontWeight: 'bold' }}>{status}</p>
            
            {/* Tampilan QR */}
            <div style={{ background: 'white', padding: '15px', margin: '20px auto', width: 'fit-content', borderRadius: '15px' }}>
                <img src={qrImage} alt="QRIS" style={{ width: '100%', maxWidth: '250px', display: 'block' }} />
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Order ID: {trxId}</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Server akan otomatis aktif setelah pembayaran berhasil.</p>
            
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
              Kembali
            </button>
          </div>
        ) : (
          <div className="grid">
            {/* PLAN BASIC */}
            <div className="card">
              <h2>Basic Plan</h2>
              <div className="price">Rp 10.000<span>/bulan</span></div>
              <ul className="features">
                <li>RAM: 2 GB</li>
                <li>CPU: 100%</li>
                <li>Disk: 10 GB</li>
              </ul>
              <button className="btn" onClick={() => handleOrder('basic')} disabled={loading}>
                {loading ? 'Loading...' : 'Beli Basic'}
              </button>
            </div>

            {/* PLAN PREMIUM */}
            <div className="card premium">
              <div className="badge gold">POPULAR</div>
              <h2>Premium Plan</h2>
              <div className="price">Rp 40.000<span>/bulan</span></div>
              <ul className="features">
                <li>RAM: 8 GB</li>
                <li>CPU: 300%</li>
                <li>Disk: 40 GB</li>
              </ul>
              <button className="btn btn-primary" onClick={() => handleOrder('premium')} disabled={loading}>
                {loading ? 'Loading...' : 'Beli Premium'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
