/**
 * Dent Logic — form submission notifier.
 *
 * Netlify Forms stores every submission and photo for free, but emailing them
 * out is a paid feature. This receives Netlify's free outgoing webhook and
 * sends the lead from Greg's own Gmail instead. No third party, no API key,
 * no monthly limit beyond Gmail's own daily send quota.
 *
 * SETUP (about five minutes)
 * -------------------------------------------------------------------------
 * 1. script.google.com -> New project. Paste this file over Code.gs. Rename
 *    the project "Dent Logic form notifier".
 *
 * 2. Set the shared secret (keeps randoms from POSTing fake leads):
 *      Project Settings (gear) -> Script Properties -> Add script property
 *        Property: SHARED_SECRET
 *        Value:    any long random string you invent
 *    Optionally add NOTIFY_TO to override the default address below.
 *
 * 3. Deploy -> New deployment -> type "Web app"
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Authorise when prompted (it needs permission to send mail as you).
 *    Copy the /exec URL it gives you.
 *
 * 4. In Netlify: Forms -> (or Project configuration -> Notifications) ->
 *    Add notification -> HTTP POST request, on new form submission.
 *    URL: <the /exec URL>?key=<the same SHARED_SECRET>
 *
 * 5. Submit the form on the live site once. Greg should get the email.
 *    If nothing arrives, check Executions in the Apps Script sidebar.
 *
 * The secret lives only in Script Properties and the Netlify URL — never in
 * this file, which sits in a public repo.
 */

var DEFAULT_NOTIFY_TO = 'DentLogicInc@gmail.com';
var BUSINESS_PHONE = '+16103167761';

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var notifyTo = props.getProperty('NOTIFY_TO') || DEFAULT_NOTIFY_TO;

  try {
    var expected = props.getProperty('SHARED_SECRET');
    if (!expected) return reply('misconfigured: SHARED_SECRET not set');
    if (!e || !e.parameter || e.parameter.key !== expected) return reply('forbidden');
    if (!e.postData || !e.postData.contents) return reply('empty body');

    var body = JSON.parse(e.postData.contents);
    var d = body.data || {};

    var vehicle = str(d.vehicle) || 'Vehicle not given';
    var damage = str(d.damage) || 'Not specified';
    var zip = str(d.zip);

    // Subject is what Greg sees on a locked phone screen — make it decide-able.
    var subject = 'New estimate: ' + vehicle + ' - ' + damage + (zip ? ' - ' + zip : '');

    var options = {
      to: notifyTo,
      subject: subject,
      htmlBody: buildHtml(d, body),
      body: buildPlain(d, body),
      name: 'Dent Logic website',
    };
    // Only set replyTo when it is real, so hitting reply goes to the customer.
    if (isEmail(d.email)) options.replyTo = str(d.email);
    MailApp.sendEmail(options);

    return reply('ok');
  } catch (err) {
    // Never lose a lead to a formatting bug — send the raw payload instead.
    try {
      MailApp.sendEmail(
        notifyTo,
        'Dent Logic: form came in but the notifier errored',
        'Error: ' + err + '\n\nRaw submission:\n' +
          (e && e.postData ? e.postData.contents : '(no body)') +
          '\n\nThe submission is safe in Netlify -> Forms.'
      );
    } catch (ignored) {}
    return reply('error');
  }
}

function doGet() {
  return reply('Dent Logic notifier is running. Netlify posts here.');
}

/* ----------------------------------------------------------------- helpers */

function reply(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

function str(v) {
  return v === null || v === undefined ? '' : String(v).trim();
}

function isEmail(v) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str(v));
}

/** "(610) 555-0143" -> "+16105550143" so tel:/sms: links dial unambiguously. */
function telify(v) {
  var digits = str(v).replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
  return str(v).indexOf('+') === 0 ? '+' + digits : digits;
}

