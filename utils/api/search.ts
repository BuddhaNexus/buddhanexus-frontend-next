// import queryString from "query-string";
import type { InfiniteSerachApiQuery, PagedResponse } from "types/api/common";
import apiClient from "@api";

// TODO: the return from the search endpoint is due to be updated and this will need to be refactored subsequently.
export type SearchAPIResult = {
  _key: string;
  _id: string;
  _rev: string;
  segment_nr: string[];
  search_string_precise: string;
  search_string_fuzzy: string;
  split_points_precise: {
    current: number;
    next: number;
  };
  split_points_fuzzy: {
    current: number;
    next: number;
  };
  filename: string;
  offset_beg: number;
  offset_end: number;
  centeredness: number;
  distance: number;
  multilang_results: string[];
};

export type SearchResult = {
  id: string;
  segmentNumbers: string[];
  matchString: string;
  fileName: string;
  matchOffsetStart: number;
  matchOffsetEnd: number;
  matchCenteredness: number;
  matchDistance: number;
  multilangResults: string[];
};

export type SearchPageResults = Map<string, SearchResult>;
export type SearchPageData = { total: number; results: SearchPageResults };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseAPISearchData(apiData: any): SearchPageResults {
  const searchResults = new Map<string, SearchResult>();
  for (const result of apiData) {
    const searchPageResult: SearchResult = {
      id: result._key,
      segmentNumbers: result.segment_nr,
      matchString: result.search_string_precise,
      fileName: result.filename,
      matchOffsetStart: result.offset_beg,
      matchOffsetEnd: result.offset_end,
      matchCenteredness: result.centeredness,
      matchDistance: result.distance,
      multilangResults: result.multilang_results,
    };
    searchResults.set(searchPageResult.id, searchPageResult);
  }
  return searchResults;
}

export async function getGlobalSearchData({
  searchTerm,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  queryParams,
  pageNumber,
}: InfiniteSerachApiQuery): Promise<PagedResponse<SearchPageData>> {
  // IN DEVELOPMENT
  // TODO: Add pagination on BE
  //  - remove type casting once response model is added to api
  //  - review parsed prop nams.

  const { data } = await apiClient.POST("/search/", {
    body: { search_string: searchTerm, limits: {} },
  });

  const castData = data as { searchResults: any[] };
  const parsedData = parseAPISearchData(castData.searchResults);

  return {
    data: { total: castData.searchResults.length, results: parsedData },
    pageNumber,
  };
}
