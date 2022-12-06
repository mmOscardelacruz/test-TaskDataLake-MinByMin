import Bluebird from 'bluebird';
import { max, mean } from 'lodash';
import moment from 'moment-timezone';

import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { TelemetrySafetiSapi } from '../interfaces/TelemetrySafetiSapi';
import GeotabService from './GeotabService';

export default class SafetyReportService {
  constructor(
    private readonly geotabService: GeotabService,
    private readonly deviceStatusInfoRepository: DeviceStatusInfoRepository
  ) {}

  async getData(fromDate: string, toDate: string): Promise<any[]> {
    const deviceId = 'b1731';

    const devices = await this.geotabService.getDevices();
    const dbDevices = await this.deviceStatusInfoRepository.get(fromDate, toDate);

    const groups = await this.geotabService.getGroups();

    const allDevicesStatusInfo = await this.geotabService.getDeviceStatusInfo();

    const result = await Bluebird.map(
      allDevicesStatusInfo,
      async dsi => {
        const deviceId = dsi.device.id;
        const device = devices.find(d => d.id === deviceId);

        if (!device) {
          return;
        }
        const deviceGroups = device.groups.map(x => groups.find(y => y.id === x.id));
        const deviceGroupsFiltered = deviceGroups.filter(g => g?.name?.includes('|'));
        const isValidGroup = deviceGroups.some(g => g?.name?.includes('|'));

        if (!isValidGroup) {
          return;
        }
        const diagnosticAccelerationForwardEvents = await this.geotabService.getStatusData(
          fromDate,
          toDate,
          'DiagnosticAccelerationForwardBrakingId',
          deviceId
        );

        const diagnosticAccelerationSideToSideEvents = await this.geotabService.getStatusData(
          fromDate,
          toDate,
          'DiagnosticAccelerationSideToSideId',
          deviceId
        );

        const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
        const diagnosticAccelerationSideToSideDataPositive = diagnosticAccelerationForwardEvents.map(event => {
          if (event.data > 0) {
            return event.data;
          } else {
            return;
          }
        });
        const hardBrakingEventsData = diagnosticAccelerationForwardEvents.map(event => {
          if (event.data < 0) {
            return event.data;
          } else {
            return;
          }
        });
        const curveAccelerationData = diagnosticAccelerationSideToSideEvents.map(event => event.data ?? 0);

        const acelGMax = max(diagnosticAccelerationSideToSideDataPositive) ?? 0;
        const acelGProm = mean(diagnosticAccelerationSideToSideDataPositive) ?? 0;

        const date = moment(dsi.dateTime);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');

        const frenGMax = max(hardBrakingEventsData) ?? 0;
        const frenGProm = mean(hardBrakingEventsData) ?? 0;

        const turnGMax = max(curveAccelerationData) ?? 0;
        const turnGProm = mean(curveAccelerationData) ?? 0;

        const res: TelemetrySafetiSapi = {
          MAND: '',
          VWERK: uo,
          NUM_ECON: device.name,
          ACEL_G_MAX: acelGMax,
          ACEL_G_PROM: acelGProm,
          LATITUD: dsi.latitude,
          LONGITUD: dsi.longitude,
          DIA: Date,
          HORA: Time,
          FRENO_G_MAX: frenGMax,
          FRENO_G_PROM: frenGProm,
          GIRO_PROM: turnGMax,
          GIRO_MAX: turnGProm,
          ID_PROV: ''
        };

        return res;
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');

    return result;
  }
}
