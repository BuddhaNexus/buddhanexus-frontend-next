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
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import NumbersTable from "features/numbersView/NumbersTable";
import { SourceTextBrowserDrawer } from "features/sourceTextBrowserDrawer/sourceTextBrowserDrawer";
import merge from "lodash/merge";
import type { ApiNumbersPageData, PagedResponse } from "types/api/common";
import { DbApi } from "utils/api/dbApi";
import { PagedAPINumbersResponse } from "utils/api/numbers";
// import type { SourceLanguage } from "utils/constants";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

export { getDbViewFileStaticPaths as getStaticPaths } from "utils/nextJsHelpers";

export default function NumbersPage() {
  const { sourceLanguage, fileName, queryParams } = useDbQueryParams();
  const { isFallback } = useSourceFile();
  useDbView();

  const { data: headerCollections } = useQuery({
    queryKey: DbApi.NumbersViewCollections.makeQueryKey({
      fileName,
      queryParams,
    }),
    queryFn: () => DbApi.NumbersViewCollections.call({ fileName, queryParams }),
  });

  const { data, fetchNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery<PagedAPINumbersResponse>({
      initialPageParam: 0,
      queryKey: DbApi.NumbersView.makeQueryKey({ fileName, queryParams }),
      queryFn: ({ pageParam = 0 }) =>
        DbApi.NumbersView.call({
          fileName,
          queryParams,
          pageNumber: Number(pageParam),
        }),
      getNextPageParam: (lastPage) => lastPage.pageNumber + 1,
      getPreviousPageParam: (lastPage) =>
        lastPage.pageNumber === 0 ? undefined : lastPage.pageNumber - 1,
      placeholderData: keepPreviousData,
    });

  const allFetchedData = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data) : []),
    [data]
  );

  const totalDBRowCount = data?.pages[0]?.totalRowCount ?? 0;

  if (isError) {
    return <ErrorPage backgroundName={sourceLanguage} />;
  }

  if (isFallback || isLoading || !data) {
    return (
      <PageContainer backgroundName={sourceLanguage}>
        <CenteredProgress />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth={false}
      backgroundName={sourceLanguage}
      isQueryResultsPage
    >
      <DbViewPageHead />

      <NumbersTable
        collections={headerCollections}
        data={allFetchedData}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        totalDBRowCount={totalDBRowCount}
        language={sourceLanguage}
      />
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
    i18nProps
  );
};
