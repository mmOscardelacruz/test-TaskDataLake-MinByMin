import Bluebird from 'bluebird';
import { max } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { AlertsSpeedRelenti } from '../interfaces/AlertsSpeedRelenti';
import GeotabService from './GeotabService';

let dictDevices: {};

export default class AlertsReportService {
  constructor(
    private readonly geotabService: GeotabService //private readonly deviceStatusInfoRepository: DeviceStatusInfoRepository
  ) {}

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

        const engineSpeedIdEvents = await this.geotabService.getExceptions(
          fromDate,
          toDate,
          'aVRJqJx0PL0a_05fa2yxVfg', //  tiempo activeFrom -activeTo
          deviceId
        );

        const hardBrakingEvents = await this.geotabService.getExceptions(
          fromDate,
          toDate,
          'axmZo1L5By0et9rbqfLKYqg', //logRecord
          deviceId
        );

        const logRecords = await this.geotabService.getLogRecord(
          hardBrakingEvents[hardBrakingEvents.length - 1].activeFrom,
          hardBrakingEvents[hardBrakingEvents.length - 1].activeTo,
          deviceId,
          10
        );

        const maxSpeed = max(logRecords.map(lr => lr.speed));

        const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
        const date = moment(deviceStatusIfo.dateTime);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');

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
      },
      { concurrency: 20 }
    ).filter(x => typeof x !== 'undefined');
    return result;
  }
}