function esc(v) {
  return str(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Netlify sends uploads as a URL, or an array of them when several are attached. */
function photoUrls(d) {
  var raw = d.photos;
  if (!raw) return [];
  var list = Array.isArray(raw) ? raw : [raw];
  return list.map(str).filter(function (u) { return u.indexOf('http') === 0; });
}

function buildPlain(d, body) {
  var lines = [
    'NEW ESTIMATE REQUEST',
    '',
    'Name:      ' + (str(d.name) || '-'),
    'Phone:     ' + (str(d.phone) || '-'),
    'Email:     ' + (str(d.email) || '-'),
    'ZIP:       ' + (str(d.zip) || '-'),
    'Vehicle:   ' + (str(d.vehicle) || '-'),
    'Damage:    ' + (str(d.damage) || '-'),
    'Prefers:   ' + (str(d.preferred) || '-'),
    '',
    'Details:',
    str(d.details) || '(none)',
    '',
  ];
  var photos = photoUrls(d);
  lines.push('Photos: ' + (photos.length ? '' : '(none attached)'));
  photos.forEach(function (u) { lines.push('  ' + u); });
  lines.push('', 'Came from: ' + (str(d.lead_source) || 'unknown'));
  lines.push('Received:  ' + (str(body.created_at) || new Date().toISOString()));
  return lines.join('\n');
}

function buildHtml(d, body) {
  var phone = str(d.phone);
  var email = str(d.email);
  var telHref = telify(phone);
  var photos = photoUrls(d);

  var actions = [];
  if (telHref) {
    actions.push(btn('tel:' + telHref, 'Call ' + esc(phone), '#ff6b1a'));
    actions.push(btn('sms:' + telHref, 'Text', '#10161d'));
  }
  if (isEmail(email)) actions.push(btn('mailto:' + esc(email), 'Email', '#10161d'));

  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;color:#10161d;line-height:1.55">',
    '<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64707d;margin:0 0 4px">New estimate request</p>',
    '<h2 style="margin:0 0 4px;font-size:20px">' + esc(str(d.vehicle) || 'Vehicle not given') + '</h2>',
    '<p style="margin:0 0 18px;color:#64707d">' + esc(str(d.damage) || 'Damage not specified') +
      (str(d.zip) ? ' &middot; ZIP ' + esc(d.zip) : '') + '</p>',

    actions.length ? '<p style="margin:0 0 20px">' + actions.join(' ') + '</p>' : '',

    '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">',
    row('Name', esc(str(d.name) || '-')),
    row('Phone', phone ? '<a href="tel:' + telHref + '" style="color:#8a3708">' + esc(phone) + '</a>' : '-'),
    row('Email', isEmail(email) ? '<a href="mailto:' + esc(email) + '" style="color:#8a3708">' + esc(email) + '</a>' : '-'),
    row('Prefers', esc(str(d.preferred) || '-')),
    '</table>',

    str(d.details)
      ? '<p style="margin:18px 0 6px;font-weight:700;font-size:14px">Details</p>' +
        '<p style="margin:0;padding:12px 14px;background:#f6f8fa;border-radius:10px;white-space:pre-wrap">' +
        esc(d.details) + '</p>'
      : '',

    '<p style="margin:20px 0 6px;font-weight:700;font-size:14px">Photos</p>',
    photos.length
      ? '<p style="margin:0">' + photos.map(function (u, i) {
          return '<a href="' + esc(u) + '" style="color:#8a3708">Photo ' + (i + 1) + '</a>';
        }).join(' &nbsp;&middot;&nbsp; ') + '</p>'
      : '<p style="margin:0;color:#64707d">None attached. Worth texting them to ask.</p>',

    '<hr style="border:0;border-top:1px solid #dde3ea;margin:22px 0 12px">',
    '<p style="margin:0;font-size:12px;color:#64707d">',
    'Came from: ' + esc(str(d.lead_source) || 'unknown') + '<br>',
    'Received: ' + esc(str(body.created_at) || new Date().toISOString()) + '<br>',
    'Stored in Netlify &rarr; Forms.',
    '</p></div>',
  ].join('');
}

function row(label, valueHtml) {
  return '<tr>' +
    '<td style="padding:7px 12px 7px 0;color:#64707d;white-space:nowrap;vertical-align:top">' + label + '</td>' +
    '<td style="padding:7px 0;font-weight:600">' + valueHtml + '</td></tr>';
}

function btn(href, label, bg) {
  return '<a href="' + href + '" style="display:inline-block;background:' + bg +
    ';color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:999px;font-size:15px;margin:0 6px 6px 0">' +
    label + '</a>';
}
