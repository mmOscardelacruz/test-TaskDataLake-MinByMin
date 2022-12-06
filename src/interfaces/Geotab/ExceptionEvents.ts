export interface ExceptionEvents {
  activeFrom: string;
  activeTo: string;
  distance: number;
  duration: string;
  rule: Device;
  device: Device;
  diagnostic: string;
  driver: string;
  state: string;
  lastModifiedDateTime: string;
  version: string;
  id: string;
}

export interface Device {
  id: string;
}
