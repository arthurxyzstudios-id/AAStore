import { NextResponse } from 'next/server';

export async function POST(req) {
  const payload = await req.json();

  // 1. Validasi status
  if (payload.status !== 'PAID') {
    return NextResponse.json({ ok: true });
  }

  // 2. Ambil data order
  const plan = payload.metadata?.plan;
  const email = payload.customer?.email || `user${Date.now()}@mail.com`;

  // 3. Mapping plan
  const plans = {
    basic: { ram: 2048, cpu: 100, disk: 10240 },
    premium: { ram: 8192, cpu: 300, disk: 40960 }
  };

  const spec = plans[plan];
  if (!spec) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // 4. Create user Pterodactyl
  const userRes = await fetch(
    `${process.env.PTERODACTYL_URL}/api/application/users`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        username: email.split('@')[0],
        first_name: 'User',
        last_name: 'Panel'
      })
    }
  );

  const user = await userRes.json();

  // 5. Create server
  await fetch(
    `${process.env.PTERODACTYL_URL}/api/application/servers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Panel-${plan}`,
        user: user.attributes.id,
        egg: 1,
        docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
        startup: "npm start",
        environment: {},
        limits: {
          memory: spec.ram,
          cpu: spec.cpu,
          disk: spec.disk,
          swap: 0,
          io: 500
        },
        feature_limits: {
          databases: 1,
          backups: 1
        },
        allocation: {
          default: 1
        }
      })
    }
  );

  return NextResponse.json({ success: true });
}
