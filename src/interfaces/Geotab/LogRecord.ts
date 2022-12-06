export interface LogRecord {
  latitude: number;
  longitude: number;
  speed: number;
  dateTime: string;
  device: Device;
  id: null | string;
}

export interface Device {
  id: string;
}
