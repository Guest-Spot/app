import type { IUser } from 'src/interfaces/user';

export const hasUserAddress = (user: IUser | null): boolean => {
  if (!user) {
    return false;
  }

  const hasTextAddress = Boolean(
    (user.address && user.address.trim()) ||
      (user.city && user.city.trim()) ||
      (user.state && user.state.trim()) ||
      (user.country && user.country.trim()),
  );

  const hasCoordinates = user.profile?.lat != null && user.profile?.lng != null;

  return hasTextAddress || hasCoordinates;
};
