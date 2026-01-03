export default function Home() {
  async function buy(plan) {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    window.location.href = data.payment_url;
  }

  return (
    <main className="container">
      <h1>⚡ Panel Pterodactyl</h1>

      <div className="cards">
        <div className="card">
          <h2>Basic</h2>
          <p>RAM 2GB • CPU 100%</p>
          <h3>Rp 10.000</h3>
          <button onClick={() => buy('basic')}>Beli</button>
        </div>

        <div className="card">
          <h2>Premium</h2>
          <p>RAM 8GB • CPU 300%</p>
          <h3>Rp 40.000</h3>
          <button onClick={() => buy('premium')}>Beli</button>
        </div>
      </div>
    </main>
  );
}
