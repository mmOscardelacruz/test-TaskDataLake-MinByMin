import Bluebird from 'bluebird';
import { orderBy } from 'lodash';
import moment from 'moment-timezone';

//import DeviceStatusInfoRepository from '../db/repositories/DeviceStatusInfoRepository';
import { CanEventTelemetry } from '../interfaces/CanEventTelemetry';
import GeotabService from './GeotabService';

export default class MinuteByMinuteReportService {
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

        const DiagnosticEngineSpeedId = await this.geotabService.getStatusData(
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
        );

        const EngineSpeedIdOrderBy = orderBy(DiagnosticEngineSpeedId, ['dateTime'], ['desc']);
        const EngineCoolantTemperatureIdOrderBy = orderBy(DiagnosticEngineCoolantTemperatureId, ['dateTime'], ['desc']);

        const rpm = EngineSpeedIdOrderBy[0].data;
        const tem = EngineCoolantTemperatureIdOrderBy[0].data;

        const uo = deviceGroupsFiltered.map(g => g?.name?.toString().replaceAll('|', '')).join(',');
        const date = moment(deviceStatusIfo.dateTime);
        const Date = date.format('YYYY-MM-DD');
        const Time = date.format('HH:mm:ss');

        const res: CanEventTelemetry = {
          MAND: '',
          VWERK: uo,
          NUM_ECON: device.name,
          RPM: rpm,
          TEMP_Motor: tem,
          LATITUD: deviceStatusIfo.latitude,
          LONGITUD: deviceStatusIfo.longitude,
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
