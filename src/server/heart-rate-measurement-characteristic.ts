import { Characteristic, Descriptor } from "@abandonware/bleno";
import { FTMS_HEART_RATE_DATA_UUID, FTMS_USER_DESCRIPTION_UUID } from "../constants";
import { IndoorBikeData } from "../models/indoor-bike-data";
import { UpdateValueCallback } from "./types";

export class HeartRateMeasurementCharacteristic extends  Characteristic {
  private updateValueCallback: UpdateValueCallback | null;
  constructor() {
    super({
      uuid: FTMS_HEART_RATE_DATA_UUID,
      properties: ['notify'],
      descriptors: [
        new Descriptor({
          uuid: FTMS_USER_DESCRIPTION_UUID,
          value: 'Heart Rate Measurement'
        })
      ]
    });
    this.updateValueCallback = null;
  }

  onSubscribe(maxValueSize: number, updateValueCallback: UpdateValueCallback) {
    console.log('Subscribed HR')
    this.updateValueCallback = updateValueCallback;
    return this.RESULT_SUCCESS;
  };

  onUnsubscribe() {
    this.updateValueCallback = null;
    return this.RESULT_UNLIKELY_ERROR;
  };

  notify(event: IndoorBikeData) {
    console.log('notify');
    if ('heartRate' in event) {
      let buffer = Buffer.alloc(2);

      console.log('heart rate(bpm): ' + event.heartRate);

      buffer.writeUInt8(0, 0);
      buffer.writeUInt8(event.heartRate, 1);

      if (this.updateValueCallback) {
        this.updateValueCallback(buffer);
      }
    }

    return this.RESULT_SUCCESS;
  }
};
