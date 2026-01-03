import { NextResponse } from 'next/server';

export async function POST(req) {
  const { plan } = await req.json();

  const prices = { basic: 10000, premium: 40000 };

  const res = await fetch('https://app.pakasir.com/api/invoice', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAKASIR_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: prices[plan],
      description: `Panel ${plan}`,
      metadata: { plan },
      callback_url: "https://https://aa-store-two.vercel.app/api/webhook"
    })
  });

  const data = await res.json();

  // FIX: pakai NextResponse
  return NextResponse.json({ payment_url: data.payment_url });
}
