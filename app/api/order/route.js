// app/api/order/route.js
import { NextResponse } from 'next/server';
import config from '../../config';
import QRCode from 'qrcode'; // Import library yang baru diinstall

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });

    const trxId = `INV-${Math.floor(Math.random() * 1000000)}`;

    const payload = {
      project: config.pakasir.project, 
      order_id: trxId,
      amount: prices[plan],
      api_key: config.pakasir.secret,
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

    // --- BAGIAN FIX QRIS ---
    const qrRaw = data.payment.payment_number; // String mentah QRIS
    
    // Kita generate gambar QR High Quality di sini
    const qrImage = await QRCode.toDataURL(qrRaw, {
        errorCorrectionLevel: 'M', // Level M paling cocok buat QRIS
        margin: 2,                 // Memberi jarak putih biar kamera gampang baca
        width: 400,                // Resolusi besar biar tajam
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    return NextResponse.json({ 
        success: true, 
        qr_image: qrImage, // Mengirim gambar langsung
        qr_raw: qrRaw,     // Mengirim string mentah (backup)
        amount: data.payment.total_payment,
        trx_id: trxId
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
