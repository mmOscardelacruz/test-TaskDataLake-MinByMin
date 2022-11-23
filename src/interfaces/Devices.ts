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
  activeFrom?: string;
  activeTo?: string;
  autoGroups?: any[];
  customParameters?: CustomParameter[];
  disableBuzzer?: boolean;
  enableBeepOnIdle?: boolean;
  enableMustReprogram?: boolean;
  enableSpeedWarning?: boolean;
  engineType?: string;
  engineVehicleIdentificationNumber?: string;
  ensureHotStart?: boolean;
  gpsOffDelay?: number;
  idleMinutes?: number;
  isSpeedIndicator?: boolean;
  licensePlate?: string;
  licenseState?: string;
  major?: number;
  minAccidentSpeed?: number;
  minor?: number;
  parameterVersion?: number;
  pinDevice?: boolean;
  speedingOff?: number;
  speedingOn?: number;
  vehicleIdentificationNumber?: string;
  goTalkLanguage?: string;
  fuelTankCapacity?: number;
  wifiHotspotLimits?: any[];
  parameterVersionOnDevice?: number;
  comment?: string;
  groups?: Group[];
  timeZoneId?: string;
  deviceFlags?: DeviceFlags;
  deviceType?: string;
  id?: string;
  ignoreDownloadsUntil?: string;
  maxSecondsBetweenLogs?: number;
  name?: string;
  productId?: number;
  serialNumber?: string;
  timeToDownload?: string;
  workTime?: string;
  devicePlans?: string[];
  devicePlanBillingInfo?: DevicePlanBillingInfo[];
  customProperties?: any[];
  mediaFiles?: any[];
  disableSleeperBerth?: boolean;
  autoHos?: string;
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
}

export interface CustomFeatures {}

export interface CustomParameter {
  bytes?: string;
  description?: string;
  isEnabled?: boolean;
  offset?: number;
}

export interface DeviceFlags {
  activeFeatures?: string[];
  isActiveTrackingAllowed?: boolean;
  isEngineAllowed?: boolean;
  isGarminAllowed?: boolean;
  isHOSAllowed?: boolean;
  isIridiumAllowed?: boolean;
  isOdometerAllowed?: boolean;
  isTripDetailAllowed?: boolean;
  isUIAllowed?: boolean;
  isVINAllowed?: boolean;
  ratePlans?: any[];
}

export interface DevicePlanBillingInfo {
  billingLevel?: number;
  devicePlanName?: string;
}

export interface Group {
  id?: string;
}
