import { alertsReportCron, canEventsReportCron, DebugControllers, minByMinReportCron, safetyReportCron } from './crons';

// safetyReportCron.start();
// minByMinReportCron.start();
// canEventsReportCron.start();
// alertsReportCron.start();

DebugControllers.start();
