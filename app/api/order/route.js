import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();

    // Setting Harga
    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) {
        return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    // Request ke Pakasir
    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pakasir.secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: prices[plan],
        description: `Panel ${plan}`,
        metadata: { plan },
        callback_url: `${config.app.baseUrl}/api/webhook`
      })
    });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json({ error: "Gagal dari Pakasir", details: data }, { status: 500 });
    }

    return NextResponse.json({ payment_url: data.payment_url });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
