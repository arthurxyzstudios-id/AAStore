// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("🔔 Webhook Masuk:", payload.order_id);

    if (payload.status !== 'PAID') {
        return NextResponse.json({ message: 'Belum lunas' });
    }

    // Ambil data dari metadata yang kita kirim pas order
    const planKey = payload.metadata?.plan || 'basic';
    const email = payload.metadata?.user_email;
    const name = payload.metadata?.user_name;
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 10) + Math.floor(Math.random()*100);

    const product = config.products[planKey];
    if (!product) return NextResponse.json({ error: 'Plan invalid' }, { status: 400 });

    // 1. CREATE USER PTERODACTYL
    // Kita coba bikin user. Kalau email udah ada, API biasanya error.
    // Di logic bot kamu hardcode user:1, tapi di web user harus punya akun sendiri biar aman.
    
    console.log(`👤 Creating user: ${email}...`);
    let userId;

    // Cek user dulu (Search by email) - Fitur tambahan biar ga error kalau user beli 2x
    const searchRes = await fetch(`${config.pterodactyl.host}/api/application/users?filter[email]=${encodeURIComponent(email)}`, {
        headers: { 'Authorization': `Bearer ${config.pterodactyl.key}`, 'Accept': 'application/json' }
    });
    const searchData = await searchRes.json();

    if (searchData.data && searchData.data.length > 0) {
        // User udah ada
        userId = searchData.data[0].attributes.id;
        console.log(`✅ User sudah ada. ID: ${userId}`);
    } else {
        // User belum ada, bikin baru
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
            first_name: name,
            last_name: 'Customer'
          })
        });
        const userData = await userRes.json();
        if (userData.errors) {
             console.error("Gagal buat user:", userData.errors);
             // Fallback ke user admin (ID 1) kalau gagal total (mirip bot)
             userId = 1; 
        } else {
             userId = userData.attributes.id;
        }
    }

    // 2. CREATE SERVER MINECRAFT
    // Logic ini diambil dari fungsi createPterodactylServer di bot
    console.log(`🎮 Creating Minecraft Server for User ${userId}...`);
    
    const serverPayload = {
        name: `${product.name} - ${payload.order_id}`,
        user: userId,
        egg: config.pterodactyl.egg_id,    // Ambil ID Egg Minecraft dari config
        nest: config.pterodactyl.nest_id,
        docker_image: config.pterodactyl.docker_image,
        startup: config.pterodactyl.startup,
        environment: { 
            "SERVER_JARFILE": "server.jar",
            "MINECRAFT_VERSION": "latest",
            "EULA": "true", // Auto accept EULA Minecraft
            "SERVER_MEMORY": product.ram.toString()
        },
        limits: { 
            memory: product.ram, 
            cpu: product.cpu, 
            disk: product.disk, 
            swap: 0, 
            io: 500 
        },
        feature_limits: { databases: 1, backups: 1, allocations: 1 },
        allocation: { default: 1 },
        deploy: {
            locations: [config.pterodactyl.location_id],
            dedicated_ip: false,
            port_range: []
        }
    };

    const serverRes = await fetch(`${config.pterodactyl.host}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pterodactyl.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(serverPayload)
    });

    const serverData = await serverRes.json();
    
    if (serverData.errors) {
        console.error("Server Create Error:", JSON.stringify(serverData.errors, null, 2));
        return NextResponse.json({ error: "Server creation failed" }, { status: 500 });
    }

    console.log("✅ Server Created Successfully:", serverData.attributes.identifier);
    return NextResponse.json({ success: true, server_id: serverData.attributes.id });

  } catch (error) {
    console.error("🔥 System Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
