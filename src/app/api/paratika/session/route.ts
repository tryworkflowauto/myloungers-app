import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, customerName, customerSurname, customerEmail, customerPhone } = body;

    const orderItems = JSON.stringify([{
      productCode: orderId,
      name: "Şezlong Rezervasyonu",
      description: "Myloungers şezlong rezervasyonu",
      quantity: 1,
      amount: parseFloat(amount)
    }]);

    const params = new URLSearchParams();
    params.append('MERCHANT', '10008941');
    params.append('MERCHANTUSER', 'mail@bgs.io');
    params.append('MERCHANTPASSWORD', '*ReklamotvReklamotv321');
    params.append('ACTION', 'SESSIONTOKEN');
    params.append('SESSIONTYPE', 'PAYMENTSESSION');
    params.append('RETURNURL', 'https://myloungers.com/api/paratika/callback');
    params.append('MERCHANTPAYMENTID', orderId);
    params.append('AMOUNT', parseFloat(amount).toFixed(2));
    params.append('CURRENCY', 'TRY');
    params.append('ORDERITEMS', encodeURIComponent(orderItems));
    params.append('CUSTOMER', customerEmail);
    params.append('CUSTOMERNAME', `${customerName} ${customerSurname}`);
    params.append('CUSTOMEREMAIL', customerEmail);
    params.append('CUSTOMERPHONE', customerPhone);
    params.append('CUSTOMERIP', req.headers.get('x-forwarded-for') || '127.0.0.1');
    params.append('BILLTOADDRESSLINE', 'Türkiye');
    params.append('BILLTOCITY', 'Muğla');
    params.append('BILLTOCOUNTRY', 'TR');
    params.append('BILLTOPOSTALCODE', '48400');
    params.append('BILLTOPHONE', customerPhone);
    params.append('SHIPTOADDRESSLINE', 'Türkiye');
    params.append('SHIPTOCITY', 'Muğla');
    params.append('SHIPTOCOUNTRY', 'TR');
    params.append('SHIPTOPOSTALCODE', '48400');
    params.append('SHIPTOPHONE', customerPhone);

    const response = await fetch('https://vpos.paratika.com.tr/paratika/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const text = await response.text();
    console.log('[paratika/session] response:', text);

    let data;
    try { data = JSON.parse(text); } catch { return NextResponse.json({ error: 'parse_error', raw: text }, { status: 500 }); }

    if (data.responseCode === '00' && data.sessionToken) {
      return NextResponse.json({ sessionToken: data.sessionToken });
    } else {
      return NextResponse.json({ error: data.errorMsg || 'token_error', raw: data }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[paratika/session] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
