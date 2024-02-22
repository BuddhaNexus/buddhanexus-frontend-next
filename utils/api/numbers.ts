import apiClient from "@api";
import type {
  ApiNumbersPageData,
  FilePropApiQuery,
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

import { parseDbPageQueryParams } from "./utils";

interface NumbersParallel {
  filename: string;
  segmentnr: string;
  displayname: string;
  collection: string;
}
interface APINumberSegmentData {
  segment: {
    segmentnr: string;
    filename: string;
  };
  parallels: NumbersParallel[];
}

type ExtendedPagedResponse<T> = PagedResponse<T> & {
  totalRowCount: number;
};

export type PagedAPINumbersResponse = ExtendedPagedResponse<
  APINumberSegmentData[]
>;

export async function getNumbersData({
  fileName,
  queryParams,
  pageNumber,
}: InfiniteFilePropApiQuery): Promise<PagedAPINumbersResponse> {
  // TODO:
  //    - reconnect to api after endpoint update and remove mockoon fetch
  //        - TODO: https://uriyyo-fastapi-pagination.netlify.app/tutorials/page-number-pagination/
  //    - remove type casting once response model is added to api
  // const { data } = await apiClient.POST("/numbers-view/numbers", {
  //   body: {
  //     file_name: fileName,
  //     score: 30,
  //     par_length: 30,
  //     sort_method: "position",
  //     ...parseDbPageQueryParams(queryParams),
  //     page: pageNumber,
  //   },
  // });

  // if (!pageNumber) {
  //   return undefined;
  // }

  const res = await fetch(
    `http://localhost:9001/numbers-view/numbers?page=${pageNumber + 1}&limit=25`
  );

  const data = await res.json();

  const mockData = { items: data, total: 82 };

  // TODO: mock data simulating FastAPI pagination return (see above link) with Mockoon; update when endpoint is available
  return { data: mockData.items, pageNumber, totalRowCount: mockData.total };
}
export async function getNumbersViewCollections({
  fileName,
  queryParams,
}: FilePropApiQuery): Promise<
  {
    id: string;
    displayname: string;
  }[]
> {
  // TODO:
  //    - reconnect to api after endpoint update and remove mockoon fetch
  //        - TODO: https://uriyyo-fastapi-pagination.netlify.app/tutorials/page-number-pagination/
  //    - remove type casting once response model is added to api
  // const { data } = await apiClient.POST("/numbers-view/numbers", {
  //   body: {
  //     file_name: fileName,
  //     score: 30,
  //     par_length: 30,
  //     sort_method: "position",
  //     ...parseDbPageQueryParams(queryParams),
  //     page: pageNumber,
  //   },
  // });

  // if (!pageNumber) {
  //   return undefined;
  // }

  const res = await fetch(`http://localhost:9001/numbers-view/collections`);

  return await res.json();
}
