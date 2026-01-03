// app/api/order/route.js
import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();
    
    // Konfigurasi Harga
    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });

    const trxId = `INV-${Math.floor(Math.random() * 1000000)}`;

    const payload = {
      project: config.pakasir.project, 
      order_id: trxId,
      amount: prices[plan],
      api_key: config.pakasir.secret,
      // Metadata buat dikirim balik ke webhook nanti
      metadata: { plan: plan }
    };

    console.log("🚀 Request ke Pakasir:", payload);

    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.payment) {
        return NextResponse.json({ error: "Gagal dari Pakasir", details: data }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        qr_string: data.payment.payment_number, 
        amount: data.payment.total_payment,
        trx_id: trxId
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
