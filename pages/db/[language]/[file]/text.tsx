import React, { useEffect, useMemo, useRef } from "react";
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

  const hasReceivedDataForSegment = useRef(false);

  const {
    // changing these properties (by selecting the segments)
    // should not reload the page.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegmentIndex,
    ...apiQueryParams
  } = queryParams;

  useEffect(() => {
    hasReceivedDataForSegment.current = false;
  }, [selectedSegment]);

  const {
    data,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    fetchPreviousPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    enabled: Boolean(fileName),
    initialPageParam: 0,
    queryKey: DbApi.TextView.makeQueryKey(
      {
        file_name: fileName,
        ...apiQueryParams,
      },
      selectedSegment,
    ),
    queryFn: ({ pageParam }) => {
      // We pass the active_segment, but only on the first page load :/
      //
      // This is a bit of a workaround to enable scrolling up. Explanation:
      // When `active_segment` is inside a query param, the BE always responds with the page that includes the segment.
      // We pass it to the backend and we assume the page is 0. In the BE response, it tells us that we're on page 1,
      // but there' still no way to request page 0 when `active_segment` is included.
      //
      // A possible issue with this workaround is that it only runs on the client side.
      // We may need to revisit after moving to the Next.js App Router
      const active_segment = hasReceivedDataForSegment.current
        ? undefined
        : selectedSegment;
      return DbApi.TextView.call({
        file_name: fileName,
        ...defaultQueryParams,
        ...apiQueryParams,
        page_number: pageParam,
        active_segment,
      });
    },
    getNextPageParam: (lastPage) => {
      // last page, as indicated by the BE response
      if (lastPage.data.page === lastPage.data.totalPages - 1) {
        return undefined;
      }
      return lastPage.pageNumber + 1;
    },
    getPreviousPageParam: (lastPage) =>
      lastPage.data.page === 0 ? undefined : lastPage.data.page - 1,
  });

  useEffect(() => {
    if (isSuccess) hasReceivedDataForSegment.current = true;
  }, [isSuccess]);

  const allParallels = useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.data.items) : []),
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
          hasNextPage={hasNextPage}
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
