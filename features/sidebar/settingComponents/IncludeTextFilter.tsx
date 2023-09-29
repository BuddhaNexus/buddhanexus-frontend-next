import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useDbMenus } from "@components/hooks/useDbMenus";
import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { DEFAULT_QUERY_PARAMS } from "features/sidebar/common/dbSidebarSettings";
import {
  ListboxComponent,
  StyledPopper,
} from "features/sidebar/common/textMenuSubComponents";
import { ArrayParam, useQueryParam } from "use-query-params";
import type { DatabaseText } from "types/api/menus";

const IncludeTextFilter = () => {
  const { t } = useTranslation("settings");

  const { texts, isLoadingTexts } = useDbMenus();

  const [includeTextParam, setIncludeTextParam] = useQueryParam(
    // TODO: replace with "include_text",
    "limit_collection",
    ArrayParam
  );

  const [includeTextValue, setIncludeTextValue] = useState<DatabaseText[]>([]);

  useEffect(
    () =>
      setIncludeTextParam(
        includeTextParam ?? DEFAULT_QUERY_PARAMS.include_text
      ),
    [includeTextParam, setIncludeTextParam]
  );

  const handleInputChange = (value: DatabaseText[]) => {
    setIncludeTextValue(value);
    setIncludeTextParam(() => {
      return value.map((item) => item.id);
    });
  };

  return (
    <Box sx={{ my: 1, width: 1 }}>
      <Autocomplete
        id="excluded-texts"
        sx={{ mt: 1, mb: 2 }}
        multiple={true}
        value={includeTextValue ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        // options={[...texts.values()]}
        options={[]}
        getOptionLabel={(option) => option.name.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.includeTexts`)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingTexts ? (
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
        loading={isLoadingTexts}
        filterSelectedOptions
        disablePortal
        onChange={(event, value) => handleInputChange(value)}
      />
    </Box>
  );
};

export default IncludeTextFilter;
