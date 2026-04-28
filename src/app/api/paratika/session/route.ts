import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, customerName, customerSurname, customerEmail, customerPhone } = body;

    // Zorunlu alan validasyonu — Paratika boş MERCHANTPAYMENTID veya AMOUNT=0 reddeder
    if (!orderId || String(orderId).trim() === "") {
      console.error('[paratika/session] orderId boş — isteği durdur');
      return NextResponse.json({ error: 'orderId_bos' }, { status: 400 });
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.error('[paratika/session] Geçersiz amount:', amount);
      return NextResponse.json({ error: 'gecersiz_tutar' }, { status: 400 });
    }
    const amountStr = amountNum.toFixed(2);

    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const customerIp = rawIp.split(',')[0].trim() || '127.0.0.1';
    console.log('[paratika/session] istek:', { orderId, amount: amountStr, customerEmail, customerIp, rawIp });

    const params = new URLSearchParams();
    params.append('MERCHANT', '10008941');
    params.append('MERCHANTUSER', 'myloungers.info@gmail.com');
    params.append('MERCHANTPASSWORD', process.env.PARATIKA_PASSWORD!);
    params.append('ACTION', 'SESSIONTOKEN');
    params.append('SESSIONTYPE', 'PAYMENTSESSION');
    params.append('RETURNURL', 'https://myloungers.com/api/paratika/callback');
    params.append('MERCHANTPAYMENTID', String(orderId).trim());
    params.append('AMOUNT', amountStr);
    const orderItems = JSON.stringify([{
      productCode: String(orderId).trim(),
      sellerId: "10008941",
      name: "Şezlong Rezervasyonu",
      description: "Myloungers şezlong rezervasyonu",
      quantity: 1,
      amount: amountStr,
    }]);
    params.append('ORDERITEMS', orderItems);
    params.append('CURRENCY', 'TRY');
    params.append('CUSTOMER', customerEmail || '');
    params.append('CUSTOMERNAME', `${customerName || ''} ${customerSurname || ''}`.trim());
    params.append('CUSTOMEREMAIL', customerEmail || '');
    params.append('CUSTOMERPHONE', customerPhone || '');
    params.append('CUSTOMERIP', customerIp);
    params.append('BILLTOADDRESSLINE', 'Türkiye');
    params.append('BILLTOCITY', 'Muğla');
    params.append('BILLTOCOUNTRY', 'TR');
    params.append('BILLTOPOSTALCODE', '48400');
    params.append('BILLTOPHONE', customerPhone || '');
    params.append('SHIPTOADDRESSLINE', 'Türkiye');
    params.append('SHIPTOCITY', 'Muğla');
    params.append('SHIPTOCOUNTRY', 'TR');
    params.append('SHIPTOPOSTALCODE', '48400');
    params.append('SHIPTOPHONE', customerPhone || '');

    const response = await fetch('https://vpos.paratika.com.tr/paratika/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const text = await response.text();
    console.log('[paratika/session] Paratika yanıtı:', text);

    let data: Record<string, unknown>;
    try { data = JSON.parse(text); } catch { return NextResponse.json({ error: 'parse_error', raw: text }, { status: 500 }); }

    if (data.responseCode === '00' && data.sessionToken) {
      console.log('[paratika/session] sessionToken alındı, orderId:', orderId);
      return NextResponse.json({ sessionToken: data.sessionToken });
    } else {
      console.error('[paratika/session] Paratika hata:', {
        responseCode: data.responseCode,
        errorMsg: data.errorMsg,
        responseDesc: data.responseDesc,
        orderId,
        amount: amountStr,
      });
      return NextResponse.json(
        { error: String(data.errorMsg || data.responseDesc || 'token_error'), responseCode: data.responseCode, raw: data },
        { status: 400 }
      );
    }
  } catch (err: any) {
    const isNetworkErr = err?.cause?.code === 'ECONNRESET' || err?.message?.includes('fetch failed');
    console.error('[paratika/session] beklenmeyen hata:', isNetworkErr ? 'ECONNRESET — Paratika sunucusuna ulaşılamadı (localhost kısıtlaması?)' : err);
    return NextResponse.json(
      { error: isNetworkErr ? 'Ödeme altyapısına bağlanılamadı. Lütfen production ortamında test edin.' : err.message },
      { status: 500 }
    );
  }
}
