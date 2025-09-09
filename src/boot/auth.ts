import { boot } from 'quasar/wrappers';
import useUser from 'src/modules/useUser';

/**
 * Authentication Boot File
 * Automatically restores user session when app starts
 * Non-blocking - app will load even if auth restore fails
 */
export default boot(() => {
  console.log('🔑 Starting authentication restore...');

  const { restoreSession } = useUser();

  // Run session restore in background without blocking app startup
  restoreSession()
    .then(() => {
      console.log('✅ Authentication restore completed');
    })
    .catch((error) => {
      console.warn('⚠️ Authentication restore failed:', error);
      // Don't block app startup on auth errors
    });
});
