import { CronJob } from 'cron';

import {
  alertsReportController,
  canEventsReportController,
  minByMinReportController,
  safetyReportController
} from './app';
import config from './config';

const { cronExpression } = config.cron;
const { timeZone } = config;

export const safetyReportCron = new CronJob(
  cronExpression,
  async () => {
    try {
      console.log('safetyReportCron starter');
      await safetyReportController();
    } catch (error) {
      console.error(error);
      safetyReportCron.stop();
    }
  },
  () => console.log('safetyReportCron stopping'),
  true,
  timeZone
);

export const minByMinReportCron = new CronJob(
  cronExpression,
  async () => {
    try {
      console.log('minByMinReportCron starter');
      await minByMinReportController();
    } catch (error) {
      console.error(error);
      minByMinReportCron.stop();
    }
  },
  () => console.log('minByMinReportCron stopping'),
  true,
  timeZone
);

export const canEventsReportCron = new CronJob(
  cronExpression,
  async () => {
    try {
      console.log('canEventsReportCron starter');
      await canEventsReportController();
    } catch (error) {
      console.error(error);
      canEventsReportCron.stop();
    }
  },
  () => console.log('canEventsReportCron stopping'),
  true,
  timeZone
);

export const alertsReportCron = new CronJob(
  cronExpression,
  async () => {
    try {
      console.log('alertsReportCron starter');
      await alertsReportController();
    } catch (error) {
      console.error(error);
      alertsReportCron.stop();
    }
  },
  () => console.log('safetyReportCron stopping'),
  true,
  timeZone
);

export class DebugControllers {
  static async start() {
    try {
      // console.log('alertsReportController starter');
      // await alertsReportController();
      // console.log('alertsReportController end');
      console.log('canEventsReportController starter');
      await canEventsReportController();
      console.log('canEventsReportController end');
      // console.log('minByMinReportController starter');
      // await minByMinReportController();
      // console.log('minByMinReportController end');
      // console.log('safetyReportController starter');
      // await safetyReportController();
      // console.log('safetyReportController end');
    } catch (error) {
      console.error(error);
    }
  }
}
