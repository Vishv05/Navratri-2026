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

  if (!response.ok || data.return === false) {
    const errorMsg = data.message?.[0] || data.message || `SMS Gateway Error (${response.status})`;
    const err = new Error(errorMsg);
    err.details = data;
    err.status = response.status;
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

  // API Endpoint: POST /api/send-sms
  if (req.method === 'POST' && req.url === '/api/send-sms') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { phone, message, houseNo, dayNum } = payload;

        if (!phone || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'MISSING_FIELDS', 
            message: 'Phone and message are required.' 
          }));
          return;
        }

        const smsResult = await sendSmsViaGateway({ phone, message, houseNo, dayNum });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(smsResult));

      } catch (err) {
        console.warn(`⚠️ [SMS Gateway Error]:`, err.message);

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
