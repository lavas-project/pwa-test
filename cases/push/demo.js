/**
 * @file push-test
 * @author ruoran (liuruoran@baidu.com)
 */
import 'whatwg-fetch';
import {sleep, grade} from 'helper';
import {log} from 'log';
// import webpush from 'web-push';
const CHECK_LIST = [
    'pushManager', // no statistics
    'pushManager.permissionState',
    'pushManager.getSubscription',
    'pushManager.subscribe',
    'pushSubscription.unsubscribe',
    'pushEvent' // no statistics
];

// const vapidKeys = webpush.generateVAPIDKeys();
const vapidKeys = {
    publicKey: 'BCILcrKBo1kSIZHB3rpO2kAyPm4uinkiL-5wu0eBBzXWGrBDvb020splIapyiTgZmgTxNzp4jKSSa68L4rL3XBY',
    privateKey: 'JfLpqnWY4mKBuH9kcghsfjpdb20lgz92tUuBgllsGPw'
};
// log('vapidKeys:', vapidKeys);
let applicationServerKey;
// uc/qq can't pass urlB64ToUint8Array();
try {
    applicationServerKey = urlB64ToUint8Array(vapidKeys.publicKey);
}
catch (err) {
    // log('error urlB64ToUint8Array', err);
}


export default function (scope) {
    return {
        name: 'push',
        scope: scope,
        features: CHECK_LIST,
        async main() {

            log('<< push-test >>');

            // sw support
            if (!navigator.serviceWorker || !applicationServerKey) {
                log('no applicationServerKey or no sw');
                return;
            }


            // sw register
            const reg = await navigator.serviceWorker.register(scope + 'sw-push.js', {scope});
            await sleep(3000);
            log('sw register', reg);
            const pushManager = reg.pushManager;

            // pushManager test
            if (!pushManager) {
                log('no pushManager', pushManager);
                await reg.unregister();
                log('push: test finish');
                return;
            }
            await grade('pushManager', 1);
            log('- pushManager done -', 1, pushManager);


            // pushManager.permissionState test
            try {
                const permissionState = await pushManager.permissionState({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                await grade('pushManager.permissionState', 1);
                log('- pushManager.permissionState done -', 1);

                if (permissionState === 'denied') {
                    log('permission denied');
                    await reg.unregister();
                    return;
                }
            }
            catch (err) {
                log('Failed to test permissionState: ', err);
            }

            // subscribe test
            let subscribe;
            await new Promise(async (resolve, reject) => {
                let done = 0;
                try {
                    subscribe = await pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey
                    });
                    done = 1;
                    resolve();
                }
                catch (err) {
                    reject();
                    log('Failed to subscribe the user: ', err);
                }

                setTimeout(() => {
                    if (!done) {
                        log('pushManager.subscribe timeout');
                        resolve();
                    }
                }, 5000);
            });

            // getSubscription test
            let getSubscribe;
            await new Promise(async (resolve, reject) => {
                let done = 0;
                try {
                    getSubscribe = await pushManager.getSubscription();
                    await grade('pushManager.getSubscription', 1);
                    log('- pushManager.getSubscription done -', 1);

                    if (getSubscribe) {
                        await grade('pushManager.subscribe', 1);
                        log('- pushManager.subscribe done -', 1);
                    }
                    done = 1;
                    resolve();
                }
                catch (err) {
                    reject();
                    log('Failed to test getSubscription: ', err);
                }

                setTimeout(() => {
                    if (!done) {
                        log('pushManager.getSubscription timeout');
                        resolve();
                    }
                }, 5000);
            });

            if (subscribe) {

                // unsubscribe test
                await subscribe.unsubscribe();
                getSubscribe = await pushManager.getSubscription();
                if (!getSubscribe) {
                    await grade('pushSubscription.unsubscribe', 1);
                }
                log('- pushSubscription.unsubscribe done -', Number(!getSubscribe));
            }

            log('sleep for 5s');
            await sleep(5000);
            log('unregister sw-push.js');
            await reg.unregister();
            log('push: test finish');
        }
    };
}

/**
 * urlB64ToUint8Array public key
 *
 * @param {string} base64String public key
 * @return {Array} outputArray Uint8Array
 */
function urlB64ToUint8Array(base64String) {
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


