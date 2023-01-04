import Bluebird from 'bluebird';
import { max, min } from 'lodash';
import moment from 'moment-timezone';

import MinByMinTelemetryRepository  from '../db/repositories/MinByMinRepository';
import { MinByMinTelemetry } from '../interfaces/MinByMinTelemetry';
// import {}
import GeotabService from './GeotabService';

export default class CanEventsReportSerevice {
  constructor(
    private readonly geotabService: GeotabService, 
    private readonly MinByMinRepository: MinByMinTelemetryRepository
  ) {}

  // async getMileage(fromDate: string, toDate: string, deviceId: string): Promise<number> {
  //   const statusDataGeotab = await this.geotabService.getStatusData(fromDate, toDate, 'DiagnosticOdometerId', deviceId);

  //   const mileage = statusDataGeotab.map(statusData => statusData.data ?? 0);
  //   const maxData = max(mileage) ?? 0;
  //   const minData = min(mileage) ?? 0;

  //   const km = (maxData - minData) / 1000;

  //   return km;
  // }

  async getData(fromDate: string, toDate: string): Promise<any[]> {
    // const deviceId = 'b1731';
    // const devices = await this.geotabService.getDevices();
    // const groups = await this.geotabService.getGroups();
    // const allDevicesStatusInfo = await this.geotabService.getDeviceStatusInfo();

    // const result =  MinByMinRepository.map( 
    // )
    console.time('Groups');
    const groups = await this.geotabService.getGroups();
    console.timeEnd('Groups');

    console.time('dbMbM');
    const dbMinbyMin = await this.MinByMinRepository.get();

    console.timeEnd('dbMbM');

    const result = await Bluebird.map(
      dbMinbyMin,  async minByMin => {
        const deviceId = minByMin.DEVICE;
        const deviceGeotab = await this.geotabService.getDevices(deviceId);// deviceId
        const device = deviceGeotab.find(d => d.id === deviceId);
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
        const date = moment(minByMin.DateTime);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');
        const mileage = minByMin.KM / 1000;
        const engineStatus = minByMin.STAT_MOT;
        // const mileage = await this.getMileage(fromDate, toDate, deviceId);
      

        const res: MinByMinTelemetry = {
          MAND: '',
          VWERK: uo.slice(0, 4),
          NUM_ECON: device.name,
          LATITUD: minByMin.Latitude,
          LONGITUD: minByMin.Longitude,
          DIA: Date,
          HORA: Time,
          STAT_MOT: engineStatus.toString(),
          VEL: minByMin.VEL,
          KM: mileage,
          TZ: device.timeZoneId,
          ID_PROV: '02'
        };

        return res;
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
    return result;
    
  }
}
