const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

/**
 * Load SMS Gateway configuration (Fast2SMS / custom gateway)
 */
function getSmsConfig() {
  let config = {
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || '',
    SENDER_ID: process.env.SENDER_ID || 'FSTSMS',
    ROUTE: process.env.ROUTE || 'q'
  };

  try {
    const configPath = path.join(__dirname, 'sms-config.json');
    if (fs.existsSync(configPath)) {
      const fileContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = { ...config, ...fileContent };
    }
  } catch (err) {
    console.warn('Could not read sms-config.json:', err.message);
  }

  return config;
}

/**
 * Send SMS via Telecom SMS Gateway (Fast2SMS Quick SMS / Unicode route)
 * Never exposes or uses personal sender phone number.
 */
async function sendSmsViaGateway({ phone, message, houseNo, dayNum }) {
  const config = getSmsConfig();
  const rawDigits = phone.replace(/[^0-9]/g, '');
  const cleanPhone = rawDigits.slice(-10); // Standard 10-digit Indian mobile number

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error(`Invalid 10-digit mobile number: ${phone}`);
  }

  const apiKey = config.FAST2SMS_API_KEY;

  // If Fast2SMS API key is not configured, run in clean Simulation / Sandbox Mode
  if (!apiKey || apiKey.includes('YOUR_FAST2SMS')) {
    console.log(`\n📱 [SMS Gateway Simulation] Dispatching to +91-${cleanPhone} (House ${houseNo}, Day ${dayNum}):`);
    console.log(`────────────────────────────────────────────────────────────`);
    console.log(message);
    console.log(`────────────────────────────────────────────────────────────`);
    console.log(`ℹ️ [Sender Header: ${config.SENDER_ID}] (Your personal phone number is 100% hidden)\n`);

    return {
      success: true,
      simulated: true,
      phone: cleanPhone,
      senderId: config.SENDER_ID,
      message: 'SMS prepared and simulated successfully. Add your Fast2SMS API key in sms-config.json for live carrier delivery.'
    };
  }

  // Live Carrier Dispatch via Fast2SMS Bulk V2 API
  const url = 'https://www.fast2sms.com/dev/bulkV2';
  const payload = {
    route: config.ROUTE || 'q', // Quick SMS Unicode route
    message: message,
    language: 'unicode',
    flash: 0,
    numbers: cleanPhone
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || data.return === false || data.status_code === 999) {
    let errorMsg = 'SMS Gateway Error';
    if (typeof data.message === 'string') {
      errorMsg = data.message;
    } else if (Array.isArray(data.message) && data.message.length > 0) {
      errorMsg = data.message[0];
    } else if (data.message) {
      errorMsg = String(data.message);
    }
    const err = new Error(errorMsg);
    err.details = data;
    err.status = response.status >= 400 ? response.status : 400;
    throw err;
  }

  console.log(`✅ [SMS Gateway] Live SMS delivered to +91-${cleanPhone} for House ${houseNo} (Day ${dayNum})`);
  return {
    success: true,
    simulated: false,
    phone: cleanPhone,
    data
  };
}

/**
 * Load WhatsApp Cloud API configuration
 */
function getWhatsAppConfig() {
  let config = {
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME || '',
    WHATSAPP_TEMPLATE_LANG: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US'
  };

  try {
    const configPath = path.join(__dirname, 'whatsapp-config.json');
    if (fs.existsSync(configPath)) {
      const fileContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = { ...config, ...fileContent };
    }
  } catch (err) {
    console.warn('Could not read whatsapp-config.json:', err.message);
  }

  return config;
}

/**
 * Send WhatsApp message via official Meta WhatsApp Cloud API
 * Free 1,000 service messages/month - Never discloses personal phone number!
 */
