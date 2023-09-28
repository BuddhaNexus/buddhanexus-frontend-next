import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbMenus } from "@components/hooks/useDbMenus";
import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { ArrayParam, useQueryParam } from "use-query-params";
import type { CategoryMenuItem } from "utils/api/textLists";

import { ListboxComponent, StyledPopper } from "./textMenuComponents";

const IncludeCollectionFilter = () => {
  const { t } = useTranslation("settings");
  const { defaultParamConfig, settingsList } = useDbQueryParams();

  const { categories, isLoadingCategories } = useDbMenus();

  const [includeCollectionParam, setIncludeCollectionParam] = useQueryParam(
    settingsList.queryParams.includeCollection,
    ArrayParam
  );

  const [includeCollectionValue, setIncludeCollectionValue] = useState<
    CategoryMenuItem[]
  >([]);

  useEffect(
    () =>
      setIncludeCollectionParam(
        includeCollectionParam ?? defaultParamConfig.include_collection
      ),
    [includeCollectionParam, setIncludeCollectionParam, defaultParamConfig]
  );

  const handleInputChange = (value: CategoryMenuItem[]) => {
    setIncludeCollectionValue(value);
    setIncludeCollectionParam(() => {
      return value.map((item) => item.id);
    });
  };

  return (
    <Box sx={{ my: 1, width: 1 }}>
      <Autocomplete
        id="excluded-collections"
        sx={{ mt: 1, mb: 2 }}
        multiple={true}
        value={includeCollectionValue ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={[...categories.values()]}
        getOptionLabel={(option) => option.name.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.includeCollections`)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingCategories ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => [props, option] as React.ReactNode}
        renderGroup={(params) => params as unknown as React.ReactNode}
        loading={isLoadingCategories}
        filterSelectedOptions
        disablePortal
        onChange={(event, value) => handleInputChange(value)}
      />
    </Box>
  );
};

export default IncludeCollectionFilter;