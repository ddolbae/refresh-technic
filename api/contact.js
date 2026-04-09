export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, email, message } = req.body || {};
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'missing fields' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL = process.env.ALERT_EMAIL || 'refreshtechnic@gmail.com';

  const html = `
    <h2>📋 새 문의가 접수되었습니다</h2>
    <table style="border-collapse:collapse;width:100%;max-width:480px">
      <tr><td style="padding:10px;background:#f5f5f5;font-weight:700;width:100px">이름</td><td style="padding:10px;border:1px solid #e0e0e0">${name}</td></tr>
      <tr><td style="padding:10px;background:#f5f5f5;font-weight:700">연락처</td><td style="padding:10px;border:1px solid #e0e0e0">${phone}</td></tr>
      <tr><td style="padding:10px;background:#f5f5f5;font-weight:700">이메일</td><td style="padding:10px;border:1px solid #e0e0e0">${email || '미제공'}</td></tr>
      <tr><td style="padding:10px;background:#f5f5f5;font-weight:700">문의 내용</td><td style="padding:10px;border:1px solid #e0e0e0;white-space:pre-wrap">${message}</td></tr>
    </table>
    <p style="margin-top:16px;color:#888;font-size:13px">REFRESH TECHNIC 랜딩페이지 문의 폼</p>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'REFRESH TECHNIC <onboarding@resend.dev>',
        to: TO_EMAIL,
        subject: `[문의] ${name} — ${phone}`,
        html
      })
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'email failed' });
  }
}
