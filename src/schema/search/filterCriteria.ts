import type { ReadingCategory } from '../categories';
import { getSearchStrategy } from './strategies';
import type { CriteriaSearchResult, FilteredCategoryItem, SearchConfig } from './types';

/**
 * Filtra los datos de criterios sociológicos aplicando la estrategia de búsqueda activa.
 * - Si no hay consulta, devuelve todas las categorías y todos sus valores.
 * - Si hay consulta activa, expone únicamente los valores y categorías coincidentes.
 * - Si ningún criterio coincide, el totalMatches será 0, permitiendo renderizar el Empty State.
 */
export function filterCriteriaBySearch(
  categoryDataMap: Map<string, string[]>,
  categories: ReadingCategory[],
  query: string,
  config: SearchConfig
): CriteriaSearchResult {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  if (!hasQuery) {
    let total = 0;
    const resultCategories: FilteredCategoryItem[] = categories.map((cat) => {
      const allValues = categoryDataMap.get(cat.id) || [];
      total += allValues.length;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryDescription: cat.description,
        matchingValues: allValues,
        totalValuesCount: allValues.length,
      };
    });

    return {
      query: '',
      hasQuery: false,
      totalMatches: total,
      categories: resultCategories,
    };
  }

  const strategy = getSearchStrategy(config.mechanismId);
  const resultCategories: FilteredCategoryItem[] = [];
  let totalMatches = 0;

  for (const cat of categories) {
    const allValues = categoryDataMap.get(cat.id) || [];
    const matchingValues = allValues.filter((val) =>
      strategy.matches(val, trimmedQuery, config)
    );

    if (matchingValues.length > 0) {
      totalMatches += matchingValues.length;
      resultCategories.push({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryDescription: cat.description,
        matchingValues,
        totalValuesCount: allValues.length,
      });
    }
  }

  return {
    query: trimmedQuery,
    hasQuery: true,
    totalMatches,
    categories: resultCategories,
  };
}
