import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const START_INDEX = 1_000_000;

export default function TextPage() {
  const { sourceLanguage, fileName, queryParams, defaultQueryParams } =
    useDbQueryParams();
  const { isFallback } = useSourceFile();

  useDbView();

  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);

  const hasReceivedDataForSegment = useRef(false);

  const paginationState = useRef<
    [startEdgePage?: number, endEdgePage?: number]
  >([0, 0]);

  const searchParams = useSearchParams();
  const selectedSegment = searchParams.get("selectedSegment");
  const apiQueryParams = cleanUpQueryParams(queryParams);

  const virtualizedListRef = useRef<VirtuosoHandle | null>(null);

  const {
    data,
    isSuccess,
    fetchNextPage,
    hasPreviousPage,
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
      const [startEdge] = paginationState.current;
      if (startEdge === undefined || startEdge === 0) return undefined;
      return startEdge - 1;
    },

    getNextPageParam: (lastPage) => {
      const [, endEdge] = paginationState.current;
      if (endEdge === undefined || endEdge === lastPage.data.totalPages - 1) {
        // last page, as indicated by the BE response
        return undefined;
      }
      return endEdge + 1;
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
    // already on first page
    if (paginationState.current[0] === 0) return;

    const { data: responseData } = await fetchPreviousPage();
    // eslint-disable-next-line require-atomic-updates
    paginationState.current[0] = responseData?.pages[0]?.data.page;

    const fetchedPageSize = responseData?.pages[0]?.data.items?.length;
    if (!fetchedPageSize) return;

    // the user is scrolling up.
    // offset the new list items when prepending them to the page.
    setFirstItemIndex((prevIndex) => prevIndex - fetchedPageSize);
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
      <Suspense>
        <DbViewPageHead />

        {isLoading || !data ? (
          <CenteredProgress />
        ) : (
          <TextView
            ref={virtualizedListRef}
            data={allParallels}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            firstItemIndex={firstItemIndex}
            onStartReached={handleFetchingPreviousPage}
            onEndReached={handleFetchingNextPage}
          />
        )}

        <SourceTextBrowserDrawer />
      </Suspense>
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
