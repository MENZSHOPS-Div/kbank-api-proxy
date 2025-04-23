const express = require('express')
const app = express();
const QRCode =  require('qrcode')
const generatepayload = require('promptpay-qr')
const bodyParser = require('body-parser')
const _ = require('lodash')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {extended: true}))

const server =  app.listen(3000,()=>{
    console.log('server is running....')
})

app.post('/generateQR', (req,res)=>{
    const amount = parseFloat(_.get(req, ["body","amount"]));
    const mobilenumber ='1102000694354';
    const payload = generatePayload(mobilenumber,{amount});
    const option = {
        color:{
            dark: '#000',
            light: '#fff'
        }
    }
    QRCode.toDataURL(payload, option, (err,url) => {
        if(err) {console.log('generate fail')
            return res.status(400).json({
        RespCode: 400,
    RespMessage: 'bad'+ err
})

            }else {  return res.status(200).json({
                RespCode: 200,
            RespMessage: 'good',
            result: url})


            }

    })
})
module.exports = app;