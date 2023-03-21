import React from "react";
import type { GetStaticProps } from "next";
import { DbResultsPageHead } from "@components/db/DbResultsPageHead";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { PageContainer } from "@components/layout/PageContainer";
import { CircularProgress } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import NumbersView from "features/numbersView/NumbersView";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import type { PagedResponse } from "types/api/common";
import { DbApi } from "utils/api/dbApi";
import type { NumbersPageData } from "utils/api/numbers";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getSourceTextStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

export default function NumbersPage() {
  const { sourceLanguage, fileName, serializedParams } = useDbQueryParams();
  const { isFallback } = useSourceFile();

  // TODO: add error handling
  const { data, fetchNextPage, fetchPreviousPage, isInitialLoading } =
    useInfiniteQuery<PagedResponse<NumbersPageData>>({
      queryKey: [DbApi.NumbersView.makeQueryKey(fileName), serializedParams],
      queryFn: ({ pageParam = 0 }) =>
        DbApi.NumbersView.call({
          fileName,
          pageNumber: pageParam,
          serializedParams,
        }),
      getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
      getPreviousPageParam: (lastPage) =>
        lastPage.pageNumber === 0
          ? lastPage.pageNumber
          : lastPage.pageNumber - 1,
      refetchOnWindowFocus: false,
    });

  if (isFallback) {
    return (
      <PageContainer backgroundName={sourceLanguage}>
        <CircularProgress color="inherit" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="xl"
      backgroundName={sourceLanguage}
      hasSidebar={true}
    >
      <DbResultsPageHead />

      {/* Just printing some example data: */}
      {/* The deta should probably be transformed according to our needs before using it here. */}

      {isInitialLoading || !data ? (
        <CircularProgress color="inherit" />
      ) : (
        <div style={{ height: "100vh" }}>
          <NumbersView
            data={data.pages.flatMap((page) => page.data)}
            onEndReached={fetchNextPage}
            onStartReached={fetchPreviousPage}
          />
        </div>
      )}
      <SourceTextBrowserDrawer />
    </PageContainer>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const i18nProps = await getI18NextStaticProps(
    {
      locale,
    },
    ["settings"]
  );

  return {
    props: {
      ...i18nProps.props,
    },
  };
};
