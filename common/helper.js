/**
 * @file helper.js
 * @author clark -t (clarktanglei@163.com)
 */

import {featureStore} from 'store';

/**
 * unregister sw controller and then reload the page
 */
export async function init(scopes) {
    const sw = navigator.serviceWorker;

    if (!sw || typeof sw.getRegistration !== 'function') {
        return;
    }

    let results = await unregister(scopes);

    if (results.some(result => result === true)) {
        await reload();
    }
}

export async function register(filePath, scope) {
    return navigator.serviceWorker.register(filePath, {scope});
}

export async function unregister(scopes) {
    let arr = Array.isArray(scopes) ? scopes : [scopes];

    return await Promise.all(
        arr.map(async scope => {
            let reg;

            switch (typeof scope) {
                case 'string':
                case 'undefined':
                    reg = await navigator.serviceWorker.getRegistration(scope);
                    break;
                case 'object':
                    reg = scope;
                    break;
                default:
                    break;
            }

            if (reg) {
                return await reg.unregister();
            }
        })
    );
}

/**
 * reload webpage, return a no-resolve promise object to block execute
 * usage: await reload();
 *
 * @return {Promise} promise object to block execute
 */
export async function reload() {
    return new Promise(() => {
        location.reload();
    });
}

/**
 * attach a handler to an event, and the handler executes at most once per event type
 *
 * @param {Element} target event target
 * @param {string} event event name
 * @param {Function} fn event handler
 * @return {Promise} promise
 */
export async function one(target, event, fn) {
    return new Promise((resolve, reject) => {
        function handler(e) {
            Promise.resolve(fn(e))
            .then(() => {
                target.removeEventListener(event, handler);
                resolve();
            })
            .catch(() => {
                target.removeEventListener(event, handler);
                reject();
            });
        }

        target.addEventListener(event, handler);
    });
}

/**
 * block the execution for a period of time
 *
 * @param {number} duration sleep duration time
 * @return {Promise} promise
 */
export function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export function limit(fn, time) {
    return new Promise((resolve, reject) => {
        fn().then(resolve);
        sleep(time).then(reject);
    });
}

export function until(fn, interval = 50) {
    return new Promise(resolve => {
        let timer = setInterval(
            async () => {
                if (await fn()) {
                    clearInterval(timer);
                    resolve();
                }
            },
            interval
        );
    });
}

export function zero(list) {
    return Promise.all(list.map(feature => score(feature, 0)));
}

export function score(feature, score) {
    return featureStore.setItem(feature, score);
}

export function createStep({name, prefix = 'pwa-test-step-'}) {
    const key = prefix + name;

    const getStep = () => +localStorage.getItem(key);

    let stepNumber = -1;
    let target = getStep();

    const step = async (fn, needReload = true) => {
        stepNumber++;

        if (target === stepNumber) {
            await fn();
            target++;

            if (needReload) {
                localStorage.setItem(key, target);
                await reload();
            }
        }
    };

    step.getCurrentStep = () => stepNumber;

    step.getTargetStep = getStep;

    step.beforeRun = async fn => {
        if (target === 0 && stepNumber === 0) {
            await fn();
        }
    };

    step.done = () => {
        localStorage.removeItem(key);
    };

    return step;
}

// export function createQueue(name, prefix = 'pwa-test-queue-') {
//     const queue = async ()
// }