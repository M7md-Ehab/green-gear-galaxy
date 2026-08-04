// Frontend mirror of the Vlitrix transactional email design system.
// Used by the admin email preview / manual send screen.
// Supports a light (white) and dark rendering of the same markup.

export type EmailMode = "light" | "dark";

const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://vlitrix.com";

const FONT =
  "'Helvetica Neue', Helvetica, Arial, 'Segoe UI', Roboto, sans-serif";

interface Palette {
  page: string;
  card: string;
  header: string;
  green: string;
  ink: string;
  body: string;
  muted: string;
  hairline: string;
  surface: string;
  logo: string;
  headerText: string;
}

const PALETTES: Record<EmailMode, Palette> = {
  light: {
    page: "#F2F3F2",
    card: "#FFFFFF",
    header: "#0A0A0A",
    green: "#00FF84",
    ink: "#111111",
    body: "#4A4A4A",
    muted: "#8A8A8A",
    hairline: "#E6E6E6",
    surface: "#FAFAFA",
    logo: `${SITE_URL}/email-logo-light.png`,
    headerText: "#FFFFFF",
  },
  dark: {
    page: "#0A0A0A",
    card: "#141414",
    header: "#000000",
    green: "#00FF84",
    ink: "#FFFFFF",
    body: "#B8B8B8",
    muted: "#7A7A7A",
    hairline: "#2A2A2A",
    surface: "#1C1C1C",
    logo: `${SITE_URL}/email-logo-light.png`,
    headerText: "#FFFFFF",
  },
};

interface LayoutOptions {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  content: string;
  preheader?: string;
  footerNote?: string;
  contactEmail?: string;
}

