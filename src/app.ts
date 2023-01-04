import moment from 'moment-timezone';

import config from './config';
import DeviceStatusInfoRepository from './db/repositories/DeviceStatusInfoRepository';
import AlertsReportService from './services/AlertsReportService';
import CanEventsReportSerevice from './services/CanEventsReportSerevice';
import GeotabService from './services/GeotabService';
import KOFDataLakeService from './services/KofDataLakeService';
import MinuteByMinuteReportService from './services/MinuteByMinuteReportService';
import SafetyReportService from './services/SafetyReportService';
import MinByMinTelemetryRepository from './db/repositories/MinByMinRepository';
import EventsCanRepository from './db/repositories/EventsCanRepository';
import AlertRalentiRepository from './db/repositories/AlertRalentiRepository';
import AlertVelocRepository from './db/repositories/AlertVelocRepository';
import EventSafetyNegativeRepository from './db/repositories/EventSafetyNegativeRepository';
import EventSafetyPositiveRepository from './db/repositories/EventSafetyPositiveRepository';
// const fromDate = moment.tz(timeZone).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS');
// const toDate = moment.tz(timeZone).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS');

const fromDate = '2022-11-23 06:00:00.000';
const toDate = '2022-11-24 05:59:59.999';

export const safetyReportController = async () => {
  const { goDatabase, goPassword, goServer, goUsername } = config.geotab;
  const { timeZone } = config;

  const geotabService = new GeotabService(goUsername, goPassword, goDatabase, goServer);
  const kofDataLakeService = new KOFDataLakeService();

  const deviceStatusInfoRepository = new DeviceStatusInfoRepository();
  const EventSafetyNegativeRepositoryApp = new EventSafetyNegativeRepository();
  const EventSafetyPositiveRepositoryApp = new EventSafetyPositiveRepository();
  const safetyReportService = new SafetyReportService(geotabService,EventSafetyNegativeRepositoryApp,EventSafetyPositiveRepositoryApp);

  const reportSafetyData = await safetyReportService.getData(fromDate, toDate);

  await kofDataLakeService.sendSafetyReport(reportSafetyData);

  console.log('Enviando info');
};

export const minByMinReportController = async () => {
  const { goDatabase, goPassword, goServer, goUsername } = config.geotab;
  const { timeZone } = config;

  const geotabService = new GeotabService(goUsername, goPassword, goDatabase, goServer);
  const kofDataLakeService = new KOFDataLakeService();
  const MinByMinRepositoryApp = new MinByMinTelemetryRepository();
  //const deviceStatusInfoRepository = new DeviceStatusInfoRepository(); nonecesario
  const MinByMinReportService = new MinuteByMinuteReportService(geotabService,MinByMinRepositoryApp);

  const reportMinByMinData = await MinByMinReportService.getData(fromDate, toDate);

  await kofDataLakeService.sendMinByMinReport(reportMinByMinData); 

  console.log('Enviando info');
};

export const canEventsReportController = async () => {
  const { goDatabase, goPassword, goServer, goUsername } = config.geotab;
  const { timeZone } = config;

  const geotabService = new GeotabService(goUsername, goPassword, goDatabase, goServer);
  const kofDataLakeService = new KOFDataLakeService();
  const eventsCanRepository = new EventsCanRepository();
  const CanEventsReportService = new CanEventsReportSerevice(geotabService,eventsCanRepository);

  const reportCanEventsData = await CanEventsReportService.getData(fromDate, toDate);

  //await kofDataLakeService.sendCanEventsReport(reportCanEventsData);

  console.log('Enviando info');
};

export const alertsReportController = async () => {
  const { goDatabase, goPassword, goServer, goUsername } = config.geotab;
  const { timeZone } = config;

  const geotabService = new GeotabService(goUsername, goPassword, goDatabase, goServer);
  const kofDataLakeService = new KOFDataLakeService();
  const AlertVelocRepositoryApp = new AlertVelocRepository();
  const AlertRalentiRepositoryApp = new AlertRalentiRepository();
  //const deviceStatusInfoRepository = new DeviceStatusInfoRepository();
  const reportAlertsReportService = new AlertsReportService(geotabService,AlertVelocRepositoryApp,AlertRalentiRepositoryApp);

  const reportAlertsData = await reportAlertsReportService.getData(fromDate, toDate);

  await kofDataLakeService.sendAlertsReport(reportAlertsData);

  console.log('Enviando info');
};
