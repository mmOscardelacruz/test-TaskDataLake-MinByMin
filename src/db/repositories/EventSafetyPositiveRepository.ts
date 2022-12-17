import { executeSqlCommand } from '../index';
import { EventSafetyPositiveInterface } from '../interfaces/EventSafetyPositiveInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class EventSafetyPositiveRepository {
  async get(): Promise<EventSafetyPositiveInterface[]> {
    try {
      const query = `SELECT public.getsafetyeventspos();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      
      if(code !== 200){
        throw new Error(message);
      }
      return data as EventSafetyPositiveInterface[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}