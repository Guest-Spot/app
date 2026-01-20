import type { IUser } from 'src/interfaces/user';

export const hasUserAddress = (user: IUser | null): boolean => {
  if (!user) {
    return false;
  }

  const hasTextAddress = Boolean(user.address && user.address.trim());

  const hasCoordinates = user.profile?.lat != null && user.profile?.lng != null;

  return hasTextAddress || hasCoordinates;
};
