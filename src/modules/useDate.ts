const useDate = () => {
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

  const formatDate = (date: string | Date, { useUsFormat = true }: { useUsFormat?: boolean } = {}): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    // US format: MM/DD/YYYY, International format: DD/MM/YYYY
    return useUsFormat ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
  };

  return {
    formatTime,
    formatDate
  };
};

export default useDate;
