export interface DeviceStatusInfo {
  id: string;
  GeotabId: string;
  Bearing: number;
  CurrentStateDuration: string;
  DateTime: Date;
  DeviceId: string;
  DriverId: string;
  IsDeviceCommunicating: boolean;
  IsDriving: boolean;
  IsHistoricLastDriver: boolean;
  Latitude: number;
  Longitude: number;
  Speed: number;
  RecordLastChangedUtc: Date;
}
