import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import type { GetStaticProps } from "next";
import { useSearchParams } from "next/navigation";
import { DbViewPageHead } from "@components/db/DbViewPageHead";
import { ErrorPage } from "@components/db/ErrorPage";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { useDbView } from "@components/hooks/useDbView";
import { useSourceFile } from "@components/hooks/useSourceFile";
import { CenteredProgress } from "@components/layout/CenteredProgress";
import { PageContainer } from "@components/layout/PageContainer";
import { dehydrate, useInfiniteQuery } from "@tanstack/react-query";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import { TextView } from "features/textView/TextView";
import merge from "lodash/merge";
import { prefetchDbResultsPageData } from "utils/api/apiQueryUtils";
import { DbApi } from "utils/api/dbApi";
import type { SourceLanguage } from "utils/constants";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

type QueryParams = Record<string, string>;

const cleanUpQueryParams = (queryParams: QueryParams): QueryParams => {
  const {
    // changing these properties (by selecting the segments)
    // should not reload the page.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedSegmentIndex,
    ...apiQueryParams
  } = queryParams;
  return apiQueryParams;
};

export default function TextPage() {
  const { sourceLanguage, fileName, queryParams, defaultQueryParams } =
    useDbQueryParams();
  const { isFallback } = useSourceFile();

  useDbView();

  const hasReceivedDataForSegment = useRef(false);

  const paginationState = useRef<
    [startEdgePage?: number, endEdgePage?: number]
  >([0, 0]);

  const searchParams = useSearchParams();

  const selectedSegment = searchParams.get("selectedSegment");

  // todo: scrolling up is janky with segment

  const apiQueryParams = cleanUpQueryParams(queryParams);

  const virtualizedListRef = useRef<VirtuosoHandle | null>(null);

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
    initialPageParam: selectedSegment ? undefined : 0,
    queryKey: DbApi.TextView.makeQueryKey(
      { file_name: fileName, ...apiQueryParams },
      selectedSegment ?? undefined,
    ),
    queryFn: ({ pageParam }) => {
      // We pass the active_segment, but only on the first page load :/
      //
      // This is a bit of a workaround to enable scrolling up. Explanation:
      // When `active_segment` is inside a query param, the BE always responds with the page that includes the segment.
      // We pass it to the backend, and we assume the page is 0. In the BE response, it tells us that we're on page 1,
      // but there's no way to request page 0 when `active_segment` is included.
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
        active_segment: active_segment ?? undefined,
      });
    },

    getPreviousPageParam: () => {
      // if it's the first page, don't fetch more
      if (!paginationState.current[0]) return undefined;
      return paginationState.current[0] === 0
        ? undefined
        : paginationState.current[0] - 1;
    },

    getNextPageParam: (lastPage) => {
      // last page, as indicated by the BE response
      if (paginationState.current[1] === undefined) return undefined;
      return paginationState.current[1] === lastPage.data.totalPages - 1
        ? undefined
        : paginationState.current[1] + 1;
    },
  });

  // see queryFn comment above
  useEffect(() => {
    if (isSuccess) hasReceivedDataForSegment.current = true;
  }, [isSuccess]);

  // reset this value after the selectedSegment is changed
  useEffect(() => {
    hasReceivedDataForSegment.current = false;
  }, [selectedSegment]);

  useEffect(
    function handleApiResponse() {
      if (!data?.pages[0]) {
        return;
      }
      const currentPageCount = data?.pages?.length;
      // when the first page is loaded, set the current page number to the one received from the BE
      if (currentPageCount === 1) {
        paginationState.current[0] = data?.pages[0].data.page;
        paginationState.current[1] = data?.pages[0].data.page;
      }
    },
    [data?.pages],
  );

  const handleFetchingPreviousPage = useCallback(async () => {
    const response = await fetchPreviousPage();
    paginationState.current[0] = response.data?.pages[0]?.data.page;
    const fetchedPageSize = response.data?.pages[0]?.data.items?.length;

    // the user is scrolling up.
    // we have to offset the indices of the items that we prepend to the page
    // otherwise the scroll will land at the top of the page that was just fetched.
    if (paginationState.current[0] === 0 && paginationState.current[1] === 0) {
      // we're on the first page and there's only one page fetched. Do nothing
    } else {
      virtualizedListRef.current?.scrollToIndex(fetchedPageSize ?? 0);
    }
  }, [fetchPreviousPage]);

  const handleFetchingNextPage = useCallback(async () => {
    const response = await fetchNextPage();
    paginationState.current[1] = response.data?.pages.at(-1)?.data.page;
  }, [fetchNextPage]);

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
          ref={virtualizedListRef}
          data={allParallels}
          hasNextPage={hasNextPage}
          onEndReached={handleFetchingNextPage}
          onStartReached={handleFetchingPreviousPage}
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
