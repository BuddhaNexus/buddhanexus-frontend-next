/* eslint-disable */
// @ts-nocheck
import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";
import { Link } from "components/common/Link";
import { SourceLanguage } from "utils/constants";
// import type { NumbersPageData } from "utils/api/numbers";

/*

¡¡¡
PAGE IN DEVELOPMENT 
TODO: remove eslint-disable
!!!

*/

interface Props {
  headers: any;
  data: any;
  language: SourceLanguage;
  // data: NumbersPageData;
  onEndReached: () => void;
  onStartReached: () => void;
}

// TODO
// const Footer = () => {
//   return (
//     <div
//       style={{
//         padding: "2rem",
//         display: "flex",
//         justifyContent: "center",
//       }}
//     >
//       <Typography>Loading...</Typography>
//     </div>
//   );
// };

const stickyStyles = { position: "sticky", left: 0 };

export default function NumbersView({
  headers,
  data,
  onEndReached,
  onStartReached,
  language,
}: Props) {
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "segment",
        header: () => (
          <div
            style={{
              width: "150px",
            }}
          >
            <Typography>{"segment".toUpperCase()}</Typography>
          </div>
        ),
        cell: (info) => {
          const { id } = info.getValue();
          return (
            <Link href={`/db/${language}/${id}`}>
              <Typography sx={{ color: "primary.main", fontWeight: 500 }}>
                {id}
              </Typography>
            </Link>
          );
        },
      },
      ...headers.map((header: any) => ({
        accessorKey: header.id,
        header: () => (
          <div
            style={{
              width: "200px",
            }}
          >
            <Typography>{header.id.toUpperCase()}</Typography>
          </div>
        ),
        cell: (info) => {
          const parallels = info?.getValue() || [];
          return (
            <div
              style={{
                width: "200px",
              }}
            >
              {parallels.map((parallel: any) => {
                const { displayname, filename, segmentnr } = parallel || {};
                return (
                  <Tooltip
                    key={[info.cell.id, segmentnr].join("-")}
                    title={displayname}
                    PopperProps={{
                      disablePortal: true,
                    }}
                    placement="top"
                    enterDelay={1200}
                  >
                    <Typography>{segmentnr}</Typography>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      })),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const TableComponents = {
    Scroller: React.forwardRef((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <Table {...props} style={{ borderCollapse: "separate" }} />
    ),
    TableHead: TableHead,
    TableRow: (props) => {
      const index = props["data-index"];
      const row = rows[index];

      return (
        <TableRow {...props} sx={{ verticalAlign: "top" }}>
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              sx={{
                padding: "6px",
                ...(cell.column.getIsFirstColumn() && {
                  ...stickyStyles,
                  backgroundColor: "background.paper",
                  paddingLeft: "1rem",
                }),
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    },
    TableBody: React.forwardRef((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  return (
    <div style={{ height: "100%" }}>
      <TableVirtuoso
        totalCount={rows.length}
        components={TableComponents}
        // endReached={onEndReached}
        // startReached={onStartReached}
        overscan={20}
        fixedHeaderContent={() => {
          return table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              sx={{ backgroundColor: "background.card", margin: 0 }}
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => {
                const attributes = {
                  ...(header.column.getIsFirstColumn() && {
                    style: {
                      ...stickyStyles,
                      zIndex: 1,
                      backgroundColor: "inherit",
                    },
                  }),
                };
                return (
                  <TableCell key={header.id} {...attributes}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ));
        }}
      />
    </div>
  );
}
