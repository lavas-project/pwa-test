/**
 * @file sync-test
 * @author ruoran (liuruoran@baidu.com)
 */

import {run} from 'base';
import {featureStore} from 'store';
import {sleep, showCaseName} from 'helper';
import {log} from 'log';
const CHECK_LIST = [
    'syncEvent'
];

const SCOPE = '/cases/sync/';

async function main() {
    showCaseName('sync');

    log('<< sync test >>');

    // sw support
    if (!navigator.serviceWorker) {
        return;
    }

    log('start to register sync sw');
    // syncEvent test
    const reg = await navigator.serviceWorker.register('./sw-sync.js', {scope: SCOPE});
    log('sync sw registered', reg);

    await sleep(3000);



    if (reg && reg.sync) {
        log('has sync object');
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
            log('It broke (probably sync not supported or flag not enabled)', error.message);
            // console.error(error.message);
            return;
        }
    }

    log('sleep for 5000');

    await sleep(5000);
    await reg.unregister();
    log('sync: test finish');

    if (parent && parent.result) {
        log('refresh score');
        parent.result('sync');
    }
};

run({
    name: 'sync',
    scope: SCOPE,
    features: CHECK_LIST,
    main: main
});
