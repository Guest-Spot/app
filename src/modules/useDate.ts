const useDate = () => {
  const formatTime = (time: string): string => {
    if (!time) return '';
    // Remove seconds from time format hh:mm:ss -> hh:mm
    return time.split(':').slice(0, 2).join(':');
  };

  return {
    formatTime
  };
};

export default useDate;
