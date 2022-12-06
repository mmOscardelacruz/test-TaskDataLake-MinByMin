import { executeSqlCommand } from '../index';
import { DeviceStatusInfo } from '../interfaces/DeviceStatusInfo';

export default class DeviceStatusInfoRepository {
  async get(fromDate: string, toDate: string): Promise<DeviceStatusInfo[]> {
    try {
      const dbSchema = 'public';
      const query = `SELECT * FROM ${dbSchema}."DeviceStatusInfo" WHERE "DeviceStatusInfo"."DateTime" between $1 and $2;`;
      const devices = await executeSqlCommand(query, [fromDate, toDate], false);

      return devices as DeviceStatusInfo[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
