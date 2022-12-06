import jwt from 'jsonwebtoken';

import config from '../../config';
import HttpAdapter from './HttpAdapter';

const { goAuthApiURL, goAuthApiKey } = config.geotab;

interface GeotabAuthorizerResponse {
  ok: boolean;
  token: string;
}

interface Credentials {
  userName: string;
  password: string | null;
  sessionId: string | null;
  database: string;
  server: string;
}

interface GeotabAuthorizerCredentials {
  username: string;
  password: string | null;
  sessionId: string | null;
  database: string;
  server: string;
}

export class API {
  private uri: string;
  private credentials: Credentials;

  constructor(
    userName: string,
    password: string | null,
    sessionId: string | null,
    database: string,
    server = 'my1.geotab.com'
  ) {
    if (!userName) {
      throw new Error('Must supply userName');
    }
    if (!database) {
      throw new Error('Must supply database');
    }
    if (!password && !sessionId) {
      throw new Error('Must supply password or session id');
    }
    this.uri = `https://${server || 'my1.geotab.com'}/apiv1`;
    this.credentials = {
      userName,
      password,
      sessionId,
      database,
      server
    };
  }

  async post(method: string, params: unknown) {
    try {
      const body = JSON.stringify({
        method,
        params
      });
      const headers = {
        'Content-Type': 'application/json'
      };
      const url = this.uri;

      const httpAdapter = new HttpAdapter();

      const response = await httpAdapter.request({
        method: 'POST',
        url,
        data: body,
        headers
      });

      if (response.status !== 200) {
        throw response.data;
      }
      if (response.data.error) {
        throw response.data.error;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async call(method: string, params: any) {
    try {
      if (!method) {
        throw new Error('Must provide method');
      }
      if (!params) {
        params = {};
      }

      params = {
        ...params,
        credentials: {
          database: this.credentials.database,
          sessionId: this.credentials.sessionId,
          userName: this.credentials.userName
        }
      };

      const res = await this.post(method, params);

      return res.result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async multicall(calls: [[string, any]]) {
    try {
      if (!calls) {
        throw new Error('Must provide calls');
      }
      const formattedCalls = calls.map(call => {
        return {
          method: call[0],
          params: call[1] || {}
        };
      });

      const result = await this.post('ExecuteMultiCall', {
        calls: formattedCalls,
        credentials: {
          database: this.credentials.database,
          sessionId: this.credentials.sessionId,
          userName: this.credentials.userName
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async authenticate() {
    try {
      const params = {
        database: this.credentials.database,
        password: this.credentials.password,
        userName: this.credentials.userName
      };
      const { data } = await this.post('Authenticate', params);

      this.credentials.server = data.path && data.path !== 'ThisServer' ? data.path : this.credentials.server;
      this.credentials.sessionId = data.securityToken.sessionId;
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export class GeotabHelper {
  private username: string;
  private password: string;
  private database: string;
  private server: string;

  constructor(username: string, password: string | null, database: string, server: string) {
    if (!username) {
      throw new Error(`'username' is required`);
    }
    if (!password) {
      throw new Error(`'password' is required`);
    }
    if (!database) {
      throw new Error(`'database' is required`);
    }
    if (!server) {
      throw new Error(`'server' is required`);
    }
    this.username = username;
    this.password = password;
    this.database = database;
    this.server = server;
  }

  async getApi() {
    try {
      const url = `${goAuthApiURL}/login`;

      const headers = {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        key: goAuthApiKey
      };

      const geotabCredentials: GeotabAuthorizerCredentials = {
        username: this.username,
        password: this.password,
        database: this.database,
        server: this.server,
        sessionId: null
      };

      const httpAdapter = new HttpAdapter();
      const { data } = await httpAdapter.request({
        method: 'POST',
        url,
        data: geotabCredentials,
        headers
      });

      // const { status, data } = await httpAdapter.post(url, geotabCredentials, {
      //   headers
      // });

      const { token } = data as GeotabAuthorizerResponse;

      const credentials: any = await jwt.verify(token, goAuthApiKey);

      const api = new API(credentials.username, null, credentials.sessionId, credentials.database, credentials.server);

      return api;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
