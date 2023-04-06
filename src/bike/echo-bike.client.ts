import noble, { Peripheral } from '@abandonware/noble';
import * as events from "events";
import { Observable } from "rxjs";
import { FTMS_CONTROL_POINT_UUID, FTMS_INDOOR_BIKE_DATA_UUID, FTMS_SERVICE_UUID } from '../constants';
import { IndoorBikeData } from '../models/indoor-bike-data';

class EchoBikeClient extends events.EventEmitter {
  private state: IndoorBikeData;
  private peripheral: noble.Peripheral | null = null;
  private indoorBike: noble.Characteristic | null = null;
  constructor() {
    super();
    this.state = {
      flags: 0,
      instantaneousSpeed: 0,
      instantaneousCadence: 0,
      totalDistance: 0,
      instantaneousPower: 0,
      heartRate: 0,
      totalEnergy: 0,
      elapsedTime: 0,
    };
  }

  async init() {
    if (this.peripheral) {
      return;
    }
    let isConnected = false;

    while(!isConnected) {
      try {
        this.peripheral = await this.scan([FTMS_SERVICE_UUID]);
        if (!this.peripheral) {
          console.error('No peripheral found');
          throw new Error('No peripheral found');
        }

        this.peripheral.on('disconnect', () => console.log('disconnected'));
        console.log('connecting to bike');
        await this.peripheral.connectAsync();

        const { characteristics: controlPointCharacteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync(
          [FTMS_SERVICE_UUID], [FTMS_CONTROL_POINT_UUID]
        );
        const [controlPoint] = controlPointCharacteristics;
        await controlPoint.discoverDescriptorsAsync();

        console.log('taking control');
        let response = await controlPoint.writeAsync(Buffer.from("00", "hex"), false);
        console.log('starting workout');
        response = await controlPoint.writeAsync(Buffer.from("07", "hex"), false);

        const { characteristics: indoorBikeCharacteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync(
          [FTMS_SERVICE_UUID], [FTMS_INDOOR_BIKE_DATA_UUID]
        );
        this.indoorBike = indoorBikeCharacteristics.find(x => x.uuid === FTMS_INDOOR_BIKE_DATA_UUID) ?? null;
        if (!this.indoorBike) {
          throw new Error('Indoor bike characteristic not found');
        }
        // await this.indoorBike.discoverDescriptorsAsync();
        console.log('subscribing to indoor bike');
        this.indoorBike.on('data', (data) => {
          this.parseData(data);
        });
        this.indoorBike.subscribeAsync();
        isConnected = true;
      } catch (error) {
        console.error('failed to set up bike subscription', error);
        if (this.peripheral) {
          await this.peripheral.disconnectAsync();
        }
        console.log('Sleeping for 10 seconds before retrying...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async close() {
    console.log('closing bike connection');
    if (this.indoorBike) {
      await this.indoorBike.unsubscribeAsync();
      this.indoorBike = null;
    }
    if (this.peripheral) {
      await this.peripheral.disconnectAsync();
      this.peripheral = null;
    }
  }

  async scan(serviceUUIDs?: string[] | undefined, filter = (peripheral: noble.Peripheral) => true) {
    const promise = new Promise<Peripheral | null>((resolve, reject) => {

      noble.on('discover', (peripheral) => {
        if (filter(peripheral)) {
          console.log('found', peripheral.advertisement.localName);
          resolve(peripheral);
        }
      });
    });

    await noble.startScanningAsync(serviceUUIDs, true);

    try {
      return await promise;
    } finally {
      await noble.stopScanningAsync();
    }
  }

  private parseData(buffer: Buffer) {
    // console.log(buffer.toString('hex'));
    this.state = {
      flags: buffer.readUint16LE(0),
      instantaneousSpeed: buffer.readUInt16LE(2) / 100,
      instantaneousCadence: buffer.readUInt16LE(6) / 2,
      totalDistance: this.readUInt24New(buffer, 10) / 1000,
      instantaneousPower: buffer.readUInt16LE(13),
      totalEnergy: buffer.readUInt8(17),
      heartRate: buffer.readUInt8(22),
      elapsedTime: buffer.readUInt8(23),
    };
    // 101111011110
    // console.log('flags', this.state.flags);
    this.emit('data', this.state);
  }

  private readUInt24New(buffer: Buffer, offset: number) {
    let b = buffer.readUInt8(offset + 2);
    b = b << 16;
    let a = buffer.readUInt16LE(offset);

    return a + b;
  }

  public getObservable() {
    return new Observable<IndoorBikeData>((subscriber) => {
      console.log('got new subscriber, creating bike client');
      this.on('data', (data: IndoorBikeData) => {
        subscriber.next(data);
      });
    });
  }
}
let bikeClient: EchoBikeClient | null = null;

export async function getEchoBikeClient() {
  if (!bikeClient) {
    bikeClient = new EchoBikeClient();
    await bikeClient.init();
    console.log('bike client initialized');
  }
  return bikeClient;
}
