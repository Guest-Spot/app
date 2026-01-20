const getCurrentYear = () => new Date().getFullYear();

const normalizeExperienceValue = (experience: number | null | undefined): number | null => {
  if (experience === null || experience === undefined) return null;
  const numeric = Number(experience);
  if (!Number.isFinite(numeric)) return null;
  return Math.trunc(numeric);
};

const getExperienceYears = (
  experience: number | null | undefined,
  currentYear = getCurrentYear(),
): number | null => {
  const value = normalizeExperienceValue(experience);
  if (value === null || value <= 0) return null;
  const yearsFromYear = currentYear - value;
  if (yearsFromYear < 0) return null;
  if (value <= yearsFromYear) {
    return value;
  }
  return yearsFromYear > 0 ? yearsFromYear : null;
};

const getExperienceStartYear = (
  experience: number | null | undefined,
  currentYear = getCurrentYear(),
): number | null => {
  const value = normalizeExperienceValue(experience);
  if (value === null || value <= 0) return null;
  const yearsFromYear = currentYear - value;
  if (yearsFromYear < 0) return null;
  if (value <= yearsFromYear) {
    const startYear = currentYear - value;
    return startYear > 0 ? startYear : null;
  }
  return value;
};

const getStartYearFromYears = (
  years: number | null | undefined,
  currentYear = getCurrentYear(),
): number | null => {
  const value = normalizeExperienceValue(years);
  if (value === null || value <= 0) return null;
  const startYear = currentYear - value;
  return startYear > 0 ? startYear : null;
};

const useExperience = () => {
  return {
    getCurrentYear,
    getExperienceYears,
    getExperienceStartYear,
    getStartYearFromYears,
  };
};

export default useExperience;
