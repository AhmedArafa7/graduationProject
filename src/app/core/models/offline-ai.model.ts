import { SearchFilters } from './search-filters.model';

export interface AiAnalysisResult {
  filters: Partial<SearchFilters>;
  confidence: number; // 0-1
  modelUsed: 'regex' | 'keyword' | 'fuzzy' | 'none';
  matchedTokens: string[];
}
