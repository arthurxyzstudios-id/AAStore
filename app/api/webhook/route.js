import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const payload = await req.json();

    // Cek status pembayaran (Pakasir biasanya kirim status 'PAID')
    if (payload.status !== 'PAID') {
        return NextResponse.json({ message: 'Belum dibayar' });
    }

    const plan = payload.metadata?.plan;
    const email = payload.customer?.email || `user${Math.floor(Math.random() * 9999)}@client.com`;

    // Setting Spesifikasi Server
    const plans = {
      basic: { ram: 2048, cpu: 100, disk: 10240 },   // 2GB RAM
      premium: { ram: 8192, cpu: 300, disk: 40960 }  // 8GB RAM
    };

    const spec = plans[plan];
    if (!spec) return NextResponse.json({ error: 'Plan invalid' }, { status: 400 });

    // 1. BIKIN USER PTERODACTYL
    const userRes = await fetch(`${config.pterodactyl.host}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: email.split('@')[0].substring(0, 8) + Math.floor(Math.random() * 1000),
        first_name: 'Customer',
        last_name: plan
      })
    });

    const userData = await userRes.json();
    
    // Kalau user udah ada, kita ambil ID-nya dari error atau database (simple logic: ambil id dari response)
    let userId = userData.attributes?.id;

    // Kalau error karena email sama, cari usernya (Logic tambahan opsional, anggap sukses dulu)
    if (!userId) {
        // Fallback kalau user gagal dibuat (misal duplikat), return success biar gak looping webhook
        console.error("Gagal buat user:", userData);
        return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    // 2. BIKIN SERVER
    const serverRes = await fetch(`${config.pterodactyl.host}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: `Server-${plan}-${userId}`,
        user: userId,
        egg: 1,  // <--- PASTIKAN ID EGG INI BENAR (Default Nodejs/Pterodactyl biasanya 1 atau 5)
        nest: 1, // <--- PASTIKAN ID NEST INI BENAR
        docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
        startup: "npm start",
        environment: { "PORT": "8080" },
        limits: { 
            memory: spec.ram, 
            cpu: spec.cpu, 
            disk: spec.disk, 
            swap: 0, 
            io: 500 
        },
        feature_limits: { databases: 1, backups: 1, allocations: 1 },
        allocation: { default: 1 } // <--- Server harus punya IP kosong
      })
    });

    const serverData = await serverRes.json();
    console.log("Server Created:", serverData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
