const express = require('express');
const app = express();
const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr');
const bodyParser = require('body-parser');
const _ = require('lodash');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// ===== ตั้งค่าเลขพร้อมเพย์ของร้านที่เดียว =====
// ใส่เบอร์มือถือ 10 หลัก หรือ เลขบัตรประชาชน 13 หลัก
// (หรือกำหนดผ่าน environment variable: PROMPTPAY_ID)
const PROMPTPAY_ID = process.env.PROMPTPAY_ID || '0654982592';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// สร้าง QR จากยอดเงิน -> คืนทั้ง payload (ข้อความ) และ dataUrl (รูป)
async function createPromptPayQR(amount) {
  const payload = generatePayload(PROMPTPAY_ID, { amount });
  const dataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    width: 300,
    color: { dark: '#000', light: '#fff' },
  });
  return { payload, dataUrl };
}

// อ่าน amount ได้ทั้งจาก body (POST) และ query (GET)
function readAmount(req) {
  const raw = _.get(req, ['body', 'amount'], _.get(req, ['query', 'amount']));
  return parseFloat(raw);
}

async function handleGenerate(req, res) {
  const amount = readAmount(req);

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      RespCode: 400,
      RespMessage: 'Invalid amount',
    });
  }

  try {
    const { payload, dataUrl } = await createPromptPayQR(amount);

    return res.status(200).json({
      RespCode: 200,
      RespMessage: 'Success',
      amount,            // ยอดที่ฝังลงใน QR
      payload,           // ข้อความ EMVCo (ไว้ตรวจสอบ/debug)
      result: dataUrl,   // รูป QR (base64) ไว้ใส่ใน <img src="...">
    });
  } catch (err) {
    console.log('Generate fail', err);
    return res.status(500).json({
      RespCode: 500,
      RespMessage: 'QR generation failed',
      Error: err.message,
    });
  }
}

// รองรับทั้ง POST (ของเดิม) และ GET (เทสต์ง่าย: /generate-qr?amount=490)
app.post('/generate-qr', handleGenerate);
app.get('/generate-qr', handleGenerate);

app.get('/', (req, res) => {
  res.send('PromptPay QR API is running');
});

// รันเซิร์ฟเวอร์เฉพาะตอนใช้งานในเครื่อง (Vercel เป็น serverless ไม่ใช้ app.listen)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// ส่งออก app ให้ Vercel นำไปรันเป็น serverless function
module.exports = app;
