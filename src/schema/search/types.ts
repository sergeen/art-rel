export type SearchMechanismId = 'contains' | 'exact' | 'levenshtein' | string;

export interface LevenshteinConfig {
  maxDistance: number; // Distancia máxima de edición (1 a 4, por defecto 2)
}

export interface SearchConfig {
  mechanismId: SearchMechanismId;
  levenshtein: LevenshteinConfig;
}

export interface SearchStrategy {
  id: SearchMechanismId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  hasCustomConfig?: boolean;
  matches: (target: string, query: string, config: SearchConfig) => boolean;
}

export interface FilteredCategoryItem {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
  matchingValues: string[];
  totalValuesCount: number;
}

export interface CriteriaSearchResult {
  query: string;
  hasQuery: boolean;
  totalMatches: number;
  categories: FilteredCategoryItem[];
}
