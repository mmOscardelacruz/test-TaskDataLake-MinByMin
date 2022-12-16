import Bluebird from 'bluebird';
import { orderBy } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import GeotabService from './GeotabService';
import { EventsCanInterface } from '../db/interfaces/EventsCanInterface';
import EventsCanRepository from '../db/repositories/EventsCanRepository';
import { CanEventTelemetry } from '../interfaces/CanEventTelemetry';

export default class MinuteByMinuteReportService {
  constructor(
    private readonly geotabService: GeotabService,
    private readonly EventsCanRepository: EventsCanRepository
  ) { }

  async getData(fromDate: string, toDate: string): Promise<any[]> {
    // const deviceId = 'b1731';
    // const devices = await this.geotabService.getDevices();
    // const groups = await this.geotabService.getGroups();
    // const allDevicesStatusInfo = await this.geotabService.getDeviceStatusInfo();

    console.time('Groups');
    const groups = await this.geotabService.getGroups();
    console.timeEnd('Groups');

    console.time('dbEvCan');
    const dbEventsCan = await this.EventsCanRepository.get();

    console.timeEnd('dbEvCan');

    const result = await Bluebird.map(
      dbEventsCan, async eventsCan => {
        const deviceId = eventsCan.DEVICE;
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
          ID_PROV: ''
        };
        return res;
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
    return result;
  }
}
