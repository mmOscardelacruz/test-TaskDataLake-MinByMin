export interface Device {
  auxWarningSpeed?: number[];
  enableAuxWarning?: boolean[];
  enableControlExternalRelay?: boolean;
  externalDeviceShutDownDelay?: number;
  immobilizeArming?: number;
  immobilizeUnit?: boolean;
  isAuxIgnTrigger?: boolean[];
  isAuxInverted?: boolean[];
  accelerationWarningThreshold?: number;
  accelerometerThresholdWarningFactor?: number;
  brakingWarningThreshold?: number;
  corneringWarningThreshold?: number;
  enableBeepOnDangerousDriving?: boolean;
  enableBeepOnRpm?: boolean;
  engineHourOffset?: number;
  isActiveTrackingEnabled?: boolean;
  isDriverSeatbeltWarningOn?: boolean;
  isPassengerSeatbeltWarningOn?: boolean;
  isReverseDetectOn?: boolean;
  isIoxConnectionEnabled?: boolean;
  odometerFactor?: number;
  odometerOffset?: number;
  rpmValue?: number;
  seatbeltWarningSpeed?: number;
  activeFrom: string;
  activeTo: string;
  autoGroups?: Group[];
  customParameters?: CustomParameter[];
  disableBuzzer?: boolean;
  enableBeepOnIdle?: boolean;
  enableMustReprogram?: boolean;
  enableSpeedWarning?: boolean;
  engineType?: EngineType;
  engineVehicleIdentificationNumber?: string;
  ensureHotStart?: boolean;
  gpsOffDelay?: number;
  idleMinutes?: number;
  isSpeedIndicator?: boolean;
  licensePlate?: string;
  licenseState?: LicenseState;
  major?: number;
  minAccidentSpeed?: number;
  minor?: number;
  parameterVersion?: number;
  pinDevice?: boolean;
  speedingOff?: number;
  speedingOn?: number;
  vehicleIdentificationNumber?: string;
  goTalkLanguage?: GoTalkLanguage;
  fuelTankCapacity?: number;
  wifiHotspotLimits?: any[];
  parameterVersionOnDevice?: number;
  comment: string;
  groups: Group[];
  timeZoneId: TimeZoneID;
  deviceFlags?: DeviceFlags;
  deviceType: DeviceType;
  id: string;
  ignoreDownloadsUntil: string;
  maxSecondsBetweenLogs: number;
  name: string;
  productId: number;
  serialNumber: string;
  timeToDownload: TimeToDownload;
  workTime: WorkTime;
  devicePlans?: DevicePlan[];
  devicePlanBillingInfo?: DevicePlanBillingInfo[];
  customProperties: any[];
  mediaFiles?: any[];
  disableSleeperBerth?: boolean;
  autoHos?: AutoHos;
  customFeatures?: CustomFeatures;
  obdAlertEnabled?: boolean;
  deltaDistance?: number;
  deltaHeading?: number;
  deltaHeadingHS?: number;
  deltaHeadingMinSpeed?: number;
  deltaHeadingMinSpeedHS?: number;
  deltaMinSpeed?: number;
  deltaSpeed?: number;
  harshBreak?: number;
  isHarshBrakeWarningOn?: boolean;
  channel?: number[];
  channelCount?: number;
  frequencyOffset?: number;
  isAidedGpsEnabled?: boolean;
  isRfUploadOnWhenMoving?: boolean;
  rfParameterVersion?: number;
  trailerId?: string;
  hardwareId?: number;
}

export interface Group {
  id: string;
}

export enum AutoHos {
  Auto = 'AUTO',
  On = 'ON'
}

export interface CustomFeatures {
  autoHos?: boolean;
}

export interface CustomParameter {
  bytes: Bytes;
  description: Description;
  isEnabled: boolean;
  offset: number;
}

export enum Bytes {
  Aa = 'AA==',
  Ag = 'Ag==',
  Aq = 'AQ==',
  Ba = 'BA==',
  CA = 'CA==',
  Ea = 'EA==',
  GA = 'gA=='
}

export enum Description {
  DisableAccelerometerReverseDetect = 'Disable Accelerometer Reverse Detect',
  EnableAccelPedalCurve = 'Enable Accel Pedal Curve',
  EnableBetaDieselFuel = 'Enable Beta Diesel Fuel',
  EnableDriverViolationAlarmDuration = 'Enable Driver Violation Alarm Duration',
  FuelTypeDiesel = 'Fuel Type Diesel',
  InvalidateEngineBasedRoadSpeed = 'Invalidate Engine Based Road Speed',
  J1708BusIdleWaitTime = 'J1708 Bus Idle Wait Time',
  LogDebug = 'Log Debug',
  NumberOfValidGPSRecordsToBeIgnored = 'Number of valid GPS records to be ignored'
}

export interface DeviceFlags {
  activeFeatures: ActiveFeature[];
  isActiveTrackingAllowed: boolean;
  isEngineAllowed: boolean;
  isGarminAllowed: boolean;
  isHOSAllowed: boolean;
  isIridiumAllowed: boolean;
  isOdometerAllowed: boolean;
  isTripDetailAllowed: boolean;
  isUIAllowed: boolean;
  isVINAllowed: boolean;
  ratePlans: any[];
}

export enum ActiveFeature {
  GeotabDriveHos = 'GeotabDriveHos',
  GoActive = 'GoActive',
  Mobileye = 'Mobileye',
  UnknownDevice = 'UnknownDevice'
}

export interface DevicePlanBillingInfo {
  billingLevel: number;
  devicePlanName: DevicePlan;
}

export enum DevicePlan {
  Pro = 'Pro',
  ProMode = 'Pro Mode',
  ProPlus = 'ProPlus',
  ProPlusMode = 'ProPlus Mode',
  Suspend = 'Suspend',
  Terminate = 'Terminate',
  TerminateMode = 'Terminate Mode',
  Unknown = 'Unknown'
}

export enum DeviceType {
  Go6 = 'GO6',
  Go7 = 'GO7',
  Go9 = 'GO9',
  None = 'None',
  OldGeotab = 'OldGeotab'
}

export enum EngineType {
  EngineTypeGenericID = 'EngineTypeGenericId'
}

export enum GoTalkLanguage {
  English = 'English',
  Spanish = 'Spanish'
}

export enum LicenseState {
  AdrianGonzalezKofCOMMX = 'ADRIAN.GONZALEZ@KOF.COM.MX',
  CarlosMaldonadoMetricamovilCOM = 'carlos.maldonado@metricamovil.com',
  CuernavacaMorelos = 'CUERNAVACA MORELOS',
  Empty = '',
  Guanajuato = 'Guanajuato',
  JiutepecMorelos = 'JIUTEPEC MORELOS',
  JosueRubioMetricamovilCOM = 'josue.rubio@metricamovil.com',
  Papantla = 'PAPANTLA',
  QE = 'Q-E',
  Querétaro = 'Querétaro',
  Querétero = 'Querétero',
  Veracruz = 'VERACRUZ'
}

export enum TimeToDownload {
  The1000000 = '1.00:00:00'
}

export enum TimeZoneID {
  AmericaMexicoCity = 'America/Mexico_City',
  AmericaMonterrey = 'America/Monterrey',
  AmericaNewYork = 'America/New_York',
  EtcGMT5 = 'Etc/GMT+5'
}

export enum WorkTime {
  WorkTimeStandardHoursID = 'WorkTimeStandardHoursId'
}