export function emailLayout(
  { eyebrow, title, subtitle, content, preheader, footerNote, contactEmail }: LayoutOptions,
  mode: EmailMode = "light",
): string {
  const c = PALETTES[mode];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${c.page};font-family:${FONT};-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:${c.page};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-collapse:collapse;background-color:${c.card};border:1px solid ${c.hairline};">
          <tr>
            <td style="background-color:${c.header};padding:26px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${c.logo}" alt="Vlitrix" width="34" style="display:block;width:34px;height:auto;border:0;outline:none;">
                  </td>
                  <td align="right" valign="middle" style="font-family:${FONT};color:${c.headerText};font-size:15px;font-weight:700;letter-spacing:3px;">
                    VLITRIX
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:3px;background-color:${c.green};line-height:3px;font-size:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:40px 40px 8px;">
              ${
                eyebrow
                  ? `<p style="margin:0 0 10px;font-family:${FONT};color:${c.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${eyebrow}</p>`
                  : ""
              }
              <h1 style="margin:0;font-family:${FONT};color:${c.ink};font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.3px;">${title}</h1>
              ${
                subtitle
                  ? `<p style="margin:12px 0 0;font-family:${FONT};color:${c.body};font-size:15px;line-height:24px;">${subtitle}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px;font-family:${FONT};color:${c.body};font-size:15px;line-height:24px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:${c.surface};border-top:1px solid ${c.hairline};padding:28px 40px;">
              <p style="margin:0 0 6px;font-family:${FONT};color:${c.ink};font-size:13px;font-weight:700;letter-spacing:1.5px;">VLITRIX</p>
              <p style="margin:0;font-family:${FONT};color:${c.muted};font-size:12px;line-height:20px;">
                ${footerNote || "Vending &amp; claw machine solutions."}${
                  contactEmail
                    ? `<br>Questions? <a href="mailto:${contactEmail}" style="color:${c.ink};text-decoration:underline;">${contactEmail}</a>`
                    : ""
                }
              </p>
              <p style="margin:14px 0 0;font-family:${FONT};color:${c.muted};font-size:11px;">© ${new Date().getFullYear()} Vlitrix. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function statPanel(label: string, value: string, mode: EmailMode): string {
  const c = PALETTES[mode];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${c.hairline};border-left:3px solid ${c.green};background-color:${c.surface};">
    <tr>
      <td style="padding:16px 20px;font-family:${FONT};">
        <p style="margin:0;color:${c.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</p>
        <p style="margin:6px 0 0;color:${c.ink};font-size:20px;font-weight:700;">${value}</p>
      </td>
    </tr>
  </table>`;
}

export function infoBlock(heading: string, body: string, mode: EmailMode): string {
  const c = PALETTES[mode];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${c.hairline};">
    <tr>
      <td style="padding:18px 20px;font-family:${FONT};">
        <p style="margin:0 0 8px;color:${c.ink};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${heading}</p>
        <div style="color:${c.body};font-size:14px;line-height:22px;">${body}</div>
      </td>
    </tr>
  </table>`;
}

export function itemsTable(
  rows: { name: string; quantity: number; price: number }[],
  total: number,
  mode: EmailMode,
  currency = "$",
): string {
  const c = PALETTES[mode];
  const body = rows
    .map(
      (item) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid ${c.hairline};font-family:${FONT};color:${c.ink};font-size:14px;">${item.name}</td>
        <td align="center" style="padding:14px 0;border-bottom:1px solid ${c.hairline};font-family:${FONT};color:${c.body};font-size:14px;">${item.quantity}</td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid ${c.hairline};font-family:${FONT};color:${c.ink};font-size:14px;font-weight:600;">${currency}${Number(item.price).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <th align="left" style="padding:0 0 10px;border-bottom:2px solid ${c.ink};font-family:${FONT};color:${c.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Item</th>
      <th align="center" style="padding:0 0 10px;border-bottom:2px solid ${c.ink};font-family:${FONT};color:${c.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Qty</th>
      <th align="right" style="padding:0 0 10px;border-bottom:2px solid ${c.ink};font-family:${FONT};color:${c.muted};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Price</th>
    </tr>
    ${body}
    <tr>
      <td colspan="2" style="padding:18px 0 0;font-family:${FONT};color:${c.ink};font-size:15px;font-weight:700;">Total</td>
      <td align="right" style="padding:18px 0 0;font-family:${FONT};color:${c.ink};font-size:19px;font-weight:700;">${currency}${Number(total).toFixed(2)}</td>
    </tr>
  </table>`;
}

export function button(label: string, href: string, mode: EmailMode): string {
  const c = PALETTES[mode];
  const bg = mode === "light" ? "#0A0A0A" : c.green;
  const fg = mode === "light" ? "#FFFFFF" : "#0A0A0A";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="background-color:${bg};">
        <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};color:${fg};font-size:14px;font-weight:600;letter-spacing:0.4px;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/* ------------------------------ Templates ------------------------------ */

export interface EmailFieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: string[];
}

export interface EmailTemplateDef {
  id: string;
  name: string;
  description: string;
  fields: EmailFieldDef[];
  defaults: Record<string, string>;
  subject: (v: Record<string, string>) => string;
  render: (v: Record<string, string>, mode: EmailMode) => string;
}

const SAMPLE_ITEMS = [
  { name: "Vlitrix VM-200 Vending Machine", quantity: 1, price: 3250 },
  { name: "Vlitrix Claw Master CM-90", quantity: 2, price: 1480 },
];

export const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "postponed",
  "declined",
  "cancelled",
  "finished",
];

