import Bluebird from 'bluebird';
import { max, min } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { MinByMinTelemetry } from '../interfaces/MinByMinTelemetry';
import GeotabService from './GeotabService';

export default class CanEventsReportSerevice {
  constructor(
    private readonly geotabService: GeotabService //private readonly deviceStatusInfoRepository: DeviceStatusInfoRepository
  ) {}

  async getMileage(fromDate: string, toDate: string, deviceId: string): Promise<number> {
    const statusDataGeotab = await this.geotabService.getStatusData(fromDate, toDate, 'DiagnosticOdometerId', deviceId);

    const mileage = statusDataGeotab.map(statusData => statusData.data ?? 0);
    const maxData = max(mileage) ?? 0;
    const minData = min(mileage) ?? 0;

    const km = (maxData - minData) / 1000;

    return km;
  }

  async getData(fromDate: string, toDate: string): Promise<any[]> {
    const deviceId = 'b1731';

    const devices = await this.geotabService.getDevices();

    const groups = await this.geotabService.getGroups();

    const allDevicesStatusInfo = await this.geotabService.getDeviceStatusInfo();

    const result = await Bluebird.map(
      allDevicesStatusInfo,
      async deviceStatusIfo => {
        const deviceId = deviceStatusIfo.device.id;
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

        const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
        const date = moment(deviceStatusIfo.dateTime);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');
        const mileage = await this.getMileage(fromDate, toDate, deviceId);
        const engineStatus = deviceStatusIfo.isDeviceCommunicating;

        const res: MinByMinTelemetry = {
          MAND: '',
          VWERK: uo.slice(0, 4),
          NUM_ECON: device.name,
          LATITUD: deviceStatusIfo.latitude,
          LONGITUD: deviceStatusIfo.longitude,
          DIA: Date,
          HORA: Time,
          STAT_MOT: engineStatus.toString(),
          VEL: deviceStatusIfo.speed,
          KM: mileage,
          TZ: device.timeZoneId,
          ID_PROV: ''
        };

        return res;
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');

    return result;
  }
}
