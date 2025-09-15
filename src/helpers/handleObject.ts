// Helper function to remove empty keys or keys with empty strings
export const removeEmptyFields = (obj: Record<string, unknown>): Record<string, unknown> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          acc[key] = value;
        } else if (!Array.isArray(value)) {
          acc[key] = value;
        }
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

export const compareAndReturnDifferences = (
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
  excludeKeys: string[] = [],
): Record<string, unknown> => {
  return Object.entries(obj2).reduce(
    (acc, [key, value]) => {
      if (value !== obj1[key] && !excludeKeys.includes(key)) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
};
