import { CronJob } from 'cron';
import { main } from './app';

import config from './config';

const { cronExpression } = config.cron;
const { timeZone } = config;

export const devicesCron = new CronJob(
  cronExpression,
  async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
      devicesCron.stop();
    }
  },
  () => console.log('job stopping'),
  true,
  timeZone
);

export const exceptionsCron = new CronJob(
  cronExpression,
  async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
      exceptionsCron.stop();
    }
  },
  () => console.log('job stopping'),
  true,
  timeZone
);
