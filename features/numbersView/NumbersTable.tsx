import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
  InfiniteData,
} from "@tanstack/react-query";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import { TableCell, TableRow, Skeleton } from "@mui/material";
import { SourceLanguage } from "utils/constants";
import {
  getVirtuosoTableComponents,
  createTableColumns,
  createTableRows,
} from "./numbresViewTableContent";
import { PagedAPINumbersResponse } from "utils/api/numbers";
// TODO: typing
// import type { NumbersPageData } from "utils/api/numbers";

interface Props {
  collections: any;
  data: any;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<
    InfiniteQueryObserverResult<
      InfiniteData<PagedAPINumbersResponse, unknown>,
      Error
    >
  >;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  totalDBRowCount: number;
  language: SourceLanguage;
}

const stickyStyles = { position: "sticky", left: 0 };

export default function NumbersTable({
  collections,
  data,
  fetchNextPage,
  isFetchingNextPage,
  isLoading,
  totalDBRowCount,
  language,
}: Props) {
  const loadMoreItems = React.useCallback(async () => {
    if (!isFetchingNextPage && !isLoading) {
      await fetchNextPage();
    }
  }, [isFetchingNextPage, fetchNextPage, isLoading]);

  const rowData = React.useMemo(() => createTableRows(data), [data]);
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => createTableColumns({ collections, language }),
    []
  );
  const table = useReactTable({
    data: rowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const components = React.useMemo(
    () => getVirtuosoTableComponents() as TableComponents<any>,
    []
  );

  const FixedHeaderContent = React.memo(() => {
    return table.getHeaderGroups().map((headerGroup) => (
      <TableRow
        sx={{ backgroundColor: "background.card", margin: 0 }}
        key={headerGroup.id}
      >
        {headerGroup.headers.map((header) => {
          const styles = {
            ...(header.column.getIsFirstColumn() && {
              ...stickyStyles,
              zIndex: 1,
              backgroundColor: "inherit",
              borderRight: "1px solid #e0e0e0",
            }),
          };
          return (
            <TableCell key={header.id} sx={styles}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  });

  const ItemContent: React.FC<{ index: number }> = React.memo(({ index }) => {
    if (index >= rows.length && index + 2 < totalDBRowCount) {
      loadMoreItems();
      return (
        <>
          {columns.map((column) => (
            <TableCell key={`skeleton-${index}-${JSON.stringify(column)}`}>
              <Skeleton />
            </TableCell>
          ))}
        </>
      );
    }

    const row = rows[index] as Row<any>;

    return (
      <>
        {row?.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            sx={{
              padding: "6px",
              ...(cell.column.getIsFirstColumn() && {
                ...stickyStyles,
                backgroundColor: "background.paper",
                borderRight: "1px solid #e0e0e0",
                paddingLeft: "1rem",
              }),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </>
    );
  });

  return (
    <div style={{ height: "100%" }}>
      <TableVirtuoso
        totalCount={totalDBRowCount}
        components={components}
        itemContent={(index) => <ItemContent index={index} />}
        overscan={20}
        fixedHeaderContent={() => <FixedHeaderContent />}
      />
    </div>
  );
}
