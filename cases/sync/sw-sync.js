/**
 * @file sw-sync
 * @author ruoran (liuruoran@baidu.com)
 */

import {featureStore} from 'store';
import {log} from 'log';

self.addEventListener('install', function (event) {
    log('Install event');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    log('Activate event');
});

self.addEventListener('sync', function (event) {
    log('Sync event', event);
    featureStore.setItem('syncEvent', 1);
});

