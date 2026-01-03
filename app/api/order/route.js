// app/api/order/route.js
import { NextResponse } from 'next/server';
import config from '../../config';
import QRCode from 'qrcode'; // Pastikan sudah 'npm install qrcode'

export async function POST(req) {
  try {
    const { plan, name, email } = await req.json(); // Nerima nama & email user
    
    const product = config.products[plan];
    if (!product) return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 });

    // Generate Order ID a la Bot (ATHON-WEB-...)
    const orderId = `ATHON-WEB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const payload = {
      project: config.pakasir.project,
      order_id: orderId,
      amount: product.price,
      api_key: config.pakasir.secret,
      
      // Data tambahan seperti di bot
      customer_name: name || `User Web`,
      customer_email: email || `user-${orderId}@athon.id`,
      description: `Athon Hosting - ${product.name}`,
      qris_name: config.pakasir.qris_name,
      
      // Metadata penting buat Webhook nanti
      metadata: { 
          plan: plan,
          user_email: email || `user-${orderId}@athon.id`,
          user_name: name || 'Customer'
      }
    };

    console.log("🚀 Request Pakasir:", payload);

    const res = await fetch(config.pakasir.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.payment) {
        return NextResponse.json({ error: "Gagal dari Pakasir", details: data }, { status: 500 });
    }

    const qrRaw = data.payment.payment_number;
    
    // Generate QR Image (Buffer -> Base64) persis settingan bot
    const qrImage = await QRCode.toDataURL(qrRaw, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction seperti bot
        color: { dark: '#000000', light: '#ffffff' }
    });

    return NextResponse.json({ 
        success: true, 
        qr_image: qrImage,
        amount: data.payment.total_payment,
        trx_id: orderId,
        expired_at: data.payment.expired_at
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
