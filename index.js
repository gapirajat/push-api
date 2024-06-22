const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const app = express();
const port = 3000;
const cors = require("cors");


// Allow all domains
app.use(cors());

// Or, specify allowed origin
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Only allow this origin to access resources
//   }),
// );

app.use(bodyParser.json());

app.use(express.static("public"));

// Generate VAPID Keys automatically
// const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = {
  publicKey:
    "BNu1H6Tm2GK5-LCvkX3qeEW2SK0XS6jasH40XcFPU1X46qvJn5DgBKl02yJuUHH3mEKf8-0RNts__tBqOQSAj8Y",
  privateKey: "FRX37NurPyHdB8flepRupSZ58E2HGfh0lZyLG8e0vRI",
};

webpush.setVapidDetails(
  "mailto:rajatshinde01@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

var subscription;

app.get("/vapidPublicKey", (req, res) => {
  res.send(vapidKeys.publicKey);
});

// Subscribe Route
app.post("/subscribe",async (req, res) => {
    console.log(typeof(req.body));
    // console.log(JSON.stringify(req.body).replace(/\s+/g, ''));
    fetch(`https://adapted-firefly-48360.upstash.io`, {
        headers: {
          Authorization: "Bearer AbzoAAIncDE5MjhkNzJjOGIyNWE0YzQyYjQwMWE0N2ZjMDRmOWM2MXAxNDgzNjA"
        },
        body: `["SET", "sessionData", "${req.body}"]`,
        method: 'POST',
      }).then(response => response.json())
        .then(data => console.log(data));  
    const response = await fetch(`https://adapted-firefly-48360.upstash.io/get/user_1_session/`, {
        headers: {
            Authorization: "Bearer AbzoAAIncDE5MjhkNzJjOGIyNWE0YzQyYjQwMWE0N2ZjMDRmOWM2MXAxNDgzNjA"
        }
        });
    const data = await response.json();    
    subscription = stringToObject(data.result);

  res.status(201).json({});

  const payload = JSON.stringify({ title: "Test Push Notification" });


// Call the function to send the notification
await sendWebPushNotification(subscription, payload);
});

const stringToObject = (str) => {
    try {
        return (new Function('return ' + str))();
    } catch (error) {
        console.error('Error converting string to object:', error);
        return null;
    }
};

async function sendWebPushNotification(subscriptio, payload) {
    if (subscriptio) {
      try {
        let res;
        const result = await webpush.sendNotification(subscriptio, payload);
        return result
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
    }

}

async function redis() {
    const url = 'https://adapted-firefly-48360.upstash.io/get/user_1_session/';
    const token = 'AbzoAAIncDE5MjhkNzJjOGIyNWE0YzQyYjQwMWE0N2ZjMDRmOWM2MXAxNDgzNjA';

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('Error fetching data:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        const sub = stringToObject(data.result);

        return sub;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
};

app.use(express.json()); // Middleware to parse JSON bodies

app.post("/send",async (req, res) => {
  console.log(req.body);
  const payload = JSON.stringify({
    title: req.body.name + " - " + req.body.contact,
    body: "email:" + req.body.email + " - " + req.body.text,
  });

  // Check if there is a subscription object stored
  if (subscription) {
    console.log('hi')
    webpush
      .sendNotification(subscription, payload)
      .then((result) =>
        res
          .status(200)
          .json({ message: "Notification sent successfully", result }),
      )
      .catch((error) => {
        console.error("Error sending notification:", error);
        res.sendStatus(500);
      });
  } else {
    console.log('hi2');
    subscription = await redis();
    if (subscription) {
        console.log('h3i')
        console.log(await subscription);
        const result = await sendWebPushNotification(subscription, payload)
        res.status(200).json({ message: "Notification sent successfully", result });
    }
    else{
            res.status(404).send("No subscription available.");
    }

  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  //   console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
  //   console.log(`VAPID Private Key: ${vapidKeys.privateKey}`);
});
