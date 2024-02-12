import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { shouldHideSegmentNumbersAtom } from "@components/hooks/useDbView";
import { sourceSans } from "@components/theme";
import { useColorScheme } from "@mui/material/styles";
import type { Scale } from "chroma-js";
import { scriptSelectionAtom } from "features/atoms";
import { selectedSegmentMatchesAtom } from "features/atoms/textView";
import { enscriptText } from "features/sidebarSuite/common/dbSidebarHelpers";
import { useAtomValue, useSetAtom } from "jotai";
import type { TextPageDataSegment } from "types/api/text";
import { useQueryParam } from "use-query-params";

import styles from "./textSegment.module.scss";

export const TextSegment = ({
  data: { segmentText, segmentNumber },
  colorScale,
}: {
  data: TextPageDataSegment;
  colorScale: Scale;
}) => {
  const { mode } = useColorScheme();
  const isDarkTheme = mode === "dark";

  const shouldHideSegmentNumbers = useAtomValue(shouldHideSegmentNumbersAtom);

  const [selectedSegmentId, setSelectedSegmentId] =
    useQueryParam("selectedSegment");
  const { sourceLanguage } = useDbQueryParams();

  const scriptSelection = useAtomValue(scriptSelectionAtom);
  const setSelectedSegmentMatches = useSetAtom(selectedSegmentMatchesAtom);

  const isSelected = selectedSegmentId === segmentNumber;

  return (
    <>
      <span
        className={`${styles.segmentNumber} ${
          isSelected && styles["segmentNumber--selected"]
        } ${shouldHideSegmentNumbers && styles["segmentNumber--hidden"]}`}
        data-segmentnumber={segmentNumber}
      />

      {segmentText.map(({ text, highlightColor, matches }, i) => {
        const segmentKey = segmentNumber + text + i;
        const textContent = enscriptText({
          text,
          script: scriptSelection,
          language: sourceLanguage,
        });
        if (matches.length === 0) {
          return (
            <span key={segmentKey} className={styles.segment}>
              {textContent}
            </span>
          );
        }
        return (
          <button
            key={segmentKey}
            type="button"
            tabIndex={0}
            className={`${styles.segment} ${styles["segment--button"]} ${
              isSelected &&
              (isDarkTheme
                ? styles["segment--selected-dark"]
                : styles["segment--selected-light"])
            }`}
            style={{
              fontFamily: sourceSans.style.fontFamily,
              color: colorScale(highlightColor).hex(),
              // todo: uncomment to enable old Frontend segment colors
              // color: SEGMENT_COLORS[highlightColor],
            }}
            onClick={() => {
              setSelectedSegmentMatches(matches);
              setSelectedSegmentId(segmentNumber);
            }}
            onKeyDown={(event) => {
              // allow selecting the segments by pressing space or enter
              if (event.key !== " " && event.key !== "Enter") return;
              event.preventDefault();
              setSelectedSegmentMatches(matches);
              setSelectedSegmentId(segmentNumber);
            }}
          >
            {textContent}
          </button>
        );
      })}
    </>
  );
};
