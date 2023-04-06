import bleno from '@abandonware/bleno';
import { FTMS_SERVICE_UUID } from './constants';
import { FitnessMachineService } from './server/fitness-machine-service';

const ftmsService = new FitnessMachineService();
// const hrService = new HeartRateService(echoBikeClient);
(async () => {
  // Start advertising the FTMS service
  bleno.on('stateChange', (state: string) => {
    console.log(`Bleno state: ${state}`);
    if (state === 'poweredOn') {
      bleno.startAdvertising('Echo Bike FTMS',
                            // [FTMS_SERVICE_UUID, FTMS_HEART_RATE_SERVICE_UUID],
                            [FTMS_SERVICE_UUID],
                            (error: Error | null | undefined) => {
        if (error) {
          console.error(error);
        } else {
          console.log('FTMS advertising started');
          // bleno.setServices([ftmsService, hrService], (error: Error | null | undefined) => {
          bleno.setServices([ftmsService], (error: Error | null | undefined) => {
            if (error) {
              console.error(error);
            } else {
              console.log('FTMS services set');
            }
          });
        }
      });
    } else {
      bleno.stopAdvertising();
      console.log('FTMS advertising stopped');
    }
  });
})();
