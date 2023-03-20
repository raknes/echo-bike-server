import { Characteristic, Descriptor } from "@abandonware/bleno";
import { FTMS_CONTROL_POINT_UUID, FTMS_USER_DESCRIPTION_UUID } from "../constants";

const RequestControl = 0x00;
const Reset = 0x01;
const StartOrResume = 0x07;
const StopOrPause = 0x08;
const ResponseCode = 0x80;

const Success = 0x01;
const OpCodeNotSupported = 0x02;
const OperationFailed = 0x04;
const ControlNotPermitted = 0x05;

/**
 * Control pont characteristic enables simulating starting or stopping the FTMS service
 */
export class FitnessMachineControlPointCharacteristic extends Characteristic {
  constructor(private indicate: ((data: Buffer) => void) | null = null, private hasControl = false, private isStarted = false) {
    super({
      uuid: FTMS_CONTROL_POINT_UUID,
      properties: ['write', 'indicate'],
      descriptors: [
        new Descriptor({
          uuid: FTMS_USER_DESCRIPTION_UUID,
          value: 'Fitness Machine Control Point'
        })
      ]
    });
  }

  result(opcode: number, result: number) {
    let buffer = Buffer.alloc(3);
    buffer.writeUInt8(ResponseCode);
    buffer.writeUInt8(opcode, 1);
    buffer.writeUInt8(result, 2);
    return buffer;
  }

  onSubscribe(maxValueSize: number, updateValueCallback: (data: Buffer) => void) {
    this.indicate = updateValueCallback;
    return this.RESULT_SUCCESS;
  };

  onUnsubscribe() {
    this.indicate = null;
    return this.RESULT_UNLIKELY_ERROR;
  };

  onIndicate() {
  }

  onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, callback: (result: number) => void) {

    // first byte indicates opcode
    let code = data.readUInt8(0);

    // when would it not be successful?
    callback(this.RESULT_SUCCESS);

    let response = null;

    switch(code){
      case RequestControl:
        if (this.hasControl) {
        }
        else {
          this.hasControl = true;
        }

        // Requesting control always succeeds
        response = this.result(code, Success);
        break;
      case Reset:
        if (this.hasControl) {
          this.hasControl = false;
          this.isStarted = false;
          response = this.result(code, Success);
        }
        else {
          response = this.result(code, ControlNotPermitted);
        }
        break;
      case StartOrResume:
        if (this.hasControl) {
          if (this.isStarted) {
            response = this.result(code, OperationFailed);
          }
          else {
            this.isStarted = true;
            response = this.result(code, Success);

            // Notify all connected clients about the new state
          }
        }
        else {
          response = this.result(code, ControlNotPermitted);
        }
        break;
      case StopOrPause:
        if (this.hasControl) {
          if (this.isStarted) {
            this.isStarted = false;
            response = this.result(code, Success);

            // Notify all connected clients about the new state
          }
          else {
            response = this.result(code, OperationFailed);
          }
        }
        else {
          response = this.result(code, ControlNotPermitted);
        }
        break;
      default:

        let d = Buffer.from(data);
        response = this.result(code, OpCodeNotSupported);
        break;
    }

    if (this.indicate) {
      this.indicate(response);
    }
  }
}
