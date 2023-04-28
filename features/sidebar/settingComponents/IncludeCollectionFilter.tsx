// /**
//  * https://mui.com/material-ui/react-autocomplete/
//  * https://codesandbox.io/s/2326jk?file=/demo.tsx
//  */

import React, { useEffect, useState } from "react";
import { type ListChildComponentProps, VariableSizeList } from "react-window";
import { useTranslation } from "next-i18next";
// import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useTextLists } from "@components/hooks/useTextLists";
import {
  Autocomplete,
  autocompleteClasses,
  Box,
  CircularProgress,
  ListSubheader,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/styles";
// import { atom, useAtom } from "jotai";
import { ArrayParam, useQueryParam } from "use-query-params";
// import type { CategoryMenuItem, TextMenuItem } from "utils/api/textLists";
// import type { QueryValues } from "utils/dbUISettings";
import { DEFAULT_QUERY_PARAMS } from "utils/dbUISettings";

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

  const [dataSetProps, { name, ref }] = dataSet;
  return (
    <Box
      {...dataSetProps}
      style={inlineStyle}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flex: 1,
        "&:nth-of-type(even)": {
          bgcolor: "background.accent",
        },
        "&:hover": { textDecoration: "underline" },
      }}
      component="li"
    >
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          padding: "4px 0",
        }}
      >
        <Typography
          sx={{
            display: "inline",
            whiteSpace: "normal",
            wordBreak: "break-all",
          }}
        >
          <Typography
            component="span"
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              pr: 1,
            }}
          >
            {ref}
          </Typography>
          {name.replace(/^•\s/g, "")}
        </Typography>
      </div>
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

  const itemCount = itemData.length;
  const itemSize = 56;

  const getChildSize = (child: React.ReactChild) => {
    // eslint-disable-next-line no-prototype-builtins
    if (child.hasOwnProperty("group")) {
      return 48;
    }

    const charsInLine = 58;
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

const IncludeCollectionFilter = () => {
  const { t } = useTranslation("settings");

  const [includeCollectonParam, setIncludeCollectonParam] = useQueryParam(
    "include_collection",
    ArrayParam
  );

  const [includeCollectonValue, setIncludeCollectonValue] = useState(
    // TODO: Add ArrayParam to object[] coerced by id
    DEFAULT_QUERY_PARAMS.include_collection
  );

  useEffect(() => {
    setIncludeCollectonParam(includeCollectonParam);
  }, [includeCollectonParam, setIncludeCollectonParam]);

  const { categories, isLoadingCategories } = useTextLists();

  const handleInputChange = (value: any) => {
    // TODO: figure out logic
    setIncludeCollectonValue(value);
  };

  //  TODO: clarify spec - is disabling logically impossible (per include/exclude selections) desired behaviour?
  //
  //   const [disableSelectors, setDisableSelectors] = useAtom(
  //     disableLimitColectionSelectAtom
  //   );

  //   function setIsSelectorDisabled(
  //     key: keyof QueryValues["limit_collection"],
  //     value: boolean
  //   ) {
  //     setDisableSelectors((prevState) => {
  //       const updates = {
  //         excludedCategories: {},
  //         excludedTexts: {},
  //         includedCategories: {
  //           excludedCategories: !value,
  //           excludedTexts: !value,
  //         },
  //         includedTexts: {
  //           excludedCategories: !value,
  //           excludedTexts: !value,
  //           includedCategories: !value,
  //         },
  //       };
  //       return { ...prevState, ...updates[key] };
  //     });
  //   }

  return (
    <Box sx={{ my: 1, width: 1 }}>
      <Autocomplete
        id="excluded-collections"
        sx={{ mt: 1, mb: 2 }}
        multiple={true}
        value={includeCollectonValue ?? []}
        PopperComponent={StyledPopper}
        ListboxComponent={ListboxComponent}
        options={[...categories.values()]}
        getOptionLabel={(option) => option.name.toUpperCase()}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t(`filtersLabels.excludeCollections`)}
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