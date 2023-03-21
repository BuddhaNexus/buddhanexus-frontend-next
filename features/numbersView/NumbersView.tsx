/* eslint-disable prefer-destructuring */
/* eslint-disable react/display-name */
import React from "react";
import { TableVirtuoso } from "react-virtuoso";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { NumbersPageData } from "utils/api/numbers";

interface Props {
  data: NumbersPageData;
  onEndReached: () => void;
  onStartReached: () => void;
}

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

export default function NumbersView({
  data,
  onEndReached,
  onStartReached,
}: Props) {
  const headers = React.useMemo(() => data.slice(0, 1).flat(), [data]);

  return (
    <TableVirtuoso
      data={data.slice(1)}
      components={{
        Scroller: React.forwardRef((props, ref) => (
          <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
          <Table {...props} style={{ borderCollapse: "separate" }} />
        ),
        TableHead,
        TableRow,
        TableBody: React.forwardRef((props, ref) => (
          <TableBody {...props} ref={ref} />
        )),
      }}
      endReached={onEndReached}
      startReached={onStartReached}
      overscan={20}
      fixedHeaderContent={() => {
        const headerRow = React.Children.toArray(
          headers.map((item) => {
            return Object.entries(item).map(([id, value]) => {
              return id === "segmentnr" ? (
                <TableCell style={{ background: "white" }}>
                  Segment ID
                </TableCell>
              ) : (
                <TableCell
                  style={{ background: "white" }}
                  title={value as string}
                >
                  {id.toUpperCase()}
                </TableCell>
              );
            });
          })
        );

        return <TableRow>{headerRow}</TableRow>;
      }}
      itemContent={(index, parallel) => {
        const row = React.Children.toArray(
          Object.entries(parallel).map(([id, value]) => {
            if (id === "segmentnr") {
              return <TableCell>{value}</TableCell>;
            }
            return Array.isArray(value) && value.length > 0 ? (
              <TableCell key={id}>
                {value[0]}&nbsp;– {value.slice(-1)}
              </TableCell>
            ) : (
              <TableCell key={id}> </TableCell>
            );
          })
        );

        return row ? <>{row}</> : <TableCell />;
      }}
    />
  );
}