async function sendWhatsAppViaMeta({ phone, message, houseNo, dayNum }) {
  const config = getWhatsAppConfig();
  const rawDigits = phone.replace(/[^0-9]/g, '');
  // Normalize to 12-digit Indian mobile number: 9198XXXXXXXX
  const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error(`Invalid phone number: ${phone}`);
  }

  const token = config.WHATSAPP_TOKEN;
  const phoneNumberId = config.WHATSAPP_PHONE_NUMBER_ID;

  // If token is missing or placeholder, run in clean Simulation / Sandbox Mode
  if (!token || token.includes('YOUR_META') || !phoneNumberId || phoneNumberId.includes('YOUR_META')) {
    console.log(`\n💬 [Meta WhatsApp Cloud API - Sandbox Mode]`);
    console.log(`Recipient: +${cleanPhone} (House ${houseNo}, Day ${dayNum})`);
    console.log(`────────────────────────────────────────────────────────────`);
    console.log(message);
    console.log(`────────────────────────────────────────────────────────────`);
    console.log(`ℹ️ [Sender: Meta WhatsApp Business Cloud] (Your personal phone number is 100% hidden)`);
    console.log(`👉 Add your Meta Token and Phone Number ID in whatsapp-config.json for live carrier delivery.\n`);

    return {
      success: true,
      simulated: true,
      channel: 'whatsapp',
      phone: cleanPhone,
      message: 'WhatsApp message prepared in sandbox mode. Add Meta credentials in whatsapp-config.json for live delivery.'
    };
  }

  // Live Meta Graph API call
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  // Schedule metadata for template parameters
  const SCHEDULE_META = [
    { dayNum: 1, date: "11 Oct 2026 (Sunday)", norata: "First Noratu (પહેલું નોરતું)" },
    { dayNum: 2, date: "12 Oct 2026 (Monday)", norata: "Second Noratu (બીજું નોરતું)" },
    { dayNum: 3, date: "13 Oct 2026 (Tuesday)", norata: "Third Noratu (ત્રીજું નોરતું)" },
    { dayNum: 4, date: "14 Oct 2026 (Wednesday)", norata: "Fourth Noratu (ચોથું નોરતું)" },
    { dayNum: 5, date: "15 Oct 2026 (Thursday)", norata: "Fifth Noratu (પાંચમું નોરતું)" },
    { dayNum: 6, date: "16 Oct 2026 (Friday)", norata: "Sixth Noratu (છઠ્ઠું નોરતું)" },
    { dayNum: 7, date: "17 Oct 2026 (Saturday)", norata: "Seventh Noratu (સાતમું નોરતું)" },
    { dayNum: 8, date: "18 Oct 2026 (Sunday)", norata: "Eighth Noratu (આઠમું નોરતું)" },
    { dayNum: 9, date: "19 Oct 2026 (Monday)", norata: "Ninth Noratu (નવમું નોરતું)" }
  ];

  const currentDayInfo = SCHEDULE_META.find(s => Number(s.dayNum) === Number(dayNum)) || SCHEDULE_META[0];

  // If template is specified, use template payload, otherwise text payload
  let payload;
  if (config.WHATSAPP_TEMPLATE_NAME) {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: config.WHATSAPP_TEMPLATE_NAME,
        language: { code: config.WHATSAPP_TEMPLATE_LANG || 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: houseNo || 'Member' },
              { type: 'text', text: currentDayInfo.norata },
              { type: 'text', text: currentDayInfo.date }
            ]
          }
        ]
      }
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorDetails = data.error || {};
    let errorMsg = errorDetails.message || 'Meta WhatsApp API Error';
    if (errorDetails.error_user_msg) {
      errorMsg = errorDetails.error_user_msg;
    }
    const err = new Error(errorMsg);
    err.details = errorDetails;
    err.status = response.status >= 400 ? response.status : 400;
    throw err;
  }

  console.log(`✅ [Meta WhatsApp API] Message successfully sent to +${cleanPhone} for House ${houseNo} (Day ${dayNum})`);
  return {
    success: true,
    simulated: false,
    channel: 'whatsapp',
    phone: cleanPhone,
    data
  };
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: POST /api/send-whatsapp OR POST /api/send-sms
  if (req.method === 'POST' && (req.url === '/api/send-whatsapp' || req.url === '/api/send-sms')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { phone, message, houseNo, dayNum, channel } = payload;

        if (!phone) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'MISSING_FIELDS', 
            message: 'Phone is required.' 
          }));
          return;
        }

        const waConfig = getWhatsAppConfig();
        const hasWaCredentials = Boolean(
          waConfig.WHATSAPP_TOKEN && 
          !waConfig.WHATSAPP_TOKEN.includes('YOUR_META') &&
          waConfig.WHATSAPP_PHONE_NUMBER_ID &&
          !waConfig.WHATSAPP_PHONE_NUMBER_ID.includes('YOUR_META')
        );

        let dispatchResult;

        // If explicitly requesting WhatsApp, or WhatsApp credentials configured, or requested on /api/send-whatsapp
        if (req.url === '/api/send-whatsapp' || channel === 'whatsapp' || hasWaCredentials) {
          dispatchResult = await sendWhatsAppViaMeta({ phone, message, houseNo, dayNum });
        } else {
          // Fallback to SMS Gateway handler
          dispatchResult = await sendSmsViaGateway({ phone, message, houseNo, dayNum });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dispatchResult));

      } catch (err) {
        console.warn(`⚠️ [Messaging Dispatch Error]:`, err.message);

        const statusCode = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          details: err.details || null
        }));
      }
    });
    return;
  }

  // Static file serving
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🌸 Navratri 2026 Aarti Schedule server running at http://localhost:${PORT}`);
});
