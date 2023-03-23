import { setBit } from './utils';

export const FTMS_HEART_RATE_SERVICE_UUID = '180d';
export const FTMS_SERVICE_UUID = '1826';
export const FTMS_INDOOR_BIKE_DATA_UUID = '2ad2';
export const FTMS_HEART_RATE_DATA_UUID = "2a37";
export const FTMS_CONTROL_POINT_UUID = '2ad9';
export const FTMS_USER_DESCRIPTION_UUID = '2901';
export const FTMS_FEATURE_UUID = '2acc';

export const AverageSpeedSupported = setBit(1);
export const CadenceSupported = setBit(1);
export const TotalDistanceSupported = setBit(2);
export const HeartRateMeasurementSupported = setBit(10);
export const ElapsedTimeSupported = setBit(12);
export const PowerMeasurementSupported = setBit(14);

export const InstantaneousCadencePresent = setBit(2);
export const TotalDistancePresent = setBit(4);
export const InstantaneousPowerPresent = setBit(6);
export const TotalEnergyPresent = setBit(8);
export const HeartRatePresent = setBit(9);
export const ElapsedTimePresent = setBit(11);
