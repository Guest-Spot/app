import { boot } from 'quasar/wrappers'
import useUser from 'src/modules/useUser';

export default boot(async () => {
  const { fetchUserAndProfile } = useUser();
  await fetchUserAndProfile();
})
