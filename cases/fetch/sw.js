/**
 * @file fetch sw
 * @author clark-t (clarktanglei@163.com)
 */

import {checkProperties, grade} from 'helper';
import {log} from 'log';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    log('fetch sw: onfetch');

    grade('fetchEvent', 1);
    checkProperties(e, ['request', 'respondWith'], 1, {prefix: 'fetchEvent.'});
    let url = new URL(e.request.url);
    if (url.pathname.endsWith('/whoareyou.json')) {
        let mock = {im: 'fetch-sw'};
        log('fetch sw: mock respone', mock);

        e.respondWith(new Response(
            JSON.stringify(mock),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ));
    }
});