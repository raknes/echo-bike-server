import bleno from '@abandonware/bleno';
import echoBikeClient from './bike/echo-bike.client';
import { FTMS_SERVICE_UUID } from './constants';
import { FitnessMachineService } from './server/fitness-machine-service';
(async () => {
  const ftmsService = new FitnessMachineService(echoBikeClient);

  // Start advertising the FTMS service
  bleno.on('stateChange', (state: string) => {
    console.log(`Bleno state: ${state}`);
    if (state === 'poweredOn') {
      bleno.startAdvertising('FTMS', [FTMS_SERVICE_UUID], (error: Error | null | undefined) => {
        if (error) {
          console.error(error);
        } else {
          console.log('FTMS advertising started');
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
