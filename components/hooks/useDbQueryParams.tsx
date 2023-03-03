import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import queryString from "query-string";
import {
  ArrayParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import type { SourceLanguage } from "utils/constants";
import { DEFAULT_QUERY_PARAMS } from "utils/dbSidebar";

export const useDbQueryParams = () => {
  const { query } = useRouter();
  const { t } = useTranslation();

  const sourceLanguage = query.language as SourceLanguage;
  const sourceLanguageName = t(`language.${sourceLanguage}`);

  const fileName = query.file as string;

  const queryConfig = {
    co_occ: withDefault(NumberParam, DEFAULT_QUERY_PARAMS.co_occ),
    score: withDefault(NumberParam, DEFAULT_QUERY_PARAMS.score),
    par_length: withDefault(
      NumberParam,
      DEFAULT_QUERY_PARAMS.par_length[sourceLanguage]
    ),
    limit_collection: withDefault(
      ArrayParam,
      DEFAULT_QUERY_PARAMS.limit_collection
    ),
    target_collection: withDefault(
      StringParam,
      DEFAULT_QUERY_PARAMS.target_collection
    ),
    folio: withDefault(StringParam, DEFAULT_QUERY_PARAMS.folio),
    sort_method: withDefault(StringParam, DEFAULT_QUERY_PARAMS.sort_method),
  };

  const [queryParams, setQueryParams] = useQueryParams(queryConfig);

  const serializedParams = queryString.stringify(queryParams);

  return {
    sourceLanguage,
    sourceLanguageName,
    fileName,
    queryParams,
    setQueryParams,
    serializedParams,
  };
};
