"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null); // State buat nyimpen gambar QR
  const [paymentData, setPaymentData] = useState(null);

  async function buy(plan) {
    if (loading) return;
    setLoading(true);
    setQrCode(null); // Reset QR lama

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (data.success && data.qr_string) {
        // Tampilkan QR Code di halaman ini
        setPaymentData(data);
        setQrCode(data.qr_string);
      } else {
        alert("Gagal: " + JSON.stringify(data));
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main-container">
      <div className="content">
        <h1 className="title">⚡ STORE PANEL</h1>

        {/* JIKA QR CODE SUDAH MUNCUL */}
        {qrCode ? (
           <div className="card" style={{margin:'0 auto', width:'400px', borderColor:'#4ade80'}}>
             <h2>Silakan Scan QRIS</h2>
             <p style={{marginBottom:'10px'}}>Total: Rp {paymentData.amount.toLocaleString()}</p>
             
             {/* Generate Gambar QR dari String Pakasir */}
             <div style={{background:'white', padding:'10px', borderRadius:'10px', margin:'20px 0'}}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`} 
                  alt="QRIS Code" 
                  style={{width:'100%'}}
                />
             </div>
             
             <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>Order ID: {paymentData.trx_id}</p>
             <button onClick={() => window.location.reload()} className="btn" style={{marginTop:'20px'}}>
               Refresh / Transaksi Baru
             </button>
           </div>
        ) : (
          /* PILIHAN PLAN */
          <div className="grid">
            <div className="card">
              <div className="badge">POPULAR</div>
              <h2>Basic Plan</h2>
              <div className="price">Rp 10.000</div>
              <button onClick={() => buy('basic')} disabled={loading} className="btn">
                {loading ? 'Loading...' : 'Beli via QRIS'}
              </button>
            </div>

            <div className="card premium">
              <div className="badge gold">SULTAN</div>
              <h2>Premium Plan</h2>
              <div className="price">Rp 40.000</div>
              <button onClick={() => buy('premium')} disabled={loading} className="btn btn-primary">
                {loading ? 'Loading...' : 'Beli via QRIS'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
