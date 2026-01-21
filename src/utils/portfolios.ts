import type { IPortfolio } from 'src/interfaces/portfolio';

export const mergePortfoliosPreserveOrder = (current: IPortfolio[], incoming: IPortfolio[]) => {
  if (!current.length) return [...incoming];

  const incomingById = new Map(incoming.map((portfolio) => [portfolio.documentId, portfolio]));
  const seen = new Set<string>();

  const merged: IPortfolio[] = [];
  for (const portfolio of current) {
    if (seen.has(portfolio.documentId)) continue;
    seen.add(portfolio.documentId);
    merged.push(incomingById.get(portfolio.documentId) ?? portfolio);
  }

  for (const portfolio of incoming) {
    if (seen.has(portfolio.documentId)) continue;
    seen.add(portfolio.documentId);
    merged.push(portfolio);
  }

  return merged;
};
