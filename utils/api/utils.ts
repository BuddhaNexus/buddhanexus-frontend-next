import apiClient from "@api";
import type { QueryParams } from "features/sidebarSuite/config/types";
import type { APILimits } from "utils/api/types";
import type { FilePropApiQuery } from "utils/api/types/common";
import type { SourceLanguage } from "utils/constants";

export function parseDbPageQueryParams(
  params: Partial<QueryParams>,
): Partial<QueryParams> {
  const limits = params?.limits ? JSON.parse(params.limits as string) : {};

  return { ...params, limits };
}

export function parseAPIRequestBody<T extends { limits?: APILimits }>(body: T) {
  const limits = body?.limits ? JSON.parse(body.limits as string) : {};

  return { ...body, limits };
}

export async function getParallelCount({
  fileName,
  queryParams,
}: FilePropApiQuery): Promise<Record<string, number>> {
  const { data } = await apiClient.POST("/utils/count-matches/", {
    body: { file_name: fileName, ...parseDbPageQueryParams(queryParams) },
  });

  return data as Record<string, number>;
}

export interface DatabaseFolio {
  id: string;
  segmentNr: string;
}

export async function getFolios(fileName: string): Promise<DatabaseFolio[]> {
  const { data } = await apiClient.GET("/utils/folios/", {
    params: { query: { file_name: fileName } },
  });

  const folioData = data as { folios: any[] };

  return folioData.folios.map((folio: { segment_nr: string; num: string }) => ({
    id: folio.num,
    segmentNr: folio.segment_nr,
  }));
}

export async function getAvailableLanguages(
  fileName: string,
): Promise<SourceLanguage[]> {
  if (!fileName) {
    return [];
  }

  const { data } = await apiClient.GET("/utils/available-languages/", {
    params: { query: { file_name: fileName } },
  });

  const awaitingTypesFromApiData = data as {
    langList: SourceLanguage[];
  };

  return data ? awaitingTypesFromApiData.langList.filter(Boolean) : [];
}

export async function getTextDisplayName(fileName: string): Promise<string> {
  if (!fileName) {
    return "";
  }

  const { data } = await apiClient.GET("/utils/displayname/", {
    params: { query: { segmentnr: fileName } },
  });

  const awaitingTypesFromApiData = data as {
    displayname: string[];
  };

  const [textName] = awaitingTypesFromApiData.displayname;

  return textName ?? "";
}
