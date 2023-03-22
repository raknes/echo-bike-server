import { Characteristic, Descriptor } from "@abandonware/bleno";
import { FTMS_INDOOR_BIKE_DATA_UUID, FTMS_USER_DESCRIPTION_UUID, HeartRatePresent, InstantaneousCadencePresent, InstantaneousPowerPresent } from "../constants";
import { IndoorBikeData } from "../models/indoor-bike-data";

/**
 * Notify clients about changes in indoor bike data values
 */
export class IndoorBikeDataCharacteristic extends Characteristic {
  private updateValueCallback: ((data: Buffer) => void) | null;
  constructor() {
    super({
      uuid: FTMS_INDOOR_BIKE_DATA_UUID,
      properties: ['notify'],
      descriptors: [
        new Descriptor({
          uuid: FTMS_USER_DESCRIPTION_UUID,
          value: 'Indoor Bike Data'
        })
      ]
    });
    this.updateValueCallback = null;
  }

  onSubscribe(maxValueSize: number, updateValueCallback: (data: Buffer) => void) {
    this.updateValueCallback = updateValueCallback;
    return this.RESULT_SUCCESS;
  };

  onUnsubscribe() {
    this.updateValueCallback = null;
    return this.RESULT_UNLIKELY_ERROR;
  };

  notify(event: IndoorBikeData) {

    let flags = 0;
    let offset = 0;
    let buffer = Buffer.alloc(30);

    offset += 2;
    let flagField = buffer.subarray(0, offset);

    // Speed must always be the first measurement, always present
    console.debug('speed(kmh): ' + event.instantaneousSpeed);
    buffer.writeUInt16LE(event.instantaneousSpeed ?? 100, offset);
    offset += 2;

    if ('instantaneousCadence' in event) {
      flags |= InstantaneousCadencePresent;
      // cadence is in 0.5rpm resolution but is supplied in 1rpm resolution, multiply by 2 for ble.
      let cadence = event.instantaneousCadence * 2
      console.debug('cadence(rpm): ' + cadence + ' (' + event.instantaneousCadence + ')');
      buffer.writeUInt16LE(cadence, offset);
      offset += 2;
    }

    if ('instantaneousPower' in event) {
      flags |= InstantaneousPowerPresent;

      console.debug('power(W): ' + event.instantaneousPower);
      buffer.writeInt16LE(event.instantaneousPower, offset);
      offset += 2;
    }

    if ('heartRate' in event) {
      flags |= HeartRatePresent;

      console.debug('hr(bpm): ' + event.heartRate);
      buffer.writeUInt16LE(event.heartRate, offset);
      offset += 2;
    }

    //Write the available data field flags
    flagField.writeUInt16LE(flags);

    let finalbuffer = buffer.subarray(0, offset);

    if (this.updateValueCallback) {
      this.updateValueCallback(finalbuffer);
    }

    return this.RESULT_SUCCESS;
  }
};
