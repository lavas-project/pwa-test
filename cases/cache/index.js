/**
 * @file cache-test by iframe
 * @author ruoran (liuruoran@baidu.com)
 */

import {run} from 'base';
import caseCreator from './demo';

const SCOPE = process.env.ROUTE_PREFIX + '/cases/cache/';

// let case = caseCreator(SCOPE);

run(caseCreator(SCOPE));

