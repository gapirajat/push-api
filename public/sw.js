self.addEventListener("push", function (event) {
    console.log("Push event received:", event.data.text()); // Log raw data

    const data = event.data.json();
    console.log("Notification data:", data);

    const options = {
        body: data.body,
        icon: "icon.png",
        badge: "badge.png",
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
