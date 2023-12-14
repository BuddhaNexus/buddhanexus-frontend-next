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
// import type { NumbersPageData } from "utils/api/numbers";

/*

¡¡¡
PAGE IN DEVELOPMENT 
TODO: remove eslint-disable
!!!

*/

interface Props {
  data: any;
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

export default function NumbersView({
  data,
  onEndReached,
  onStartReached,
}: Props) {
  const headers = React.useMemo(
    () => [{ segment: "Segment ID" }, ...data[0].collections.flat()],
    [data],
  );

  const rows = [];

  data[0].segments.forEach((segment: any) => {
    rows.push(segment.segmentnr);

    headers.forEach((header: any) => {
      header[segment.segmentnr] = segment[header.segment];
    });
  });

  /* eslint-disable no-console */
  console.log("headers data", headers);
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
          headers.map((item: any) => {
            return Object.entries(item).map(([id, value]) => (
              <TableCell
                style={{ background: "white" }}
                title={value as string}
              >
                {id.toUpperCase()}
              </TableCell>
            ));
          }),
        );

        return <TableRow>{headerRow}</TableRow>;
      }}
      itemContent={() => {
        const rowItems = data[0].segments.map((segment: any) => segment);

        return rowItems ? (
          <>
            <TableCell> </TableCell>
            {rowItems}
          </>
        ) : (
          <TableCell />
        );
      }}
    />
  );
}
