import { Characteristic, Descriptor } from "@abandonware/bleno";

const FitnessMachineStatus = '2ADA';
const CharacteristicUserDescription = '2901';

const Reset = 0x01;
const FitnessMachineStoppedOrPausedByUser = 0x02;
const FitnessMachineStartedOrResumedByUser = 0x04;

/**
 * Show started/stopped status of FTMS service
 */
export class FitnessMachineStatusCharacteristic extends  Characteristic {
  private updateValueCallback: ((data: Buffer) => void) | null;
  constructor() {
    super({
      uuid: FitnessMachineStatus,
      properties: ['notify'],
      descriptors: [
        new Descriptor({
          uuid: CharacteristicUserDescription,
          value: 'Fitness Machine Status'
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

  notifyReset() {
    let buffer = Buffer.alloc(1);
    buffer.writeUInt8(Reset)
    this.notify(buffer);
  }


  notifyStartOrResume() {
    let buffer = Buffer.alloc(1);
    buffer.writeUInt8(FitnessMachineStartedOrResumedByUser)
    this.notify(buffer);
  }

  notifyStopOrPause() {
    let buffer = Buffer.alloc(1);
    buffer.writeUInt8(FitnessMachineStoppedOrPausedByUser)
    this.notify(buffer);
  }

  notify(buffer: Buffer) {
    if (this.updateValueCallback) {
      this.updateValueCallback(buffer);
    }
    return this.RESULT_SUCCESS;
  }
};
