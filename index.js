const express = require('express');
const app = express();
const QRCode = require('qrcode');
const generatePayload = require('promptpay-qr'); // แก้ชื่อฟังก์ชันตรงนี้
const bodyParser = require('body-parser');
const _ = require('lodash');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate-qr', (req, res) => {
  const amount = parseFloat(_.get(req, ['body', 'amount']));

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      RespCode: 400,
      RespMessage: 'Invalid amount',
    });
  }

  const mobileNumber = '0654982592';
  const payload = generatePayload(mobileNumber, { amount });
  const options = {
    color: {
      dark: '#000',
      light: '#fff',
    },
  };

  QRCode.toDataURL(payload, options, (err, url) => {
    if (err) {
      console.log('Generate fail', err);
      return res.status(500).json({
        RespCode: 500,
        RespMessage: 'QR generation failed',
        Error: err.message,
      });
    }

    return res.status(200).json({
      RespCode: 200,
      RespMessage: 'Success',
      result: url,
    });
  });
});

app.get('/', (req, res) => {
  res.send('PromptPay QR API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

