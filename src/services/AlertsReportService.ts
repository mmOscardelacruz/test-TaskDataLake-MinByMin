import Bluebird from 'bluebird';
import { max } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { AlertsSpeedRelenti } from '../interfaces/AlertsSpeedRelenti';
import GeotabService from './GeotabService';
// import { AlertVelocInterface } from '../db/interfaces/AlertVelocInterface';
// import { AlertRalentiInterface } from '../db/interfaces/AlertRalentiInterface';
import AlertVelocRepository from '../db/repositories/AlertVelocRepository';
import AlertRalentiRepository from '../db/repositories/AlertRalentiRepository';
import { Device } from '../interfaces/Geotab/Devices';
import { Group } from '../interfaces/Geotab/Group';
export default class AlertsReportService {
  devicesList: Device[] = []
  constructor(
    private readonly geotabService: GeotabService, 
    private readonly alertVeloc: AlertVelocRepository,
    private readonly alertRalent: AlertRalentiRepository
  ) {}

  async getDevicesInit (){
    const deviceGeotab: Device[] = await this.geotabService.getDevicesAux();
    this.devicesList =  deviceGeotab;
   }
   
  async getData(fromDate: string, toDate: string): Promise<any[]> {
    try {
      console.log(this.devicesList);

    console.time('GroupsAlert');
    const groups = await this.geotabService.getGroups();
    console.timeEnd('GroupsAlert');

    console.time('dbAlertRalent');
    const dbAlertRalent = await this.alertRalent.get();

    console.time('dbAlertVeloc');
    const dbAlertVeloc = await this.alertVeloc.get();


    console.timeEnd('dbAlertRalent');
    console.timeEnd('dbAlertVeloc');

    console.time('serviceRalenti');
    let i = 0;
    const ralenti = await Bluebird.map(
      dbAlertRalent, async alertServRalenti => {
        const deviceId = alertServRalenti.DevID;
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
          const date = moment(alertServRalenti.DIA_HORA);
          const Date = date.format('YYYY-MM-DD');
          const Time = date.format('HH:mm:ss');
  
  
  
          const res: AlertsSpeedRelenti = {
            VWERK: uo,
            NUM_ECON: alertServRalenti.NUM_ECON,
            LATITUD: alertServRalenti.Latitude,
            LONGITUD: alertServRalenti.Longitude,
            DIA: Date,
            HORA: Time,
            TipoAlerta: alertServRalenti.TipoAlerta,
            Indicador: alertServRalenti.Indicador,
            TimeStart: alertServRalenti.TimeStart,
            TimeEnd: alertServRalenti.TimeEnd,
            Equipment: alertServRalenti.Equipment,
            ID_PROV: '02'
          };
          return res;
          //
        }

       
        }


      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
      console.timeEnd('serviceRalenti');
    /////////////////////////       VELOCIDAD   ////////////////////////////

    console.time('velocService');
    const velocidad = await Bluebird.map(
      dbAlertVeloc, async alertServVeloc => {
      const deviceId = alertServVeloc.DevID;
      const deviceGeotab = await this.geotabService.getDevices(deviceId); //deviceId
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
    const date = moment(alertServVeloc.DIA_HORA);
    const Date = date.format('YYYY-MM-DD');
    const Time = date.format('HH:mm:ss');



    const rest: AlertsSpeedRelenti = {
      VWERK: uo,
      NUM_ECON: alertServVeloc.NUM_ECON,
      LATITUD: alertServVeloc.Latitude,
      LONGITUD: alertServVeloc.Longitude,
      DIA: Date,
      HORA: Time,
      TipoAlerta: alertServVeloc.TipoAlerta,
      Indicador: alertServVeloc.Indicador,
      TimeStart: alertServVeloc.TimeStart,
      TimeEnd: alertServVeloc.TimeEnd,
      Equipment: alertServVeloc.Equipment,
      ID_PROV: '02'
    };
    return rest;
  },
  { concurrency: 20 }
).filter(x => typeof x !== 'undefined');
    console.timeEnd('velocService');
    return ralenti.concat(velocidad);
}catch(error){
  console.log(error);
      return [];
}

  }
}
  
/*
 //exeption events
 const res: AlertsSpeedRelenti = {
  VWERK: uo,
  NUM_ECON: device.name,
  LATITUD: deviceStatusIfo.latitude,
  LONGITUD: deviceStatusIfo.longitude,
  DIA: Date,
  HORA: Time,
  TipoAlerta: '',
  Indicador: '',
  TimeStart: '',
  TimeEnd: '',
  Equipment: 0,
  ID_PROV: ''
};
return res;
*/