import React from "react";
import { TableComponents } from "react-virtuoso";
import {
  Table,
  TableBody,
  Paper,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  TableContainer,
  Typography,
  Tooltip,
} from "@mui/material";
import { Link } from "components/common/Link";

// TODO: typing

export const createTableRows = (rowData: any) =>
  rowData.map((item: any) => {
    const row: any = {};
    row.segment = item.segment;

    item.parallels.forEach((parallel: any) => {
      const prevCollectionValue = row[parallel.collection] || [];
      row[parallel.collection] = [...prevCollectionValue, parallel];
    });
    return row;
  });

export const createTableColumns = ({ collections, language }: any) => [
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
    cell: (info: any) => {
      const { filename, segmentnr } = info.getValue();
      return (
        <Typography sx={{ fontWeight: 500 }}>
          <Link
            // TODO: make sure this links to the correct segment
            href={`/db/${language}/${filename}/text?selectedSegment=${segmentnr}`}
            target="_blank"
            rel="noreferrer noopenner"
          >
            {segmentnr}
          </Link>
        </Typography>
      );
    },
  },
  ...collections.map((header: any) => ({
    accessorKey: header.id,
    header: () => (
      <div
        style={{
          width: "200px",
          paddingLeft: "6px",
        }}
      >
        <Typography>{header.id.toUpperCase()}</Typography>
      </div>
    ),
    cell: (info: any) => {
      const parallels = info?.getValue() || [];
      return (
        <div
          style={{
            width: "200px",
            paddingLeft: "1rem",
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
                <Typography>
                  <Link
                    // TODO: make sure this links to the correct segment
                    href={`/db/${language}/${filename}/text?selectedSegment=${segmentnr}`}
                    color="text.primary"
                    target="_blank"
                    rel="noreferrer noopenner"
                  >
                    {segmentnr}
                  </Link>
                </Typography>
              </Tooltip>
            );
          })}
        </div>
      );
    },
  })),
];

export const getVirtuosoTableComponents = (): TableComponents => ({
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      size="small"
      sx={{
        borderCollapse: "separate",
        "& tr:first-of-type > th:last-of-type, td:last-of-type": {
          paddingRight: 3,
        },
      }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>(
    function TableHeadRef(props, ref) {
      return <TableHead {...props} ref={ref} sx={{ zIndex: "2 !important" }} />;
    }
  ),
  TableRow: TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>(
    function TableBodyRef(props, ref) {
      return <TableBody {...props} ref={ref} />;
    }
  ),
  ScrollSeekPlaceholder: ({ height }) => (
    <TableRow
      sx={{
        height,
      }}
    >
      <TableCell colSpan={100} sx={{ paddingX: 3, paddingY: 0 }}>
        <Skeleton height={15} />
      </TableCell>
    </TableRow>
  ),
});
