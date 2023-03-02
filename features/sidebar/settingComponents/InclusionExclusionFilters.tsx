/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * https://mui.com/material-ui/react-autocomplete/
 * https://codesandbox.io/s/2326jk?file=/demo.tsx
 */

import React, { useEffect } from "react";
import { type ListChildComponentProps, VariableSizeList } from "react-window";
import { useTranslation } from "next-i18next";
import type { DatabaseCategory, DatabaseText } from "@components/db/types";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  CircularProgress,
  FormLabel,
  ListSubheader,
  Popper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/styles";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { DbApi } from "utils/api/dbApi";
import { querySettingsValuesAtom } from "utils/dbSidebar";

const OuterElementContext = React.createContext({});

// eslint-disable-next-line react/display-name
const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    // eslint-disable-next-line eqeqeq,no-eq-null
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// px
const LISTBOX_PADDING = 8;

const Row = (props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
    fontWeight: 700,
  };

  // eslint-disable-next-line no-prototype-builtins
  if (dataSet.hasOwnProperty("group")) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  const [dataSetProps, { name, textName }] = dataSet;

  return (
    <Box
      {...dataSetProps}
      style={inlineStyle}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flex: 1,
        "&:nth-of-type(even)": { bgcolor: "background.accent" },
        "&:hover": { textDecoration: "underline" },
      }}
      component="li"
    >
      <Typography
        component="option"
        sx={{
          flex: 1,
          whiteSpace: "normal",
          wordBreak: "break-all",
        }}
      >
        {name}
      </Typography>
      <Typography
        component="small"
        variant="subtitle2"
        {...dataSetProps}
        sx={{ textTransform: "uppercase", fontSize: 12, whiteSpace: "normal" }}
      >
        {textName}
      </Typography>
    </Box>
  );
};

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactChild[] = [];
  // eslint-disable-next-line unicorn/no-array-for-each
  (children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item, ...(item.children ?? []));
    }
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactChild) => {
    // eslint-disable-next-line no-prototype-builtins
    if (child.hasOwnProperty("group")) {
      return 48;
    }

    const charsInLine = smUp ? 80 : 40;
    // @ts-expect-error type issue
    const lineCount = Math.ceil(child[1].name.length / charsInLine);
    return itemSize * lineCount;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 10 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          ref={gridRef}
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index: number) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {Row}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: "border-box",
    "& ul": {
      padding: 0,
      margin: 0,
    },
  },
});

const InclusionExclusionFilters = () => {
  const { sourceLanguage, queryParams, setQueryParams } = useDbQueryParams();
  const { t } = useTranslation("settings");

  // TODO: disable incl/excl options according to current selections

  const [queryValues, setQueryValues] = useAtom(querySettingsValuesAtom);

  const handleInputChange = (
    values: (DatabaseCategory | DatabaseText)[],
    filterType: string
  ) => {
    if (filterType) {
      setQueryValues({
        ...queryValues,
        limit_collection: {
          ...queryValues.limit_collection,
          [filterType]: values.map((value) => value),
        },
      });
    }
  };

  useEffect(() => {
    const params = Object.entries(queryValues.limit_collection).flatMap(
      ([key, value]) =>
        key.includes("excluded")
          ? value.map((item: any) =>
              "categoryName" in item
                ? `!${item.categoryName}`
                : `!${item.fileName}`
            )
          : value.map((item: any) =>
              "categoryName" in item ? item.categoryName : item.fileName
            )
    );

    setQueryParams({
      ...queryParams,
      limit_collection: params.length > 0 ? params : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryValues, setQueryParams]);

  const { data: files, isLoading } = useQuery<DatabaseText[]>({
    queryKey: DbApi.LanguageMenu.makeQueryKey(sourceLanguage),
    queryFn: () => DbApi.LanguageMenu.call(sourceLanguage),
  });

  const { data: categories, isLoading: isLoadingCats } = useQuery<
    DatabaseCategory[]
  >({
    queryKey: DbApi.CategoryMenu.makeQueryKey(sourceLanguage),
    queryFn: () => DbApi.CategoryMenu.call(sourceLanguage),
  });

  return (
    <Box sx={{ my: 1, width: "100%" }}>
      <FormLabel id="include-exclude-filters-label">
        {t(`filtersLabels.minMatch`)}
      </FormLabel>
      <Autocomplete
        id="exclude-collections"
        sx={{ mt: 1, mb: 2 }}
        multiple={true}
        value={queryValues.limit_collection.excludedCategories ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={categories ?? []}
        getOptionLabel={(option) => option.name.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.excludeCollections`)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingCats ? (
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
        loading={isLoadingCats}
        filterSelectedOptions
        disableListWrap
        disablePortal
        onChange={(event, value) =>
          handleInputChange(value, "excludedCategories")
        }
      />
      <Autocomplete
        id="exclude-files"
        sx={{ mb: 2 }}
        multiple={true}
        value={queryValues.limit_collection.excludedFiles ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={files ?? []}
        getOptionLabel={(option) => option.name.toUpperCase()}
        groupBy={(option) => option.category.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.excludeTexts`)}
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
        renderOption={(props, option) => [props, option] as React.ReactNode}
        renderGroup={(params) => params as unknown as React.ReactNode}
        loading={isLoading}
        filterSelectedOptions
        disableListWrap
        disablePortal
        onChange={(event, value) => handleInputChange(value, "excludedFiles")}
      />

      <Autocomplete
        id="include-collections"
        sx={{ mb: 2 }}
        multiple={true}
        value={queryValues.limit_collection.includedCategories ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={categories ?? []}
        getOptionLabel={(option) => option.name.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.includeCollections`)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingCats ? (
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
        loading={isLoadingCats}
        filterSelectedOptions
        disableListWrap
        disablePortal
        onChange={(event, value) =>
          handleInputChange(value, "includedCategories")
        }
      />
      <Autocomplete
        id="include-files"
        multiple={true}
        value={queryValues.limit_collection.includedFiles ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={files ?? []}
        getOptionLabel={(option) => option.name.toUpperCase()}
        groupBy={(option) => option.category.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.includeTexts`)}
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
        renderOption={(props, option) => [props, option] as React.ReactNode}
        renderGroup={(params) => params as unknown as React.ReactNode}
        loading={isLoading}
        filterSelectedOptions
        disableListWrap
        disablePortal
        onChange={(event, value) => handleInputChange(value, "includedFiles")}
      />
    </Box>
  );
};

export default InclusionExclusionFilters;