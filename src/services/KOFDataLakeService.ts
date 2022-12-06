import config from '../config';
import { MinByMinTelemetry } from '../interfaces/MinByMinTelemetry';
import HttpAdapter from '../utils/helpers/HttpAdapter';

const {
  safetyURL,
  safetyUser,
  safetyPassword,
  minByMinURL,
  minByMinUser,
  minByMinPassword,
  canEventsURL,
  canEventsUser,
  canEventsPassword,
  alertsSpeedRpmURL,
  alertsSpeedRpmUser,
  alertsSpeedRpmPassword
} = config.sendingData;

export default class KOFDataLakeService {
  private httpAdapter = new HttpAdapter();
  constructor() {
    this.httpAdapter = new HttpAdapter();
  }

  async sendSafetyReport(data: any) {
    const auth = Buffer.from(`${safetyUser}:${safetyPassword}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: auth
    };
    const url = safetyURL;
    const response = await this.httpAdapter.request({
      method: 'POST',
      url,
      data,
      headers
    });

    if (response.status !== 200) {
      throw response.data;
    }
    if (response.data.error) {
      throw response.data.error;
    }
    return response.data;
  }

  async sendMinByMinReport(data: MinByMinTelemetry[]) {
    const auth = Buffer.from(`${minByMinUser}:${minByMinPassword}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`
    };
    const url = minByMinURL;
    const response = await this.httpAdapter.request({
      method: 'POST',
      url,
      data,
      headers
    });
    console.log('Respuesta ->', response.data);
    if (response.status !== 200) {
      throw response.data;
    }
    if (response.data.error) {
      throw response.data.error;
    }
    return response.data;
  }

  async sendCanEventsReport(data: any) {
    const auth = Buffer.from(`${canEventsUser}:${canEventsPassword}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: auth
    };
    const url = canEventsURL;
    const response = await this.httpAdapter.request({
      method: 'POST',
      url,
      data,
      headers
    });
    console.log('Respuesta ->', response.data);

    if (response.status !== 200) {
      throw response.data;
    }
    if (response.data.error) {
      throw response.data.error;
    }
    return response.data;
  }

  async sendAlertsReport(data: any) {
    const auth = Buffer.from(`${alertsSpeedRpmUser}:${alertsSpeedRpmPassword}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: auth
    };
    const url = alertsSpeedRpmURL;
    const response = await this.httpAdapter.request({
      method: 'POST',
      url,
      data,
      headers
    });

    if (response.status !== 200) {
      throw response.data;
    }
    if (response.data.error) {
      throw response.data.error;
    }
    return response.data;
  }
}
