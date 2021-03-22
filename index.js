const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const env = require('dotenv');
const qrcode = require('qrcode');
env.config();
const port = 5000;

const uri = `mongodb+srv://${process.env.DBNAME}:${process.env.DBPASS}@cluster0.02jxk.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const qrcodeCollection = client.db(`qrcode`).collection('qrcodeCollection');

  app.post('/qrcode', (req, res) => {
    const {
      name,
      busName,
      journeyDate,
      time,
      fromPlace,
      toPlace,
      receiveDate,
      coachNo,
      seatNo,
    } = req.body;
    const qrcodeData =
      'name:' + name + ':bus:' + busName + journeyDate + ':time:' + time;
    const qrCodeImageData = qrcodeData.replace(/\s+/g, '');
    if (qrCodeImageData) res.send('Empty Data!');
    qrcode.toDataURL(qrCodeImageData, (err, src) => {
      if (err) res.send('Error occured');
      else {
        const setQRcodeToDataBase = {
          name,
          busName,
          journeyDate,
          time,
          coachNo,
          seatNo,
          fromPlace,
          toPlace,
          receiveDate,
          qrCodeImageData,
          src,
        };
        qrcodeCollection.insertOne(setQRcodeToDataBase).then((result) => {
          res.send(console.log('added'));
        });
      }
    });
  });

  app.get('/qrcodeData', (req, res) => {
    qrcodeCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.get('/', (req, res) => {
  res.send('Hello !');
});

app.listen(process.env.PORT || port, () => {
  console.log(`we are opened at ${port}`);
});
