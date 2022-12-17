
import { executeSqlCommand } from '../index';
import { AlertVelocInterface } from '../interfaces/AlertVelocInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class AlertVelocRepository {
  async get(): Promise<AlertVelocInterface[]> {
    try {
      const query = `SELECT public.getalertasvelocidad();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      
      if(code !== 200){
        throw new Error(message);
      }
      return data as AlertVelocInterface[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}