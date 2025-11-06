import * as Sentry from '@sentry/aws-serverless';

import { config } from './config/env';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: 1.0,
  });
}
