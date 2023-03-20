import { Characteristic, Descriptor } from "@abandonware/bleno";
import { CadenceSupported, ElapsedTimeSupported, FTMS_FEATURE_UUID, FTMS_USER_DESCRIPTION_UUID, PowerMeasurementSupported } from "../constants";

export class FitnessMachineFeatureCharacteristic extends  Characteristic {
  constructor() {
    super({
      uuid: FTMS_FEATURE_UUID,
      properties: ['read'],
      descriptors: [
        new Descriptor({
          uuid: FTMS_USER_DESCRIPTION_UUID,
          value: 'Fitness Machine Feature'
        })
      ],
    });
  }

  onReadRequest(offset: number, callback: (result: number, data?: Buffer) => void) {
    console.log('FTMS feature read', offset);

    // 4.3 FitnessMachineFeature - 8 octets
    let flags = Buffer.alloc(8);

    // 4.3.1.1 Fitness Machine Features Field
    flags.writeUInt32LE(CadenceSupported | PowerMeasurementSupported | ElapsedTimeSupported);

    // 4.3.1.2 Target Setting Features Field
    flags.writeUInt32LE(0x0, 4);

    callback(this.RESULT_SUCCESS, flags);
  }
}
