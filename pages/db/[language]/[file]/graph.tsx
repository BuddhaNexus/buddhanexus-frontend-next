import React from "react";
import type { GetStaticProps } from "next";
import { DbViewPageHead } from "@components/db/DbViewPageHead";
import { ErrorPage } from "@components/db/ErrorPage";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbView } from "@components/hooks/useDbView";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { CenteredProgress } from "@components/layout/CenteredProgress";
import { PageContainer } from "@components/layout/PageContainer";
import { dehydrate, useQuery } from "@tanstack/react-query";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import merge from "lodash/merge";
import type { ApiGraphPageData } from "types/api/common";
import { prefetchDbResultsPageData } from "utils/api/apiQueryUtils";
import { DbApi } from "utils/api/dbApi";
import { SourceLanguage } from "utils/constants";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

import { Box, Paper } from "@mui/material";
import { GRAPH_BG_COLOR } from "features/graphView/constants";
import { Histogram } from "features/graphView/Histogram";
import { PieChart } from "features/graphView/PieChart";

const GraphContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Paper sx={{ backgroundColor: GRAPH_BG_COLOR, my: 2, flex: 1 }}>
    {children}
  </Paper>
);

export default function GraphPage() {
  const { sourceLanguage, fileName, queryParams } = useDbQueryParams();
  const { isFallback } = useSourceFile();
  useDbView();

  const { data, isLoading, isError } = useQuery<ApiGraphPageData>({
    queryKey: DbApi.GraphView.makeQueryKey({ fileName, queryParams }),
    queryFn: () =>
      DbApi.GraphView.call({
        fileName,
        queryParams,
      }),
  });

  if (isError) {
    return <ErrorPage backgroundName={sourceLanguage} />;
  }

  if (isFallback) {
    return (
      <PageContainer backgroundName={sourceLanguage}>
        <CenteredProgress />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="xl"
      backgroundName={sourceLanguage}
      isQueryResultsPage
    >
      <DbViewPageHead />

      {isLoading ? (
        <CenteredProgress />
      ) : (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <GraphContainer>
            <PieChart data={data?.piegraphdata} />
          </GraphContainer>
          <GraphContainer>
            <Histogram data={data?.histogramgraphdata} />
          </GraphContainer>
        </Box>
      )}
      <SourceTextBrowserDrawer />
    </PageContainer>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const i18nProps = await getI18NextStaticProps({ locale }, [
    "common",
    "settings",
  ]);

  const queryClient = await prefetchDbResultsPageData(
    params?.language as SourceLanguage,
    params?.file as string,
  );

  return merge(
    { props: { dehydratedState: dehydrate(queryClient) } },
    i18nProps,
  );
};
