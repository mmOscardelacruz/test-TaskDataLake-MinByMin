import { executeSqlCommand } from '../index';
import { EventSafetyNegativeInterface } from '../interfaces/EventSafetyNegativeInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class EventSafetyNegativeRepository {
  async get(): Promise<EventSafetyNegativeInterface[]> {
    try {
      const query = `SELECT public.getsafetyeventsneg();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      
      if(code !== 200){
        throw new Error(message);
      }
      return data as EventSafetyNegativeInterface[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}