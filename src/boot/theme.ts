import { boot } from 'quasar/wrappers';
import useTheme from 'src/modules/useTheme';

export default boot(({ app }) => {
  const { init, isDark } = useTheme();
  init();
  app.provide('isDark', isDark);
});
