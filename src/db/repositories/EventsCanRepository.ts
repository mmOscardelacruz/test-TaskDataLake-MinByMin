import { connected } from 'process';
import { Device } from '../../interfaces/Geotab/Devices';
import { executeSqlCommand } from '../index';
import { EventsCanInterface } from '../interfaces/EventsCanInterface';
import { SQLMetricaResponse } from '../interfaces/SQLMetricaResponse';

export default class EventsCanRepository {
  public async get(): Promise<EventsCanInterface[]> {
    try {
      const query = `SELECT public.geteventoscan();`;
      const [res] = Object.values(await executeSqlCommand(query,[],true));
      const {code,data,message} = res as SQLMetricaResponse;
      console.log(data.length);
      const rpms = data.map(colum => colum.RPM_id);
      const rpmsAux = '{'+rpms.toString()+'}'
      const queryUpd = `SELECT public.update_inserted('${rpmsAux}');`;
      const resUpd = await executeSqlCommand(queryUpd,[],true);
      
      if(code !== 200){
        throw new Error(message);
      }
      
      
      return data as EventsCanInterface[];
      
      
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  
  //  public async update(RPM_ids:number[]):Promise<void>{
  //   try {
      
  //     const queryUpd = `SELECT public.update_inserted(ids_rows string[]);`;
  //     const [resUpd] = Object.values(await executeSqlCommand(queryUpd,[],true));
  //     const {code,data,message} = resUpd as SQLMetricaResponse;

  //     if(code !== 200){
  //       throw new Error(message);
  //     }
  //     return ;

  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }
}

