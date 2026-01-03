// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("🔔 Webhook Received:", payload);

    // 1. Cek Status Pembayaran
    if (payload.status !== 'PAID') {
        return NextResponse.json({ message: 'Ignored: Status not PAID' });
    }

    // Ambil data plan dari metadata (atau default basic)
    const plan = payload.metadata?.plan || 'basic';
    // Generate email dummy karena Pakasir qris kadang tidak bawa email
    const email = `user${Math.floor(Math.random() * 99999)}@client.com`;
    const username = `u${Math.floor(Math.random() * 999999)}`;

    const plans = {
      basic: { ram: 2048, cpu: 100, disk: 10240 },
      premium: { ram: 8192, cpu: 300, disk: 40960 }
    };

    const spec = plans[plan];

    // 2. CREATE USER PTERODACTYL
    console.log("Creating user Pterodactyl...");
    const userRes = await fetch(`${config.pterodactyl.host}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: 'Customer',
        last_name: 'AAStore'
      })
    });

    const userData = await userRes.json();
    
    // Cek jika user gagal dibuat
    if (userData.errors) {
        console.error("User Create Error:", userData.errors);
        return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    const userId = userData.attributes.id;

    // 3. CREATE SERVER
    console.log(`Creating server for User ID: ${userId}...`);
    const serverRes = await fetch(`${config.pterodactyl.host}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: `Server ${plan.toUpperCase()}`,
        user: userId,
        egg: 1,  // Pastikan ID EGG Nodejs/Bot benar (Default biasanya 1)
        nest: 1, // Pastikan ID NEST benar
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
        allocation: { default: 1 } 
      })
    });

    const serverData = await serverRes.json();
    
    if (serverData.errors) {
        console.error("Server Create Error:", serverData.errors);
        return NextResponse.json({ error: "Server creation failed" }, { status: 500 });
    }

    console.log("✅ Server Created Successfully:", serverData.attributes.uuid);
    return NextResponse.json({ success: true, server_id: serverData.attributes.id });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
