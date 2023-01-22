import { Divider, Stack } from "@mui/material";
import type { TablePageParallel } from "types/api/table";

import { ParallelSegment } from "./ParallelSegment";

export const TableViewRow = ({
  parallel: {
    parallelColorMap,
    parallelLength,
    parallelFullNames,
    // fileName,
    parallelFullText,
    // parallelPositionFromStart,
    parallelSegmentNumbers,
    rootSegmentNumbers,
    rootFullNames,
    rootFullText,
    rootColorMap,
    rootLength,
    sourceLanguage,
    targetLanguage,
    score,
    // coOccurrences,
  },
}: {
  parallel: TablePageParallel;
}) => (
  <>
    <Stack direction="row" spacing={2} sx={{ my: 2, py: 1 }}>
      {/* ROOT SEGMENT */}
      <ParallelSegment
        fileName={rootFullNames.textName}
        language={targetLanguage}
        length={rootLength}
        text={rootFullText}
        textColorMap={rootColorMap}
        textSegmentNumbers={rootSegmentNumbers}
      />

      {/* PARALLEL SEGMENT*/}
      <ParallelSegment
        fileName={parallelFullNames.textName}
        language={sourceLanguage}
        length={parallelLength}
        text={parallelFullText}
        score={score}
        textColorMap={parallelColorMap}
        textSegmentNumbers={parallelSegmentNumbers}
      />
    </Stack>
    <Divider />
  </>
);