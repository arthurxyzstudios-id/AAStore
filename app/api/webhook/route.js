import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const payload = await req.json();

    // Sesuaikan dengan status payment dari Pakasir (biasanya 'PAID' atau 'COMPLETED')
    if (payload.status !== 'PAID') {
      return NextResponse.json({ message: 'Payment not finished' });
    }

    const plan = payload.metadata?.plan;
    const email = payload.customer?.email || `user_${Math.floor(Math.random() * 1000)}@store.com`;
    
    const plans = {
      basic: { ram: 2048, cpu: 100, disk: 10240 },
      premium: { ram: 8192, cpu: 300, disk: 40960 }
    };

    const spec = plans[plan];
    if (!spec) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    // 1. Create User (atau cari yang sudah ada)
    const userRes = await fetch(`${process.env.PTERODACTYL_URL}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: email.split('@')[0] + Math.floor(Math.random() * 100),
        first_name: 'Customer',
        last_name: plan
      })
    });

    const userData = await userRes.json();
    const userId = userData.attributes?.id;

    if (!userId) throw new Error('Gagal membuat user di Pterodactyl');

    // 2. Create Server
    // CATATAN: Ganti allocation, nest, dan egg sesuai ID di panel lo!
    const serverRes = await fetch(`${process.env.PTERODACTYL_URL}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: `Server-${plan}-${Date.now()}`,
        user: userId,
        egg: 1, // Pastikan ID Egg bener
        nest: 1, // Pastikan ID Nest bener
        docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
        startup: "npm start",
        environment: { "PORT": "8080" },
        limits: { memory: spec.ram, cpu: spec.cpu, disk: spec.disk, swap: 0, io: 500 },
        feature_limits: { databases: 1, backups: 1, allocations: 1 },
        allocation: { default: 1 } // Pastikan ID Allocation yang kosong tersedia!
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
