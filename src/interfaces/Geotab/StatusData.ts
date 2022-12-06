export interface StatusData {
  data: number;
  dateTime: string;
  device: Device;
  diagnostic: Device;
  controller: Controller;
  id: null | string;
  version?: string;
}

export enum Controller {
  ControllerNoneID = 'ControllerNoneId'
}

export interface Device {
  id: ID;
}

export enum ID {
  B1216 = 'b1216',
  DiagnosticAccelerationForwardBrakingID = 'DiagnosticAccelerationForwardBrakingId'
}
