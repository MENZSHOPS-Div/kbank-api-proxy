const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const promptpay = require('promptpay-qr');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/generate-qr', async (req, res) => {
  const { promptpayId, amount } = req.body;

  if (!promptpayId || !amount) {
    return res.status(400).json({ error: 'Missing promptpayId or amount' });
  }

  try {
    const payload = promptpay.generate(payload = promptpayId, { amount: parseFloat(amount) });
    const qrImageDataUrl = await qrcode.toDataURL(payload);
    res.json({ qrCode: qrImageDataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('PromptPay QR API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
