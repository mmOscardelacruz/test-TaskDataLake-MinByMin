import { executeSqlCommand } from '../index';
import { MinByMinTelemetry } from '../interfaces/MinByMinTelemetry';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class MinByMinTelemetryRepository {
  async get(): Promise<MinByMinTelemetry[]> {
    try {
      const query = `select public.getpuntoapunto();`;
      const [res] = Object.values(await executeSqlCommand(query, [], true));
      const { code, data, message } = res as SQLMetricaResponse;
      if (code !== 200) {
        throw new Error(message);
      }

      return data as MinByMinTelemetry[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}