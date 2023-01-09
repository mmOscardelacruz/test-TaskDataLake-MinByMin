import Bluebird from 'bluebird';
import { orderBy } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import GeotabService from './GeotabService';
import { EventsCanInterface } from '../db/interfaces/EventsCanInterface';
import EventsCanRepository from '../db/repositories/EventsCanRepository';
import { CanEventTelemetry } from '../interfaces/CanEventTelemetry';
import { Device } from '../interfaces/Geotab/Devices';
import { Group } from '../interfaces/Geotab/Group';

export default class CanEventsReportSerevice {
  devicesList: Device[] = []
  constructor(
    private readonly geotabService: GeotabService,
    private readonly EventsCanRepository: EventsCanRepository
  ) { }

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

    console.time('dbEvCan');
    const dbEventsCan = await this.EventsCanRepository.get();

    console.timeEnd('dbEvCan');
      let i = 0;
    const result = await Bluebird.map(
      dbEventsCan, async eventsCan => {
        const deviceId = eventsCan.DEVICE;
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
            /*const DiagnosticEngineSpeedId = await this.geotabService.getStatusData(
            fromDate,
            toDate,
            'DiagnosticEngineSpeedId',
            deviceId
          );
  
          const DiagnosticEngineCoolantTemperatureId = await this.geotabService.getStatusData(
            fromDate,
            toDate,
            'DiagnosticEngineCoolantTemperatureId',
            deviceId
          );*/
  
          /*const EngineSpeedIdOrderBy = orderBy(DiagnosticEngineSpeedId, ['dateTime'], ['desc']);
          const EngineCoolantTemperatureIdOrderBy = orderBy(DiagnosticEngineCoolantTemperatureId, ['dateTime'], ['desc']);*/
  
          /*const rpm = EngineSpeedIdOrderBy[0].data;
          const tem = EngineCoolantTemperatureIdOrderBy[0].data;*/
  
          const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
          const date = moment(eventsCan.Fecha);
          const Date = date.format('YYYY-MM-DD');
          const Time = date.format('HH:mm:ss');
          
  
          const res: CanEventTelemetry = {
            MAND: '',
            VWERK: uo,
            NUM_ECON: eventsCan.DEVICE,
            RPM: eventsCan.RPM, 
            TEMP_Motor: eventsCan.TEMP_Motor, 
            LATITUD: eventsCan.Latitude,
            LONGITUD: eventsCan.Longitude,
            DIA: Date,
            HORA: Time,
            ID_PROV: '02'
          };
          return res;
          }
  
          
        }

       
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
    return result;
    
    }catch(error){
      console.log(error);
      return [];
    }
  }
}
