import Bluebird from 'bluebird';
import { max, mean } from 'lodash';
import moment from 'moment-timezone';

import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { TelemetrySafetiSapi } from '../interfaces/TelemetrySafetiSapi';
import GeotabService from './GeotabService';
import EventSafetyNegativeRepository from '../db/repositories/EventSafetyNegativeRepository';
import EventSafetyPositiveRepository from '../db/repositories/EventSafetyPositiveRepository';
import { Device } from '../interfaces/Geotab/Devices';
import { Group } from '../interfaces/Geotab/Group';

export default class SafetyReportService {
  devicesList: Device[] = []
  constructor(
    private readonly geotabService: GeotabService,
    private readonly eventSafetyNeg: EventSafetyNegativeRepository,
    private readonly eventSafetyPos: EventSafetyPositiveRepository
  ) {}


  async getDevicesInit (){
    const deviceGeotab: Device[] = await this.geotabService.getDevicesAux();
    this.devicesList =  deviceGeotab;
   }

  async getData(fromDate: string, toDate: string): Promise<any[]> {
    try {
      console.log(this.devicesList);
      
    console.time('Groups');
    const groups = await this.geotabService.getGroups();
    console.timeEnd('Groups');

    console.time('dbEventSafetyNeg');
    const dbEventSafetyNeg = await this.eventSafetyNeg.get();

    console.time('dbEventSafetyPos');
    const dbEventSafetyPos = await this.eventSafetyPos.get();


    console.timeEnd('dbEventSafetyNeg');
    console.timeEnd('dbEventSafetyPos');
      let i = 0;
    const safetyNeg = await Bluebird.map(
      dbEventSafetyNeg, async safetyEvents => {
        const deviceId = safetyEvents.DeviceId;
        // const deviceGeotab = await this.geotabService.getDevices(deviceId); //deviceId
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
        const date = moment(safetyEvents.Hora_Dia);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');


        const res: TelemetrySafetiSapi = {
          MAND: '400',
          VWERK: uo.slice(0,4),
          NUM_ECON: safetyEvents.NUM_ECON,
          ACEL_G_MAX: safetyEvents.ACEL_G_MAX,
          ACEL_G_PROM: safetyEvents.ACEL_G_PROM,
          LATITUD: safetyEvents.Latitude,
          LONGITUD: safetyEvents.Longitude,
          DIA: Date,
          HORA: Time,
          FRENO_G_MAX:  safetyEvents.Freno_G_MAZ,
          FRENO_G_PROM: safetyEvents.Freno_G_PROM,
          GIRO_PROM:  safetyEvents.GIRO_Prom,
          GIRO_MAX: safetyEvents.GIRO_Max,
          ID_PROV: '02'
        };

        return res;
        }

        
        }

      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
      //////////////////////POSITIVE
      const safetyPos = await Bluebird.map(
        dbEventSafetyPos, async safetyEventsPos => {
          const deviceId = safetyEventsPos.DeviceId;
          // const deviceGeotab = await this.geotabService.getDevices(deviceId); //deviceId
          const deviceGeotab = this.devicesList;
          const device = deviceGeotab.find(d => d.id === deviceId);
  
          if (device != undefined) {
            const deviceGroups = device.groups.map(x => groups.find(y => y.id === x.id));
          const deviceGroupsFiltered = deviceGroups.filter(g => g?.name?.includes('|'));
          const isValidGroup = deviceGroups.some(g => g?.name?.includes('|'));
  
          if (isValidGroup === true) {
            
          const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
          const date = moment(safetyEventsPos.Hora_Dia);
          const Date = date.format('YYYY-MM-DD');
          const Time = date.format('HH:mm:ss');
  
  
          const res: TelemetrySafetiSapi = {
            MAND: '400',
            VWERK: uo,
            NUM_ECON: safetyEventsPos.NUM_ECON,
            ACEL_G_MAX: safetyEventsPos.ACEL_G_MAX,
            ACEL_G_PROM: safetyEventsPos.ACEL_G_PROM,
            LATITUD: safetyEventsPos.Latitude,
            LONGITUD: safetyEventsPos.Longitude,
            DIA: Date,
            HORA: Time,
            FRENO_G_MAX:  safetyEventsPos.Freno_G_MAZ,
            FRENO_G_PROM: safetyEventsPos.Freno_G_PROM,
            GIRO_PROM:  safetyEventsPos.GIRO_Prom,
            GIRO_MAX: safetyEventsPos.GIRO_Max,
            ID_PROV: '02'
          };
  
          return res;
          }
  
          }
  
          
        },
        { concurrency: 20 }
      ).filter(x => typeof x !== 'undefined');

      // return safetyNeg;

    return safetyNeg.concat(safetyPos);
    } catch (error) {
      console.log(error);
      return [];
    }

  }
}
