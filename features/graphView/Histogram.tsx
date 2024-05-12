import React, { memo } from "react";
import { Chart } from "react-google-charts";
import { useTranslation } from "next-i18next";
import { useTheme } from "@mui/material/styles";
import { GraphPageGraphData } from "types/api/common";

import { GRAPH_BG_COLOR } from "./constants";

interface Props {
  data?: GraphPageGraphData;
}

const HISTOGRAM_LOWER_MATCH_LIMIT = 500;

export const Histogram = memo<Props>(function Histogram({ data }) {
  const { palette } = useTheme();
  const { t } = useTranslation();

  const filteredHistogramData =
    data?.filter((item) => item[1] > HISTOGRAM_LOWER_MATCH_LIMIT) ?? [];

  return (
    <Chart
      chartType="Histogram"
      data={[
        [t("graph.collection"), t("graph.matchLengths")],
        ...filteredHistogramData,
      ]}
      graph_id="histogram-chart"
      options={{
        title: t("graph.title"),
        colors: [palette.secondary.main],
        legend: { position: "none" },
        backgroundColor: GRAPH_BG_COLOR,
        chartArea: { width: "80%", height: "80%" },
      }}
      height="100%"
    />
  );
});