const STATUS_COPY: Record<string, { title: string; message: string }> = {
  pending: { title: "Order Pending", message: "Your order is pending and will be processed soon." },
  processing: { title: "Order Processing", message: "Great news! Your order is now being processed." },
  shipped: {
    title: "Your Order is on the Way!",
    message:
      "Your order has been shipped and is on its way to you. You can expect delivery within the next few days.",
  },
  delivered: {
    title: "Your Order Has Been Delivered!",
    message: "Your order has been successfully delivered. We hope you enjoy your purchase!",
  },
  postponed: {
    title: "Order Postponed",
    message:
      "Your order has been postponed. We will update you soon with more information. We apologize for any inconvenience.",
  },
  declined: {
    title: "Order Declined",
    message:
      "Unfortunately, we were unable to process your order. Please contact our support team for more information.",
  },
  cancelled: {
    title: "Order Cancelled",
    message:
      "Your order has been cancelled. If you did not request this cancellation, please contact our support team.",
  },
  finished: {
    title: "Order Complete",
    message: "Your order has been completed. We hope you're satisfied with your purchase!",
  },
};

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    id: "otp",
    name: "Verification code (OTP)",
    description: "6-digit code used for login, sign up and identity verification.",
    fields: [
      { key: "code", label: "Code" },
      { key: "label", label: "Purpose", type: "select", options: ["Sign Up", "Login", "Email Verification", "Identity Verification"] },
    ],
    defaults: { code: "482913", label: "Login" },
    subject: (v) => `${v.code} is your Vlitrix verification code`,
    render: (v, mode) => {
      const c = PALETTES[mode];
      const boxed = esc(v.code).split("").join("&nbsp;&nbsp;");
      return emailLayout(
        {
          eyebrow: esc(v.label),
          title: "Your verification code",
          subtitle:
            "Use the code below to continue. It is valid for 10 minutes and can only be used once.",
          preheader: `${esc(v.code)} is your Vlitrix verification code`,
          content: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${c.hairline};border-left:3px solid ${c.green};background-color:${c.surface};">
          <tr>
            <td align="center" style="padding:26px 20px;">
              <p style="margin:0 0 10px;color:${c.muted};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Verification code</p>
              <p style="margin:0;color:${c.ink};font-size:34px;font-weight:700;letter-spacing:6px;font-family:'SF Mono',Menlo,Consolas,monospace;">${boxed}</p>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
        <p style="margin:0;color:${c.body};font-size:14px;line-height:22px;">This code expires in <strong style="color:${c.ink};">10 minutes</strong>. If you did not request it, you can safely ignore this email &mdash; no changes will be made to your account.</p>
      `,
        },
        mode,
      );
    },
  },
  {
    id: "order-confirmation",
    name: "Order confirmation",
    description: "Sent to the customer right after checkout.",
    fields: [
      { key: "customerName", label: "Customer name" },
      { key: "orderCode", label: "Order number" },
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "phone", label: "Phone" },
      { key: "payment", label: "Payment method" },
    ],
    defaults: {
      customerName: "Ahmed Hassan",
      orderCode: "1042",
      address: "14 El Nasr Street, Maadi",
      city: "Cairo",
      phone: "+20 100 123 4567",
      payment: "Cash on delivery",
    },
    subject: (v) => `Order #${v.orderCode} confirmed — Vlitrix`,
    render: (v, mode) => {
      const c = PALETTES[mode];
      const total = SAMPLE_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
      return emailLayout(
        {
          eyebrow: "Order confirmation",
          title: "Thank you for your order",
          subtitle: "We have received your order and our team is preparing it now.",
          preheader: `Order #${esc(v.orderCode)} confirmed`,
          content: `
        <p style="margin:0 0 24px;color:${c.body};font-size:15px;line-height:24px;">Hi <strong style="color:${c.ink};">${esc(v.customerName)}</strong>,</p>
        ${statPanel("Order number", `#${esc(v.orderCode)}`, mode)}
        <div style="height:28px;"></div>
        ${itemsTable(SAMPLE_ITEMS, total, mode)}
        <div style="height:28px;"></div>
        ${infoBlock(
          "Delivery details",
          `${esc(v.address)}<br>${esc(v.city)}<br>${esc(v.phone)}`,
          mode,
        )}
        <div style="height:16px;"></div>
        ${infoBlock("Payment", esc(v.payment), mode)}
        <div style="height:28px;"></div>
        ${button("View your orders", `${SITE_URL}/dashboard`, mode)}
      `,
        },
        mode,
      );
    },
  },
  {
    id: "order-status",
    name: "Order status update",
    description: "Sent whenever an order status changes in the admin panel.",
    fields: [
      { key: "customerName", label: "Customer name" },
      { key: "orderCode", label: "Order number" },
      { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    ],
    defaults: { customerName: "Ahmed Hassan", orderCode: "1042", status: "shipped" },
    subject: (v) =>
      `${(STATUS_COPY[v.status] || STATUS_COPY.pending).title} — Vlitrix order #${v.orderCode}`,
    render: (v, mode) => {
      const c = PALETTES[mode];
      const info = STATUS_COPY[v.status] || STATUS_COPY.pending;
      return emailLayout(
        {
          eyebrow: "Order update",
          title: info.title,
          subtitle: info.message,
          preheader: `Order #${esc(v.orderCode)}: ${esc(v.status)}`,
          content: `
          <p style="margin:0 0 24px;color:${c.body};font-size:15px;line-height:24px;">Hi <strong style="color:${c.ink};">${esc(v.customerName)}</strong>,</p>
          ${statPanel("Order number", `#${esc(v.orderCode)}`, mode)}
          <div style="height:16px;"></div>
          ${infoBlock("Current status", `<span style="color:${c.ink};font-weight:600;text-transform:capitalize;">${esc(v.status)}</span>`, mode)}
          <div style="height:28px;"></div>
          ${button("View order details", `${SITE_URL}/dashboard`, mode)}
        `,
        },
        mode,
      );
    },
  },
  {
    id: "feedback",
    name: "Feedback / contact reply",
    description: "Acknowledgement sent when a customer submits feedback or a contact message.",
    fields: [
      { key: "customerName", label: "Customer name" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "reply", label: "Reply from team", type: "textarea" },
    ],
    defaults: {
      customerName: "Ahmed Hassan",
      message: "Do you offer installation and maintenance for the VM-200 in Alexandria?",
      reply:
        "Yes — installation and the first year of maintenance are included for all machines delivered inside Egypt. Our technician will contact you to schedule a visit.",
    },
    subject: () => "We received your message — Vlitrix",
    render: (v, mode) => {
      const c = PALETTES[mode];
      return emailLayout(
        {
          eyebrow: "Support",
          title: "We received your message",
          subtitle: "Thanks for reaching out. Here is a copy of what you sent us.",
          preheader: "Your message has reached the Vlitrix team",
          content: `
        <p style="margin:0 0 24px;color:${c.body};font-size:15px;line-height:24px;">Hi <strong style="color:${c.ink};">${esc(v.customerName)}</strong>,</p>
        ${infoBlock("Your message", esc(v.message).replace(/\n/g, "<br>"), mode)}
        <div style="height:16px;"></div>
        ${infoBlock("Our reply", esc(v.reply).replace(/\n/g, "<br>"), mode)}
        <div style="height:28px;"></div>
        ${button("Browse machines", `${SITE_URL}/products`, mode)}
      `,
        },
        mode,
      );
    },
  },
];

/* ------------------ Generated per-event status templates ------------------ */
// One selectable template per order event (Order Shipped, Order Cancelled, ...).
// Adding a new status to STATUS_OPTIONS/STATUS_COPY automatically adds a template.
const statusTemplate = EMAIL_TEMPLATES.find((t) => t.id === "order-status")!;

STATUS_OPTIONS.forEach((status) => {
  const copy = STATUS_COPY[status] || STATUS_COPY.pending;
  EMAIL_TEMPLATES.push({
    id: `order-${status}`,
    name: copy.title,
    description: copy.message,
    fields: statusTemplate.fields.filter((f) => f.key !== "status"),
    defaults: { ...statusTemplate.defaults, status },
    subject: (v) => statusTemplate.subject({ ...v, status }),
    render: (v, mode) => statusTemplate.render({ ...v, status }, mode),
  });
});
