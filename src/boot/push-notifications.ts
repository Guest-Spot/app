import { defineBoot } from '#q-app/wrappers';
import { initializePushNotifications } from 'src/modules/usePushNotifications';

export default defineBoot(() => {
  void initializePushNotifications();
});
