// app/page.jsx
"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [status, setStatus] = useState("");
  const [trxId, setTrxId] = useState("");
  const [amount, setAmount] = useState(0);
  
  // Input User
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleOrder = async (planKey) => {
    if (!email || !name) {
        alert("Mohon isi Nama dan Email dulu!");
        return;
    }

    setLoading(true);
    setStatus("Menghubungkan ke Pakasir...");
    setQrImage(null);

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            plan: planKey,
            name: name,
            email: email
        })
      });

      const data = await res.json();

      if (data.success && data.qr_image) {
        setQrImage(data.qr_image);
        setTrxId(data.trx_id);
        setAmount(data.amount);
        setStatus(`Scan QRIS di bawah`);
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
        <h1 className="title">ATHON MINECRAFT</h1>
        <p className="subtitle">Instant Server Hosting</p>

        {qrImage ? (
          <div className="card" style={{ margin: '0 auto', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '10px' }}>Pembayaran</h2>
            <div style={{ background: 'white', padding: '10px', margin: '20px auto', width: 'fit-content', borderRadius: '10px' }}>
                <img src={qrImage} alt="QRIS" style={{width: '250px'}} />
            </div>
            <p className="price" style={{fontSize: '1.5rem'}}>Rp {amount.toLocaleString('id-ID')}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Order ID: {trxId}</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#fbbf24' }}>
                Cek email <b>{email}</b> setelah pembayaran sukses untuk detail login panel.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
              Buat Pesanan Baru
            </button>
          </div>
        ) : (
          <div>
            <div className="form-container" style={{ marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px auto' }}>
                <input 
                    type="text" 
                    placeholder="Nama Anda" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <input 
                    type="email" 
                    placeholder="Email (Untuk Login Panel)" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div className="grid">
                {/* Looping dari config (manual disini biar gampang styled) */}
                <div className="card">
                    <h2>BASIC</h2>
                    <div className="price">Rp 10.000</div>
                    <ul className="features">
                        <li>RAM 2 GB</li>
                        <li>Disk 5 GB</li>
                        <li>CPU 100%</li>
                    </ul>
                    <button className="btn" onClick={() => handleOrder('basic')} disabled={loading}>
                        {loading ? '...' : 'Pilih Basic'}
                    </button>
                </div>

                <div className="card premium">
                    <div className="badge gold">BEST SELLER</div>
                    <h2>PREMIUM</h2>
                    <div className="price">Rp 25.000</div>
                    <ul className="features">
                        <li>RAM 4 GB</li>
                        <li>Disk 10 GB</li>
                        <li>CPU 200%</li>
                    </ul>
                    <button className="btn btn-primary" onClick={() => handleOrder('premium')} disabled={loading}>
                        {loading ? '...' : 'Pilih Premium'}
                    </button>
                </div>

                <div className="card">
                    <h2>SULTAN</h2>
                    <div className="price">Rp 50.000</div>
                    <ul className="features">
                        <li>RAM 8 GB</li>
                        <li>Disk 25 GB</li>
                        <li>CPU 400%</li>
                    </ul>
                    <button className="btn" onClick={() => handleOrder('sultan')} disabled={loading}>
                        {loading ? '...' : 'Pilih Sultan'}
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: '#1e293b',
    color: 'white',
    outline: 'none'
};
