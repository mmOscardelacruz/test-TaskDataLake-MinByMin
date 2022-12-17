
import { executeSqlCommand } from '../index';
import { AlertRalentiInterface } from '../interfaces/AlertRalentiInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class AlertRalentiRepository {
  async get(): Promise<AlertRalentiInterface[]> {
    try {
      const query = `SELECT public.getalertasralenti();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      
      if(code !== 200){
        throw new Error(message);
      }
      return data as AlertRalentiInterface[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}