import { PrimaryService } from "@abandonware/bleno";
import { FTMS_SERVICE_UUID } from "../constants";
import { FitnessMachineControlPointCharacteristic } from './fitness-machine-control-point-characteristic';
import { FitnessMachineFeatureCharacteristic } from './fitness-machine-feature-characteristic';
import { FitnessMachineStatusCharacteristic } from './fitness-machine-status-characteristic';
import { IndoorBikeDataCharacteristic } from './indoor-bike-data-characteristic';

export class FitnessMachineService extends PrimaryService {
  constructor(
    private fitnessMachineFeatureCharacteristic = new FitnessMachineFeatureCharacteristic(),
    private indoorBikeCharacteristic = new IndoorBikeDataCharacteristic(),
    private fitnessMachineStatusCharacteristic = new FitnessMachineStatusCharacteristic(),
    private fitnessMachineControlPointCharacteristic = new FitnessMachineControlPointCharacteristic()) {
    super({
      uuid: FTMS_SERVICE_UUID,
      characteristics: [
        fitnessMachineFeatureCharacteristic,
        indoorBikeCharacteristic,
        fitnessMachineStatusCharacteristic,
        fitnessMachineControlPointCharacteristic
      ]
    });
  }
}
