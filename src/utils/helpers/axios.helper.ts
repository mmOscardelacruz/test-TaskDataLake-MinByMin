import axios, { isCancel, AxiosError } from 'axios';
import http = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const call = async ({
  method,
  url,
  data = null,
  params = null,
  headers = null,
}) => {
  try {
    const options = {
      method,
      url,
      data,
      params,
      headers,
      httpsAgent,
    };

    const response = await axios(options);

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
};
