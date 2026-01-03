import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();

    // 1. Cek Plan & Harga
    const prices = { basic: 10000, premium: 40000 };
    if (!prices[plan]) {
        return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    // 2. Bikin ID Transaksi
    const trxId = `INV-${Math.floor(Math.random() * 1000000)}`;

    // 3. Susun Data (HARDCODE PROJECT NAME)
    const payload = {
      // Wajib diisi string 'depodomain' (kecuali lu udah ganti nama project di dashboard Pakasir)
      project: 'arthurxyz-studios', 
      
      order_id: trxId,
      amount: prices[plan],
      api_key: config.pakasir.secret // Pastikan ini ngambil API Key yang bener dari config
    };

    console.log("🚀 Mengirim Request ke Pakasir:", payload);

    // 4. Kirim ke Pakasir (Format JSON)
    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("📦 Respon Pakasir:", data);

    // 5. Validasi Respon
    // Kalau gagal, kita lempar error biar tau alasannya
    if (!data.payment) {
        return NextResponse.json({ 
            error: "Gagal ambil QRIS", 
            details: data 
        }, { status: 500 });
    }

    // 6. Sukses - Kirim data ke Frontend
    return NextResponse.json({ 
        success: true, 
        qr_string: data.payment.payment_number, // Ini kode QR mentah buat di-generate jadi gambar
        amount: data.payment.total_payment,
        trx_id: trxId
    });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
