import axios, { AxiosRequestConfig } from 'axios';

export interface IHttpAdapter<T> {
  get: (url: string, config?: AxiosRequestConfig) => Promise<unknown>;
  post: (url: string, body?: T, config?: AxiosRequestConfig) => Promise<unknown>;
  put: (url: string, body?: T, config?: AxiosRequestConfig) => Promise<unknown>;
  delete: (url: string, config?: AxiosRequestConfig) => Promise<unknown>;
  patch: (url: string, body?: T, config?: AxiosRequestConfig) => Promise<unknown>;
  request: (config: AxiosRequestConfig) => Promise<unknown>;
}

class HttpAdapter<T> implements IHttpAdapter<T> {
  private client = axios.create();

  public get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  public post(url: string, body?: T, config?: AxiosRequestConfig) {
    return this.client.post(url, body, config);
  }

  public put(url: string, body?: T, config?: AxiosRequestConfig) {
    return this.client.put(url, body, config);
  }

  public delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }

  public patch(url: string, body?: T, config?: AxiosRequestConfig) {
    return this.client.patch(url, body, config);
  }

  public request(config: AxiosRequestConfig) {
    return this.client.request(config);
  }
}

export default HttpAdapter;
