import { PrimaryService } from "@abandonware/bleno";
import { Observable } from "rxjs";
import { FTMS_HEART_RATE_SERVICE_UUID } from "../constants";
import { IndoorBikeData } from "../models/indoor-bike-data";
import { HeartRateMeasurementCharacteristic } from "./heart-rate-measurement-characteristic";


export class HeartRateService extends PrimaryService {
  constructor(
    private bikeObservable: Observable<IndoorBikeData>,
    private heartRateMeasurementCharacteristic = new HeartRateMeasurementCharacteristic()) {
    super({
      uuid: FTMS_HEART_RATE_SERVICE_UUID,
      characteristics: [
        heartRateMeasurementCharacteristic
      ]
    });
    console.log('subscribing to bike');


    // Connect the bike observable to the HR service
    this.bikeObservable.subscribe((event) => this.heartRateMeasurementCharacteristic.notify(event));
  }
}
