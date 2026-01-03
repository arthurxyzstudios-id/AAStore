import { NextResponse } from 'next/server';
import config from '../../config';

export async function POST(req) {
  try {
    const { plan } = await req.json();

    // 1. Setting Harga
    const prices = { basic: 10000, premium: 40000 };
    
    if (!prices[plan]) {
        return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
    }

    // Buat ID Transaksi Unik biar gak bentrok
    const trxId = `ORDER-${Math.floor(Math.random() * 1000000)}`;

    // 2. Siapkan Data untuk Pakasir (Format QRIS)
    const payload = {
      key: config.pakasir.secret, // <--- API Key masuk sini
      sign: config.pakasir.secret, // Kadang butuh param 'sign' atau 'password' isinya key juga
      
      code: 'QRIS', // <--- INI KUNCINYA BIAR JADI QRIS
      
      amount: prices[plan],
      sender: '628123456789', // Nomor HP dummy (wajib format 62)
      partner_trxid: trxId,   // ID Unik Orderan
      
      // Data tambahan buat Webhook nanti (disimpan di metadata/callback)
      callback_url: `${config.app.baseUrl}/api/webhook`,
      email: "customer@toko.com" 
    };

    console.log("Mengirim request ke Pakasir...", payload);

    // 3. Tembak API
    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Respon Pakasir:", data);

    // 4. Cek Error
    if (!data.success && !data.url && !data.data?.url) {
        return NextResponse.json({ error: "Gagal buat QRIS", details: data }, { status: 500 });
    }

    // 5. Ambil URL Pembayaran
    // Pakasir kadang balikin linknya di `data.url`, `data.pay_url`, atau `url` langsung
    const paymentLink = data.url || data.data?.url || data.pay_url;

    // Simpan plan di database sementara atau kirim lewat query params (karena QRIS statis susah bawa metadata)
    // Tapi untuk direct link, biasanya aman.
    
    return NextResponse.json({ payment_url: paymentLink });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
