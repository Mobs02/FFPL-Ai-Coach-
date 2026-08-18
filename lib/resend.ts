import { Resend } from "resend";

// Sends from Resend's shared onboarding@resend.dev address until a verified
// domain is added — swap this once one's available for a properly branded
// sender instead.
const FROM = "SquadScout AI <onboarding@resend.dev>";

export async function sendDeadlineReminder(
  email: string,
  hoursRemaining: number,
  gameweek: number,
  gwPoints: number,
  freeTransfers: number,
  topTip: string | null,
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set — skipping deadline reminder email.");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Email clients (especially Outlook) strip <style> blocks and ignore most
  // CSS — inline styles and table-based layout are the reliable approach.
  const teaserBlock = topTip
    ? `<tr><td style="padding:0 28px 16px;">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fff6e8,#fff);border:1px solid #f2d9a8;border-radius:10px;">
           <tr><td style="padding:12px 14px;">
             <span style="display:inline-block;background:#f0a93a;color:#4a2c02;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;text-transform:uppercase;margin-bottom:6px;">AI suggestion</span>
             <p style="margin:0;font-size:13px;line-height:1.5;color:#4a3a1a;">${topTip}</p>
           </td></tr>
         </table>
       </td></tr>`
    : ""; // no teaser if the recommendation hasn't generated yet for this gameweek

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Gameweek ${gameweek} deadline in ${Math.round(hoursRemaining)}h`,
    html: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;">
        <tr><td style="background:#37003c;padding:24px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;">
                <img src="${appUrl}/logo-icon.png" width="30" height="30" alt="" style="display:block;border-radius:7px;">
              </td>
              <td style="font-family:Arial,sans-serif;font-weight:700;font-size:17px;color:#ffffff;">
                SquadScout<span style="color:#00ff85;"> AI</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#c1554a;text-transform:uppercase;">Deadline reminder</p>
          <h1 style="margin:0 0 16px;font-size:20px;color:#1a0c1d;">Gameweek ${gameweek} deadline in ${Math.round(hoursRemaining)} hours</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4a3a4d;">Make sure your squad's set before then. Last gameweek: <b>${gwPoints} pts</b>, free transfers available: <b>${freeTransfers}</b>.</p>
        </td></tr>
        ${teaserBlock}
        <tr><td style="padding:0 28px 28px;">
          <a href="${appUrl}" style="display:block;text-align:center;background:#37003c;color:#fff;text-decoration:none;font-weight:600;padding:13px;border-radius:8px;">View full suggestions</a>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f8f5f9;font-size:11.5px;color:#9a8a9e;">
          You're receiving this because deadline reminders are on for your account. <a href="${appUrl}/settings" style="color:#6b5a70;">Turn off reminders</a>
        </td></tr>
      </table>
    `,
  });
}
