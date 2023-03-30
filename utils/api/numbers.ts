/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { PagedResponse } from "types/api/common";

import { API_ROOT_URL } from "./constants";

interface Segment {
  segmentnr: string;
  parallels: string[][];
}

export interface ApiSegmentsData {
  collections: { [key: string]: string }[][];
  segments: Segment[];
}

interface TableData {
  [key: string]: string[] | string;
}

export type NumbersPageData = TableData[];

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

      const isChn = /^[A-Z]/.exec(column);
      const idSeparator = isChn ? "n" : new RegExp(/\d/);

      const parallels = segment.parallels.flat();
      row[column] = parallels.filter((p) => {
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
  pageNumber,
  serializedParams,
}: {
  fileName: string;
  pageNumber: number;
  serializedParams: string;
}): Promise<PagedResponse<NumbersPageData>> {
  // TODO: remove co_occ param after backend update
  const res = await fetch(
    `${API_ROOT_URL}/files/${fileName}/segments?page=${pageNumber}&co_occ=2000&${serializedParams}`
  );

  const responseJSON = await res.json();
  return { data: parseApiSegmentsData(responseJSON), pageNumber };
}
