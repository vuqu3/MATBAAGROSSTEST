import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'MatbaaGross <bildirim@matbaagross.com>';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.matbaagross.com';

export async function sendNewRfqNotification(opts: {
  to: string;
  productName: string;
  quantity: number;
  requestNo: string;
}) {
  const { to, productName, quantity, requestNo } = opts;
  const panelUrl = `${APP_URL}/seller-login`;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">MatbaaGross Premium</h1>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Üretici Bildirim Sistemi</p>
          </td>
        </tr>
        <!-- Alert Badge -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;border-radius:100px;padding:6px 14px;">
              <span style="color:#ea580c;font-size:13px;font-weight:700;">🔔 Yeni Premium Müşteri Talebi</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600;">Sayın Üreticimiz,</p>
            <p style="margin:12px 0 0;color:#475569;font-size:14px;line-height:1.6;">
              Sistemimize yeni bir özel üretim talebi düştü. Aşağıdaki detayları inceleyerek fiyat teklifinizi iletebilirsiniz.
            </p>
          </td>
        </tr>
        <!-- Details Card -->
        <tr>
          <td style="padding:20px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
              <tr>
                <td style="padding:18px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;">TALEP NO</span><br>
                        <span style="color:#0f172a;font-size:14px;font-weight:700;font-family:monospace;">${requestNo}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 6px;border-bottom:1px solid #e2e8f0;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;">ÜRÜN ADI</span><br>
                        <span style="color:#0f172a;font-size:15px;font-weight:700;">${productName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0 0;">
                        <span style="color:#64748b;font-size:12px;font-weight:600;">ADET</span><br>
                        <span style="color:#0f172a;font-size:15px;font-weight:700;">${quantity.toLocaleString('tr-TR')} adet</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;">
            <a href="${panelUrl}" style="display:inline-block;background:#FF6000;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
              Hemen Fiyat Verin →
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              Bu e-posta MatbaaGross Premium Üretici Ağı tarafından otomatik olarak gönderilmiştir.<br>
              © ${new Date().getFullYear()} MatbaaGross — Türkiye'nin Matbaa Platformu
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🔔 Yeni Premium Müşteri Talebi - Hemen Fiyat Verin! [${requestNo}]`,
      html,
    });
  } catch (err) {
    console.error('[sendNewRfqNotification] failed for', to, err);
  }
}

export async function sendAdminDisputeNotification(opts: {
  quoteId: string;
  reason: string;
  description: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'volkanongunn@gmail.com';
  const { quoteId, reason, description } = opts;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;">🚨 ACİL: Yeni anlaşmazlık talebi</h1>
            <p style="margin:6px 0 0;color:#fecaca;font-size:13px;">MatbaaGross Hakem Sistemi</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 0;">
            <p style="margin:0;color:#111827;font-size:14px;"><b>Teklif ID:</b> ${quoteId}</p>
            <p style="margin:10px 0 0;color:#111827;font-size:14px;"><b>Sebep:</b> ${reason}</p>
            <p style="margin:10px 0 0;color:#111827;font-size:14px;line-height:1.6;"><b>Açıklama:</b><br>${String(description || '').replace(/\n/g, '<br>')}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;">
            <a href="${APP_URL}/admin" style="display:inline-block;background:#dc2626;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:12px 18px;border-radius:10px;">Admin Paneline Git</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `🚨 ACİL: Yeni bir anlaşmazlık talebi oluşturuldu! [${quoteId}]`,
      html,
    });
  } catch (err) {
    console.error('[sendAdminDisputeNotification] failed for', adminEmail, err);
  }
}
