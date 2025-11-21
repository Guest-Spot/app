import { useTattooStylesStore } from 'src/stores/tattooStyles';
import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { TATTOO_STYLES_QUERY } from 'src/apollo/types/tattoo';
import type { ITattooData } from 'src/interfaces/tattoo';

const useTattooStyles = () => {
  const store = useTattooStylesStore();

  const styles = computed(() => store.getStyles);
  const isLoading = computed(() => store.getIsLoading);
  const error = computed(() => store.getError);

  const fetchStyles = async () => {
    if (store.getStyles.length > 0) return; // Already loaded

    store.setIsLoading(true);
    try {
      const { load, result, onError } = useLazyQuery<ITattooData>(
        TATTOO_STYLES_QUERY,
        {},
        {
          fetchPolicy: 'cache-first',
        }
      );

      onError((err) => {
        console.error('Error fetching tattoo styles:', err);
        store.setError(err.message);
        store.setIsLoading(false);
      });

      await load();

      if (result.value?.styles) {
        store.setStyles(result.value.styles);
      }
    } catch (e) {
      console.error('Error fetching tattoo styles:', e);
      store.setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      store.setIsLoading(false);
    }
  };

  return {
    styles,
    isLoading,
    error,
    fetchStyles,
  };
};

export default useTattooStyles;

