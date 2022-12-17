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

export default class AlertsReportService {
  constructor(
    private readonly geotabService: GeotabService, 
    private readonly alertVeloc: AlertVelocRepository,
    private readonly alertRalent: AlertRalentiRepository
  ) {}


  async getData(fromDate: string, toDate: string): Promise<[]> {
    

    console.time('Groups');
    const groups = await this.geotabService.getGroups();
    console.timeEnd('Groups');

    console.time('dbAlertRalent');
    const dbAlertRalent = await this.alertRalent.get();

    console.time('dbAlertVeloc');
    const dbAlertVeloc = await this.alertVeloc.get();


    console.timeEnd('dbAlertRalent');
    console.timeEnd('dbAlertVeloc');

    const ralenti = await Bluebird.map(
      dbAlertRalent, async alertServRalenti => {
        const deviceId = alertServRalenti.DevID;
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

      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
      
    /////////////////////////       VELOCIDAD   ////////////////////////////

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
    return ralenti.concat(velocidad);
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