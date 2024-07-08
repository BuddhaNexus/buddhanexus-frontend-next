import apiClient from "@api";
import { parseAPIRequestBody } from "utils/api/apiQueryUtils";
import type {
  APITextViewParallelsV2RequestBody,
  APITextViewParallelsV2ResponseData,
} from "utils/api/types";

function parseTextViewParallelsData(data: APITextViewParallelsV2ResponseData) {
  return {
    page: data.page,
    totalPages: data.total_pages,
    items: data.items?.map((segment) => {
      const { segnr, segtext } = segment;
      return {
        segmentNumber: segnr,
        segmentText: segtext.map(({ text, highlightColor, matches }) => ({
          text,
          highlightColor,
          matches,
        })),
      };
    }),
  };
}

export type ParsedTextViewParallelsData = ReturnType<
  typeof parseTextViewParallelsData
>;

export type ParsedTextViewParallels = ParsedTextViewParallelsData["items"];
export type ParsedTextViewParallel = ParsedTextViewParallelsData["items"][0];

export async function getTextViewParallelsData(
  body: APITextViewParallelsV2RequestBody,
) {
  const page = body.page_number ?? 0;

  const { data } = await apiClient.POST("/text-view/text-parallels-v2/", {
    body: {
      ...parseAPIRequestBody({ ...body, page }),
      // TODO: add support for multiple languages when available
      multi_lingual: ["skt", "pli", "chn", "tib"],
    },
  });

  if (!data) {
    throw new Error("[Parallels Data] no data returned");
  }

  return {
    data: parseTextViewParallelsData(data),
    pageNumber: page,
  };
}
