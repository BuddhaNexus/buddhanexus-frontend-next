import apiClient from "@api";
import type {
  ApiNumbersPageData,
  InfiniteFilePropApiQuery,
  PagedResponse,
} from "types/api/common";

interface Segment {
  segmentnr: string;
  parallels: string[][];
}

export interface ApiSegmentsData {
  collections: Record<string, string>[][];
  segments: Segment[];
}

type TableData = Record<string, string[] | string>;

export type NumbersPageData = TableData[];

/* eslint-disable @typescript-eslint/no-unused-vars */
function parseApiSegmentsData(apiData: ApiSegmentsData): NumbersPageData {
  const numbersData = [];

  const headerRow: TableData[] = [{ segmentnr: "i18nKey" }];

  for (const [i, segment] of apiData.segments.entries()) {
    const row: TableData = { segmentnr: segment.segmentnr };

    for (const collection of apiData.collections.flat()) {
      if (i === 0) {
        headerRow.push(collection);
      }

      const [column] = Object.keys(collection);

      const isChn = /^[A-Z]/.exec(column!);
      const idSeparator = isChn ? "n" : new RegExp(/\d/);

      const parallels = segment.parallels.flat();
      row[column!] = parallels.filter((p) => {
        return p.split(idSeparator)[0] === column;
      });
    }

    if (i === 0) {
      numbersData.push(headerRow);
    }

    numbersData.push(row);
  }

  return numbersData as NumbersPageData;
}

export async function getNumbersData({
  fileName,
  queryParams,
  pageNumber,
}: InfiniteFilePropApiQuery): Promise<PagedResponse<ApiNumbersPageData>> {
  const limits = queryParams?.limits
    ? JSON.parse(queryParams.limits as string)
    : {};

  const { data } = await apiClient.POST("/numbers-view/numbers", {
    body: { file_name: fileName, ...queryParams, limits, page: pageNumber },
  });
  // TODO: - remove type casting once response model is added to api
  // - add page prop
  return { data: data as ApiNumbersPageData, pageNumber };
}
