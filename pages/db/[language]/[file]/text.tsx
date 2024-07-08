import React, { useMemo } from "react";
import type { GetStaticProps } from "next";
import { DbViewPageHead } from "@components/db/DbViewPageHead";
import { ErrorPage } from "@components/db/ErrorPage";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbView } from "@components/hooks/useDbView";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { CenteredProgress } from "@components/layout/CenteredProgress";
import { PageContainer } from "@components/layout/PageContainer";
import { dehydrate, useInfiniteQuery } from "@tanstack/react-query";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import TextView from "features/textView/TextView";
import merge from "lodash/merge";
import { prefetchDbResultsPageData } from "utils/api/apiQueryUtils";
import { DbApi } from "utils/api/dbApi";
import type { SourceLanguage } from "utils/constants";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

/**
 * TODO
 * 1. Display text on left side
 * 2. Allow selection
 * 3. Grab parallels for middle (https://buddhanexus2.kc-tbts.uni-hamburg.de/api/text-view/middle)
 * 4. Display using table view components
 * ?: use /text-view/text-parallels/
 * * Split pane: use https://github.com/johnwalley/allotment
 *
 * @constructor
 */
export default function TextPage() {
  const { sourceLanguage, fileName, queryParams, defaultQueryParams } =
    useDbQueryParams();
  const { isFallback } = useSourceFile();

  useDbView();

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegmentIndex,
    ...paramsThatShouldRefreshText
  } = queryParams;

  const { data, fetchNextPage, fetchPreviousPage, isLoading, isError } =
    useInfiniteQuery({
      initialPageParam: 0,
      queryKey: DbApi.TextView.makeQueryKey({
        file_name: fileName,
        ...paramsThatShouldRefreshText,
      }),
      queryFn: ({ pageParam }) =>
        DbApi.TextView.call({
          file_name: fileName,
          ...defaultQueryParams,
          ...queryParams,
          page_number: pageParam,
        }),
      getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
      getPreviousPageParam: (lastPage) =>
        lastPage.pageNumber === 0 ? undefined : lastPage.pageNumber - 1,
    });

  const allParallels = useMemo(
    // todo: load more than 1 page
    () => data?.pages[0]?.data.items ?? [],
    [data?.pages],
  );

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

      {isLoading || !data ? (
        <CenteredProgress />
      ) : (
        <TextView
          data={allParallels}
          onEndReached={fetchNextPage}
          onStartReached={fetchPreviousPage}
        />
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
