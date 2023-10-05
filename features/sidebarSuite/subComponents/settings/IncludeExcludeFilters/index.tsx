import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDbMenus } from "@components/hooks/useDbMenus";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import {
  Autocomplete,
  Box,
  CircularProgress,
  FormLabel,
  TextField,
} from "@mui/material";
import type { Limit } from "features/sidebarSuite/config/types";
import { limits, type LimitsParam } from "features/sidebarSuite/config/types";
import { omit } from "lodash";
import type { CategoryMenuItem, DatabaseText } from "types/api/menus";
import { JsonParam, useQueryParam } from "use-query-params";

import { ListboxComponent, StyledPopper } from "./uiComponents";

// TODO: Remove on BE naming update & key alignment
const tempi18nLabelKeys = {
  collection_negative: "excludeCollections",
  collection_positive: "includeCollections",
  file_negative: "excludeTexts",
  file_positive: "includeTexts",
};

const IncludeExcludeFilters = () => {
  const { t } = useTranslation("settings");

  const { defaultParamConfig, uniqueSettings } = useDbQueryParams();

  const { texts, isLoadingTexts, categories, isLoadingCategories } =
    useDbMenus();

  const [limitsParam, setLimitsParam] = useQueryParam(
    uniqueSettings.queryParams.limits,
    JsonParam
  );

  const [limitsValue, setLimitsValue] = useState<LimitsParam>({});

  useEffect(
    () => setLimitsParam(limitsParam ?? defaultParamConfig.limits),
    [limitsParam, setLimitsParam, defaultParamConfig]
  );

  const handleInputChange = (
    limit: Limit,
    value: (CategoryMenuItem | DatabaseText)[]
  ) => {
    const otherLimits = omit({ ...limitsValue }, limit);
    const updatedLimits =
      value.length > 0 ? { ...otherLimits, [limit]: value } : otherLimits;
    setLimitsValue(updatedLimits);
    setLimitsParam(
      Object.keys(updatedLimits).length > 0
        ? { ...updatedLimits, [limit]: value.map((limit) => limit.id) }
        : undefined
    );
  };

  return (
    <>
      <FormLabel id="exclude-include-filters-label">
        {t("filtersLabels.includeExcludeFilters")}
      </FormLabel>
      {limits.map((limit) => {
        const filterValue = limitsValue[limit];
        const filter = limit.startsWith("file")
          ? { options: [...texts.values()], isLoading: isLoadingTexts }
          : {
              options: [...categories.values()],
              isLoading: isLoadingCategories,
            };

        const { options, isLoading } = filter;

        return (
          <Box key={limit} sx={{ my: 1, width: 1 }}>
            <Autocomplete
              id={limit}
              sx={{ mt: 1, mb: 2 }}
              multiple={true}
              value={filterValue ?? []}
              PopperComponent={StyledPopper}
              ListboxComponent={ListboxComponent}
              options={options}
              getOptionLabel={(option) => option.name.toUpperCase()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // @ts-expect-error i18n dynamic key issue see https://www.i18next.com/overview/typescript#text-type-error-template-literal
                  label={t([`filtersLabels.${tempi18nLabelKeys[limit]}`])}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {isLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) =>
                [props, option] as React.ReactNode
              }
              renderGroup={(params) => params as unknown as React.ReactNode}
              loading={isLoading}
              filterSelectedOptions
              disablePortal
              onChange={(event, value) => handleInputChange(limit, value)}
            />
          </Box>
        );
      })}
    </>
  );
};

export default IncludeExcludeFilters;
