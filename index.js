const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static('public'));

// Generate VAPID Keys automatically
// const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = { publicKey: 'BNu1H6Tm2GK5-LCvkX3qeEW2SK0XS6jasH40XcFPU1X46qvJn5DgBKl02yJuUHH3mEKf8-0RNts__tBqOQSAj8Y', privateKey: 'FRX37NurPyHdB8flepRupSZ58E2HGfh0lZyLG8e0vRI' }

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


// webpush.setVapidDetails(
//     'mailto:example@yourdomain.com',
//     'BNu1H6Tm2GK5-LCvkX3qeEW2SK0XS6jasH40XcFPU1X46qvJn5DgBKl02yJuUHH3mEKf8-0RNts__tBqOQSAj8Y',
//     'FRX37NurPyHdB8flepRupSZ58E2HGfh0lZyLG8e0vRI'
//   );
  
var subscription

app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

// Subscribe Route
app.post('/subscribe', (req, res) => {
  subscription = req.body;

  res.status(201).json({});

  const payload = JSON.stringify({ title: 'Test Push Notification' });

  webpush.sendNotification(subscription, payload).catch(error => console.error(error));
});

app.use(express.json());  // Middleware to parse JSON bodies

app.get('/send', (req, res) => {
  const isActive = req.body.isActive;  // Access the boolean directly from the body
  if (isActive) {
    const payload = JSON.stringify({
        title: "New Notification",
        body: "Here is the content of the notification."
    });

    // Check if there is a subscription object stored
    if (subscription) {
        webpush.sendNotification(subscription, payload)
            .then(result => res.status(200).json({ message: 'Notification sent successfully', result }))
            .catch(error => {
                console.error('Error sending notification:', error);
                res.sendStatus(500);
            });
    } else {
        res.status(404).send('No subscription available.');
    }
  } else {
    res.send('Not Active');
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
//   console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
//   console.log(`VAPID Private Key: ${vapidKeys.privateKey}`);
});