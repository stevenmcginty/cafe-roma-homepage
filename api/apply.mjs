/**
 * POST /api/apply — Careers form → email
 *
 * Receives the careers form (multipart/form-data), validates it, and emails
 * it to the cafe through the cafe's own Gmail account over SMTP. The CV, if
 * attached, rides along as an attachment. Reply-To is the applicant.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   GMAIL_USER           the Gmail account that sends, e.g. stalbanscaferoma@gmail.com
 *   GMAIL_APP_PASSWORD   a 16-character Google "app password" for that account
 *                        (the same one KoraOS uses for receipts — Firestore
 *                        cafe-roma-pos / koraos / system/email_config)
 *   CAREERS_TO           inbox that receives applications (defaults to GMAIL_USER)
 */

import nodemailer from 'nodemailer';

const MAX_CV_BYTES = 4 * 1024 * 1024; // 4 MB — under Vercel's 4.5 MB request body limit
const ALLOWED_CV = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const ALLOWED_EXT = /\.(pdf|docx?)$/i;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
const escapeHtml = s =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Named HTTP-method export: this is what makes Vercel's Node runtime hand us
// a Web-standard Request (with formData()) instead of (req, res).
export async function POST(request) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.CAREERS_TO || user;
  if (!user || !pass) {
    return json(500, { ok: false, error: 'Careers form is not configured yet.' });
  }

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return json(400, { ok: false, error: 'Could not read the form.' });
  }

  // Honeypot — real people never fill this in.
  if (clean(form.get('website'), 50)) {
    return json(200, { ok: true });
  }

  const name = clean(form.get('name'), 120);
  const phone = clean(form.get('phone'), 40);
  const mobile = clean(form.get('mobile'), 40);
  const email = clean(form.get('email'), 200);
  const note = String(form.get('note') || '').trim().slice(0, 4000);
  const cv = form.get('cv');

  if (!name) return json(400, { ok: false, error: 'Please tell us your name.' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: 'Please enter a valid email address.' });
  }
  if (!phone && !mobile) {
    return json(400, { ok: false, error: 'Please give us a phone or mobile number.' });
  }

  const attachments = [];
  if (cv && typeof cv === 'object' && typeof cv.arrayBuffer === 'function' && cv.size > 0) {
    const okType = ALLOWED_CV.has(cv.type) || ALLOWED_EXT.test(cv.name || '');
    if (!okType) return json(400, { ok: false, error: 'CV must be a PDF or Word document.' });
    if (cv.size > MAX_CV_BYTES) return json(400, { ok: false, error: 'CV must be 4 MB or smaller.' });
    attachments.push({
      filename: (cv.name || 'cv').replace(/[^\w.\- ]+/g, '_').slice(0, 120),
      content: Buffer.from(await cv.arrayBuffer()),
      contentType: cv.type || undefined
    });
  }

  if (!note && attachments.length === 0) {
    return json(400, { ok: false, error: 'Please attach a CV or write a short note.' });
  }

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Mobile', mobile || '—'],
    ['CV', attachments.length ? attachments[0].filename : 'none attached']
  ];

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
    '\n\nCover note:\n' + (note || '(none)') +
    '\n\n— Sent from the careers form on caferoma.app';

  const html =
    '<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111">' +
    '<h2 style="margin:0 0 14px;font-weight:600">New job application</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">' +
    rows.map(([k, v]) =>
      `<tr><td style="padding:4px 18px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`
    ).join('') +
    '</table>' +
    '<h3 style="margin:22px 0 8px;font-weight:600">Cover note</h3>' +
    `<p style="white-space:pre-wrap;margin:0">${escapeHtml(note || '(none)')}</p>` +
    '<p style="margin:26px 0 0;color:#999;font-size:12px">Sent from the careers form on caferoma.app</p>' +
    '</div>';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `"Cafe Roma Careers" <${user}>`,
      to,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      subject: `Job application — ${name}`,
      text,
      html,
      attachments
    });
  } catch (e) {
    console.error('SMTP error', e && e.message);
    return json(502, { ok: false, error: 'The email could not be sent. Please try again later.' });
  }

  return json(200, { ok: true });
}
