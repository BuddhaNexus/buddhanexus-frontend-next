import React from "react";
import type { GetStaticProps } from "next";
import { DbViewPageHead } from "@components/db/DbViewPageHead";
import { ErrorPage } from "@components/db/ErrorPage";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbView } from "@components/hooks/useDbView";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { CenteredProgress } from "@components/layout/CenteredProgress";
import { PageContainer } from "@components/layout/PageContainer";
// import type { NumbersPageData } from "utils/api/numbers";
import {
  // dehydrate,
  useInfiniteQuery,
} from "@tanstack/react-query";
import NumbersView from "features/numbersView/NumbersView";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import merge from "lodash/merge";
import type { ApiNumbersPageData, PagedResponse } from "types/api/common";
import { DbApi } from "utils/api/dbApi";
// import type { SourceLanguage } from "utils/constants";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

export default function NumbersPage() {
  const { sourceLanguage, fileName, queryParams } = useDbQueryParams();
  const { isFallback } = useSourceFile();
  useDbView();

  const { data, fetchNextPage, fetchPreviousPage, isLoading, isError } =
    useInfiniteQuery<PagedResponse<ApiNumbersPageData>>({
      initialPageParam: 0,
      queryKey: DbApi.NumbersView.makeQueryKey({ fileName, queryParams }),
      queryFn: ({ pageParam }) =>
        DbApi.NumbersView.call({
          fileName,
          queryParams,
          pageNumber: pageParam as number,
        }),
      getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
      getPreviousPageParam: (lastPage) =>
        lastPage.pageNumber === 0 ? undefined : lastPage.pageNumber - 1,
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

      {/* Just printing some example data: */}
      {/* The deta should probably be transformed according to our needs before using it here. */}

      {isLoading || !data ? (
        <CenteredProgress />
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

export const getStaticProps: GetStaticProps = async ({
  locale,
  // params
}) => {
  const i18nProps = await getI18NextStaticProps({ locale }, [
    "common",
    "settings",
  ]);

  // const queryClient = await prefetchDbResultsPageData(
  //   params?.language as SourceLanguage,
  //   params?.file as string,
  // );

  return merge(
    // { props: { dehydratedState: dehydrate(queryClient) } },
    i18nProps,
  );
};
