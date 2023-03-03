import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useQuery } from "@tanstack/react-query";
import { DbApi } from "utils/api/dbApi";
import type { DbLang } from "utils/dbSidebar";
import { DEFAULT_QUERY_PARAMS } from "utils/dbSidebar";

// TODO: refactor for robustness
function getActiveFilterCount(queries: any, lang: DbLang) {
  let count = 0;

  Object.entries(queries).map(([key, value]) => {
    const queryKey = key as keyof typeof DEFAULT_QUERY_PARAMS;

    if (
      queryKey === "par_length" &&
      DEFAULT_QUERY_PARAMS.par_length[lang] === value
    ) {
      return null;
    }

    if (Array.isArray(value) && value.length > 0) {
      count += value.length;
      return null;
    }

    if (DEFAULT_QUERY_PARAMS[queryKey] === value) {
      return null;
    }

    count += 1;
    return null;
  });

  return count;
}

export default function CurrentResultChips() {
  const { fileName, queryParams, serializedParams, sourceLanguage } =
    useDbQueryParams();
  const { t } = useTranslation("settings");
  const [mounted, setMounted] = useState(false);

  const filtersCount = getActiveFilterCount(queryParams, sourceLanguage);

  const { data, isLoading } = useQuery({
    queryKey: [DbApi.ParallelCount.makeQueryKey(fileName), serializedParams],
    queryFn: () =>
      DbApi.ParallelCount.call({
        fileName,
        serializedParams,
      }),
    refetchOnWindowFocus: false,
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Box>
      <Chip
        size="small"
        label={
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>{t("resultsHead.parallels")}</Box>
            <Box sx={{ minWidth: "2ch", ml: "3px", textAlign: "center" }}>
              {isLoading ? " " : data?.parallel_count}
            </Box>
          </Box>
        }
        sx={{ mx: 0.5, p: 0.5 }}
      />

      <Chip
        size="small"
        label={t("resultsHead.filters", { value: filtersCount })}
        sx={{ mx: 0.5, p: 0.5 }}
      />
    </Box>
  );
}
