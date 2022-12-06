export interface DeviceStatusInfo {
  bearing: number;
  currentStateDuration: string;
  exceptionEvents: ExceptionEvent[];
  isDeviceCommunicating: boolean;
  isDriving: boolean;
  latitude: number;
  longitude: number;
  speed: number;
  dateTime: string;
  device: Device;
  driver: PurpleDriver | DriverEnum;
  isHistoricLastDriver: boolean;
  groups: Device[];
}

export interface Device {
  id: string;
}

export interface PurpleDriver {
  driverGroups: Device[];
  id: string;
  isDriver: boolean;
}

export enum DriverEnum {
  UnknownDriverID = 'UnknownDriverId'
}

export interface ExceptionEvent {
  activeFrom: string;
  activeTo: string;
  distance: number;
  duration: string;
  rule: Device;
  device: Device;
  diagnostic: Device | DiagnosticEnum;
  driver: FluffyDriver | DriverEnum;
  state: State;
  lastModifiedDateTime: string;
  version: string;
  id: string;
}

export enum DiagnosticEnum {
  NoDiagnosticID = 'NoDiagnosticId'
}

export interface FluffyDriver {
  id: string;
  isDriver: boolean;
}

export enum State {
  ExceptionEventStateValidID = 'ExceptionEventStateValidId'
}
