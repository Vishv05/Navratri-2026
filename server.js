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
 * Load Meta WhatsApp API configuration
 */
function getMetaConfig() {
  let config = {
    META_PHONE_NUMBER_ID: process.env.META_PHONE_NUMBER_ID || '',
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || '',
    META_API_VERSION: process.env.META_API_VERSION || 'v19.0'
  };

  try {
    const configPath = path.join(__dirname, 'meta-config.json');
    if (fs.existsSync(configPath)) {
      const fileContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = { ...config, ...fileContent };
    }
  } catch (err) {
    console.warn('Could not read meta-config.json:', err.message);
  }

  return config;
}

/**
 * Send WhatsApp message via official Meta Graph API
 */
async function sendMetaWhatsAppMessage({ phone, message }) {
  const { META_PHONE_NUMBER_ID, META_ACCESS_TOKEN, META_API_VERSION } = getMetaConfig();

  if (
    !META_PHONE_NUMBER_ID ||
    !META_ACCESS_TOKEN ||
    META_PHONE_NUMBER_ID.includes('YOUR_META') ||
    META_ACCESS_TOKEN.includes('YOUR_META')
  ) {
    throw new Error('META_CREDENTIALS_NOT_CONFIGURED');
  }

  // Ensure recipient phone number has no + or spaces, e.g. 919825012345
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `Meta API Error (${response.status})`;
    const err = new Error(errorMsg);
    err.details = data.error;
    err.status = response.status;
    throw err;
  }

  return data;
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

  // API Endpoint: POST /api/send-whatsapp
  if (req.method === 'POST' && req.url === '/api/send-whatsapp') {
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

        const metaResult = await sendMetaWhatsAppMessage({ phone, message });
        console.log(`✅ [Meta API] Message sent successfully to ${phone} for House ${houseNo} (Day ${dayNum})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          result: metaResult 
        }));

      } catch (err) {
        console.warn(`⚠️ [Meta API] Failed to send message:`, err.message);

        const statusCode = err.status || 500;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          code: err.details?.code || (err.message === 'META_CREDENTIALS_NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'API_ERROR'),
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
