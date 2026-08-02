// Shared Vlitrix email design system.
// Brand: black (#000000) + signal green (#00FF84).

const SITE_URL =
  Deno.env.get("SITE_URL") ||
  "https://id-preview--e645f6ea-1ee3-48c1-a6a5-455e3548546e.lovable.app";

export const BRAND = {
  black: "#0A0A0A",
  green: "#00FF84",
  ink: "#111111",
  body: "#4A4A4A",
  muted: "#8A8A8A",
  hairline: "#E6E6E6",
  surface: "#FAFAFA",
  page: "#F2F3F2",
  logoLight: `${SITE_URL}/email-logo-light.png`,
  logoDark: `${SITE_URL}/email-logo-dark.png`,
  site: SITE_URL,
};

const FONT =
  "'Helvetica Neue', Helvetica, Arial, 'Segoe UI', Roboto, sans-serif";

interface LayoutOptions {
  /** Small uppercase line above the title, e.g. "Order confirmation" */
  eyebrow?: string;
  title: string;
  /** One-line supporting sentence under the title */
  subtitle?: string;
  /** Inner HTML placed inside the padded content area */
  content: string;
  preheader?: string;
  footerNote?: string;
  contactEmail?: string;
}

export function emailLayout({
  eyebrow,
  title,
  subtitle,
  content,
  preheader,
  footerNote,
  contactEmail,
}: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.page};font-family:${FONT};-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:${BRAND.page};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid ${BRAND.hairline};">

          <!-- Brand bar -->
          <tr>
            <td style="background-color:${BRAND.black};padding:26px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${BRAND.logoLight}" alt="Vlitrix" width="34" style="display:block;width:34px;height:auto;border:0;outline:none;">
                  </td>
                  <td align="right" valign="middle" style="font-family:${FONT};color:#ffffff;font-size:15px;font-weight:700;letter-spacing:3px;">
                    VLITRIX
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:${BRAND.green};line-height:3px;font-size:0;">&nbsp;</td></tr>

          <!-- Heading -->
          <tr>
            <td style="padding:40px 40px 8px;">
              ${
                eyebrow
                  ? `<p style="margin:0 0 10px;font-family:${FONT};color:${BRAND.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${eyebrow}</p>`
                  : ""
              }
              <h1 style="margin:0;font-family:${FONT};color:${BRAND.ink};font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.3px;">${title}</h1>
              ${
                subtitle
                  ? `<p style="margin:12px 0 0;font-family:${FONT};color:${BRAND.body};font-size:15px;line-height:24px;">${subtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px 40px 40px;font-family:${FONT};color:${BRAND.body};font-size:15px;line-height:24px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.surface};border-top:1px solid ${BRAND.hairline};padding:28px 40px;">
              <p style="margin:0 0 6px;font-family:${FONT};color:${BRAND.ink};font-size:13px;font-weight:700;letter-spacing:1.5px;">VLITRIX</p>
              <p style="margin:0;font-family:${FONT};color:${BRAND.muted};font-size:12px;line-height:20px;">
                ${footerNote || "Vending &amp; claw machine solutions."}${
                  contactEmail
                    ? `<br>Questions? <a href="mailto:${contactEmail}" style="color:${BRAND.ink};text-decoration:underline;">${contactEmail}</a>`
                    : ""
                }
              </p>
              <p style="margin:14px 0 0;font-family:${FONT};color:${BRAND.muted};font-size:11px;">© ${new Date().getFullYear()} Vlitrix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Bordered key/value panel, used for order numbers and highlights. */
export function statPanel(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${BRAND.hairline};border-left:3px solid ${BRAND.green};background-color:${BRAND.surface};">
    <tr>
      <td style="padding:16px 20px;font-family:${FONT};">
        <p style="margin:0;color:${BRAND.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</p>
        <p style="margin:6px 0 0;color:${BRAND.ink};font-size:20px;font-weight:700;">${value}</p>
      </td>
    </tr>
  </table>`;
}

/** Neutral info block with an optional heading. */
export function infoBlock(heading: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${BRAND.hairline};">
    <tr>
      <td style="padding:18px 20px;font-family:${FONT};">
        <p style="margin:0 0 8px;color:${BRAND.ink};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${heading}</p>
        <div style="color:${BRAND.body};font-size:14px;line-height:22px;">${body}</div>
      </td>
    </tr>
  </table>`;
}

export function itemsTable(
  rows: { name: string; quantity: number; price: number }[],
  total: number,
  currency = "$",
): string {
  const body = rows
    .map(
      (item) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid ${BRAND.hairline};font-family:${FONT};color:${BRAND.ink};font-size:14px;">${item.name}</td>
        <td align="center" style="padding:14px 0;border-bottom:1px solid ${BRAND.hairline};font-family:${FONT};color:${BRAND.body};font-size:14px;">${item.quantity}</td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid ${BRAND.hairline};font-family:${FONT};color:${BRAND.ink};font-size:14px;font-weight:600;">${currency}${Number(item.price).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <th align="left" style="padding:0 0 10px;border-bottom:2px solid ${BRAND.ink};font-family:${FONT};color:${BRAND.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Item</th>
      <th align="center" style="padding:0 0 10px;border-bottom:2px solid ${BRAND.ink};font-family:${FONT};color:${BRAND.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Qty</th>
      <th align="right" style="padding:0 0 10px;border-bottom:2px solid ${BRAND.ink};font-family:${FONT};color:${BRAND.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Price</th>
    </tr>
    ${body}
    <tr>
      <td colspan="2" style="padding:18px 0 0;font-family:${FONT};color:${BRAND.ink};font-size:15px;font-weight:700;">Total</td>
      <td align="right" style="padding:18px 0 0;font-family:${FONT};color:${BRAND.ink};font-size:19px;font-weight:700;">${currency}${Number(total).toFixed(2)}</td>
    </tr>
  </table>`;
}

/** Solid brand button. */
export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="background-color:${BRAND.black};">
        <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.4px;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}
