import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();

    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) {
        return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    const trxId = `ORDER-${Math.floor(Math.random() * 1000000)}`;

    // Persiapan Data
    const payload = {
      key: config.pakasir.secret, 
      sign: config.pakasir.secret, // Kadang butuh sign, kita isi key dulu
      code: 'QRIS', 
      amount: prices[plan],
      sender: '628123456789', 
      partner_trxid: trxId,
      callback_url: `${config.app.baseUrl}/api/webhook`,
      email: "customer@example.com" 
    };

    console.log("🚀 Mengirim ke Pakasir (Form Data)...", payload);

    // --- PERUBAHAN UTAMA DISINI ---
    // Kita ubah jadi x-www-form-urlencoded biar server PHP bisa baca
    const formBody = new URLSearchParams(payload).toString();

    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // <--- Ganti Header
      },
      body: formBody // <--- Kirim sebagai Form String
    });

    const data = await res.json();
    console.log("📦 Respon Pakasir:", data);

    // Cek error dari API Pakasir
    // Biasanya kalau sukses ada field 'status': true atau 'url'
    if (!data.status && !data.url && !data.pay_url && data.success !== true) {
        // Kita kirim balik pesan error aslinya biar lu tau salahnya dimana
        return NextResponse.json({ 
            error: "Gagal dari Pakasir", 
            message: data.message || "Respon tidak dikenali",
            details: data 
        }, { status: 500 });
    }

    // Ambil URL (Coba berbagai kemungkinan nama field)
    const paymentLink = data.url || data.pay_url || data.data?.url;

    return NextResponse.json({ payment_url: paymentLink });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
