import Bluebird, { any } from 'bluebird';
import { max, min } from 'lodash';
import moment from 'moment-timezone';

import MinByMinTelemetryRepository from '../db/repositories/MinByMinRepository';
import { MinByMinTelemetry } from '../interfaces/MinByMinTelemetry';
// import {}
import GeotabService from './GeotabService';
import { Device } from '../interfaces/Geotab/Devices';
import { Group } from '../interfaces/Geotab/Group';

export default class  MinuteByMinuteReportService{
  devicesList: Device[] = []
  constructor(
    private readonly geotabService: GeotabService,
    private readonly MinByMinRepository: MinByMinTelemetryRepository
  ) { }
   
  // async getMileage(fromDate: string, toDate: string, deviceId: string): Promise<number> {
  //   const statusDataGeotab = await this.geotabService.getStatusData(fromDate, toDate, 'DiagnosticOdometerId', deviceId);

  //   const mileage = statusDataGeotab.map(statusData => statusData.data ?? 0);
  //   const maxData = max(mileage) ?? 0;
  //   const minData = min(mileage) ?? 0;

  //   const km = (maxData - minData) / 1000;

  //   return km;
  // }
    async getDevicesInit (){
     const deviceGeotab: Device[] = await this.geotabService.getDevicesAux();
     this.devicesList =  deviceGeotab;
    }
    
  async getData(fromDate: string, toDate: string): Promise<any[]> {
    try {
      // console.log(this.devicesList);
      // const deviceId = 'b1731';
      // const devices = await this.geotabService.getDevices();
      // const groups = await this.geotabService.getGroups();
      // const allDevicesStatusInfo = await this.geotabService.getDeviceStatusInfo();

      // const result =  MinByMinRepository.map( 
      // )
      // console.time('Groups');
      const groups = await this.geotabService.getGroups();
      // console.timeEnd('Groups');

      // console.time('dbMbM');
      const dbMinbyMin = await this.MinByMinRepository.get();

      // console.timeEnd('dbMbM');
      let i=0;
      const result = await Bluebird.map(
        dbMinbyMin, async minByMin => {
          const deviceId = minByMin.DEVICE;
          // const deviceGeotab = await this.geotabService.getDevices(deviceId);// deviceId
          const deviceGeotab = this.devicesList;
          const device = deviceGeotab.find(d => d.id === deviceId);
          
          i ++;
          if(i === 100 || i === 500 || i === 1000 || i === 1200){
          console.log(i);
          }
          if (device != undefined) {
            const deviceGroups = device.groups.map(x => groups.find(y => y.id === x.id));
            const deviceGroupsFiltered = deviceGroups.filter(g => g?.name?.includes('|'));
            const isValidGroup = deviceGroups.some(g => g?.name?.includes('|'));

            if (isValidGroup === true) {
              const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
              const date = moment(minByMin.DateTime);
              const Date = date.format('YYYY-MM-DD');
              const Time = date.format('HH:mm:ss');
              const mileage = minByMin.KM / 1000;
              const engineStatus = minByMin.STAT_MOT;
              // const mileage = await this.getMileage(fromDate, toDate, deviceId);


              const res: MinByMinTelemetry = {
                MAND: '400',
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
            }


          }

        },
        { concurrency: 20 }
      ).filter(x => typeof x !== 'undefined');
      return result;

    } catch (error) {
      console.log(error);
      return [];
    }

  }
}
