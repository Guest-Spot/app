import { useI18n } from 'vue-i18n';

const useDate = () => {
  const { t: $t, locale } = useI18n({ useScope: 'global' });

  const timeAgoCache = new Map();
  const CACHE_DURATION = 60000; // 1 minute cache

  const formatTime = (time: string, { useAmPm = true }: { useAmPm?: boolean } = {}): string => {
    if (!time) return '';

    // Remove seconds from time format hh:mm:ss -> hh:mm
    const timeWithoutSeconds = time.split(':').slice(0, 2).join(':');

    if (!useAmPm) {
      return timeWithoutSeconds;
    }

    // Convert to AM/PM format
    const [hours, minutes] = timeWithoutSeconds.split(':');
    const hoursNum = parseInt(hours ?? '0', 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hours12}:${minutes} ${period}`;
  };

  const formatToFullTime = (time: string): string => {
    if (!time) return '';

    // Check if time is in hh:mm format
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = time.match(timeRegex);

    if (!match) return '';

    const [, hours, minutes] = match;

    // Ensure hours are in HH format (two digits)
    const paddedHours = hours?.padStart(2, '0');

    // Return in HH:mm:ss.SSS format
    return `${paddedHours}:${minutes}:00.000`;
  };

  const formatDate = (
    date: string | Date,
    { useUsFormat = true }: { useUsFormat?: boolean } = {},
  ): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    // US format: MM/DD/YYYY, International format: DD/MM/YYYY
    return useUsFormat ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
  };

  function pluralize(value: number, type: string) {
    const key = value <= 1 ? 'one' : value > 1 && value <= 4 ? 'few' : 'many';
    return $t(`date.${type}.${key}`);
  }

  function formatTimeAgo(dateString: string) {
    const now = Date.now();
    const cacheKey = `${locale.value}__${dateString}`;

    // Check cache first
    if (timeAgoCache.has(cacheKey)) {
      const cached = timeAgoCache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.result;
      } else {
        timeAgoCache.delete(cacheKey);
      }
    }

    const date = new Date(dateString);
    const diffMilliseconds = now - date.getTime();
    const minutes = Math.floor(diffMilliseconds / (60 * 1000));
    const hours = Math.floor(diffMilliseconds / (60 * 60 * 1000));
    const days = Math.floor(diffMilliseconds / (24 * 60 * 60 * 1000));
    const weeks = Math.floor(diffMilliseconds / (7 * 24 * 60 * 60 * 1000));
    const months = Math.floor(diffMilliseconds / (30 * 24 * 60 * 60 * 1000));

    let result;
    if (minutes < 1) {
      result = $t('date.justNow');
    } else if (minutes < 60) {
      result = `${minutes} ${pluralize(minutes, 'min')} ${$t('date.ago')}`;
    } else if (hours < 24) {
      result = `${hours} ${pluralize(hours, 'hour')} ${$t('date.ago')}`;
    } else if (days < 7) {
      result = `${days} ${pluralize(days, 'day')} ${$t('date.ago')}`;
    } else if (weeks < 4) {
      result = `${weeks} ${pluralize(weeks, 'week')} ${$t('date.ago')}`;
    } else {
      result = `${months} ${pluralize(months, 'month')} ${$t('date.ago')}`;
    }

    // Cache the result
    timeAgoCache.set(cacheKey, {
      result,
      timestamp: now,
    });

    // Limit cache size to prevent memory leaks
    if (timeAgoCache.size > 500) {
      const firstKey = timeAgoCache.keys().next().value;
      timeAgoCache.delete(firstKey);
    }

    return result;
  }

  return {
    formatTime,
    formatToFullTime,
    formatDate,
    formatTimeAgo,
  };
};

export default useDate;
