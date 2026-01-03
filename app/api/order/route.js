import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) return NextResponse.json({ error: "Plan Invalid" }, { status: 400 });

    const trxId = `INV-${Math.floor(Math.random() * 1000000)}`;

    // SESUAI DOKUMENTASI TERBARU
    const payload = {
      project: config.pakasir.project, // Dari config
      order_id: trxId,
      amount: prices[plan],
      api_key: config.pakasir.secret
    };

    console.log("🚀 Request ke Pakasir:", payload);

    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Docs minta JSON
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("📦 Respon Pakasir:", data);

    // Cek apakah ada object 'payment' di respon
    if (!data.payment) {
        return NextResponse.json({ error: "Gagal ambil QRIS", details: data }, { status: 500 });
    }

    // Ambil string mentah QRIS (payment_number)
    const qrString = data.payment.payment_number;

    return NextResponse.json({ 
        success: true, 
        qr_string: qrString, // Kita kirim kode QR mentah ke frontend
        amount: data.payment.total_payment,
        trx_id: trxId
    });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
