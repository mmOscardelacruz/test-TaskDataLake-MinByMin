import { connected } from 'process';
import { executeSqlCommand } from '../index';
import { EventsCanInterface } from '../interfaces/EventsCanInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class EventsCanRepository {
  async get(): Promise<EventsCanInterface[]> {
    try {
      const query = `SELECT public.geteventoscan();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      
      if(code !== 200){
        throw new Error(message);
      }
      return data as EventsCanInterface[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}