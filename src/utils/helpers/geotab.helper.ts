import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

import axiosHelper from './axios.helper';

import config from '../../../src/config';
const { goAuthApiURL, goAuthApiKey } = config.geotab;

class API {
  constructor(
    userName,
    password,
    sessionId,
    database,
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
      server,
    };
  }

  async post(method, params) {
    try {
      const body = JSON.stringify({
        method,
        params,
      });
      const headers = {
        'Content-Type': 'application/json',
      };
      const url = this.uri;
      const response = (
        await axiosHelper.call({
          method: 'POST',
          url,
          data: body,
          headers,
        })
      ).result;

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async call(method, params) {
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
          userName: this.credentials.userName,
        },
      };

      const result = await this.post(method, params);

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async multicall(calls) {
    try {
      if (!calls) {
        throw new Error('Must provide calls');
      }
      const formattedCalls = calls.map((call) => {
        return {
          method: call[0],
          params: call[1] || {},
        };
      });

      const result = await this.post('ExecuteMultiCall', {
        calls: formattedCalls,
        credentials: {
          database: this.credentials.database,
          sessionId: this.credentials.sessionId,
          userName: this.credentials.userName,
        },
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
        userName: this.credentials.userName,
      };
      const result = await this.post('Authenticate', params);

      this.credentials.server =
        result.path && result.path !== 'ThisServer'
          ? result.path
          : this.credentials.server;
      this.credentials.sessionId = result.securityToken.sessionId;
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export class GeotabHelper {
  constructor(username, password, database, server) {
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
        'Content-Type': 'application/json',
        key: goAuthApiKey,
      };

      const data = {
        username: this.username,
        password: this.password,
        database: this.database,
        server: this.server,
      };

      const result = await axiosHelper.call({
        method: 'POST',
        url,
        data,
        headers,
      });

      const credentials = await jwt.verify(result.token, goAuthApiKey);
      const api = new API(
        credentials.username,
        null,
        credentials.sessionId,
        credentials.database,
        credentials.server
      );

      return api;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
