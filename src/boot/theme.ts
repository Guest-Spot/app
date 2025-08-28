import { boot } from 'quasar/wrappers'
import useTheme from 'src/modules/useTheme';

export default boot(() => {
  const { init } = useTheme();
  init();
})