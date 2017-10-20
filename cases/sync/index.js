/**
 * @file sync-test
 * @author ruoran (liuruoran@baidu.com)
 */

import {featureStore} from 'store';
import {sleep, showCaseName} from 'helper';
import {log} from 'log';

(async function () {
    showCaseName('sync');

    log('<< sync test >>');

    // sw support
    if (!navigator.serviceWorker) {
        return;
    }

    featureStore.setItem('syncEvent', 0);

    // syncEvent test
    const reg = await navigator.serviceWorker.register('./sw-sync.js', {scope: '/cases/sync/'});
    await sleep(3000);

    // sync register
    try {
        const tags = await reg.sync.getTags();
        if (tags.includes('syncEventTest')) {
            log('exist syncEventTest background');
        }
        else {
            reg.sync.register('syncEventTest');
            log('sync registered');
        }
    }
    catch (error) {
        console.error('It broke (probably sync not supported or flag not enabled)');
        console.error(error.message);
        return;
    }
    await sleep(5000);
    await reg.unregister();
    log('sync: test finish');

    if (parent) {
        log('refresh score');
        parent.result('sync');
    }
})();
