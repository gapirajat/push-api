async function getVapidPublicKey() {
    try {
        const response = await fetch('/vapidPublicKey');
        if (!response.ok) {
            throw new Error('Failed to fetch the VAPID public key');
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching VAPID public key:', error);
    }
}

async function subscribe() {
    if (true) {
        try {
            const publicKey = await getVapidPublicKey();
            if (!publicKey) {
                console.error('VAPID public key is undefined');
                return;
            }

            const registration = await navigator.serviceWorker.register('./sw.js');
            if (!registration) {
                console.error('Service Worker registration failed');
                return;
            }

            // Check if registration has a pushManager
            if (!registration.pushManager) {
                console.error('PushManager not available');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send the subscription object to the server
            await fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });

            console.log('Subscribed!');
            document.getElementById('subscribe').disabled = true;
            document.getElementById('unsubscribe').disabled = false;
        } catch (error) {
            console.error('Error subscribing', error);
        }
    } else {
        console.warn('Push messaging is not supported');
    }
}


function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

document.getElementById('subscribe').addEventListener('click', subscribe);
