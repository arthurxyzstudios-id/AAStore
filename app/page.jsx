"use client";

export default function Home() {
  async function buy(plan) {
    try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ plan })
        });
        
        const data = await res.json();
        
        if (data.payment_url) {
            window.location.href = data.payment_url;
        } else {
            alert("Gagal order: " + JSON.stringify(data));
        }
    } catch (e) {
        alert("Error: " + e.message);
    }
  }

  return (
    <main style={{textAlign:'center', padding:'50px', background:'#222', color:'white', minHeight:'100vh'}}>
      <h1>⚡ STORE PANEL</h1>
      <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
        
        <div style={{border:'1px solid #555', padding:'20px', borderRadius:'10px'}}>
          <h2>Basic</h2>
          <p>Rp 10.000</p>
          <button onClick={() => buy('basic')} style={{padding:'10px', cursor:'pointer'}}>Beli Basic</button>
        </div>

        <div style={{border:'1px solid #555', padding:'20px', borderRadius:'10px'}}>
          <h2>Premium</h2>
          <p>Rp 40.000</p>
          <button onClick={() => buy('premium')} style={{padding:'10px', cursor:'pointer'}}>Beli Premium</button>
        </div>

      </div>
    </main>
  );
}
