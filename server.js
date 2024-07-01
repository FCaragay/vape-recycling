const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Database connection
mongoose.connect('mongodb://localhost:27017/vape-recycling', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  phoneNumber: String,
  qrCode: String,
  vapeCount: Number,
});

const User = mongoose.model('User', UserSchema);

app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const { phoneNumber } = req.body;
  const user = new User({ phoneNumber, vapeCount: 0 });
  await user.save();
  res.status(201).send(user);
});

app.post('/login', async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    return res.status(404).send('User not found');
  }

  const qrCode = await QRCode.toDataURL(phoneNumber);
  user.qrCode = qrCode;
  await user.save();
  res.send(user);
});

app.get('/user/:phoneNumber', async (req, res) => {
  const user = await User.findOne({ phoneNumber: req.params.phoneNumber });
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.send(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
