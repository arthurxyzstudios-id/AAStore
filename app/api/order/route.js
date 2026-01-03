import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const prices = { basic: 10000, premium: 40000 };

    // Gunakan VERCEL_URL atau domain custom lo
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const res = await fetch('https://app.pakasir.com/api/invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAKASIR_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: prices[plan],
        description: `Order Panel ${plan}`,
        metadata: { plan }, // Pastikan metadata dikirim sebagai object
        callback_url: `${baseUrl}/api/webhook`
      })
    });

    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || 'Gagal konek ke Pakasir');

    return NextResponse.json({ payment_url: data.payment_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
