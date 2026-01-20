import type { IUser } from 'src/interfaces/user';

export const mergeUsersPreserveOrder = (current: IUser[], incoming: IUser[]) => {
  if (!current.length) return [...incoming];

  const incomingById = new Map(incoming.map((user) => [user.documentId, user]));
  const seen = new Set<string>();

  const merged: IUser[] = [];
  for (const user of current) {
    if (seen.has(user.documentId)) continue;
    seen.add(user.documentId);
    merged.push(incomingById.get(user.documentId) ?? user);
  }

  for (const user of incoming) {
    if (seen.has(user.documentId)) continue;
    seen.add(user.documentId);
    merged.push(user);
  }

  return merged;
};
