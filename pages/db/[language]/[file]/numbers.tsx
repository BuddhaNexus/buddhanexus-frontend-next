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
import TBODY_DATA_MODEL from "features/numbersView/dummyDataProtoModelTBody.json";
import THEAD_DATA_MODEL from "features/numbersView/dummyDataProtoModelTHead.json";
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

  const allData = React.useMemo(
    () =>
      TBODY_DATA_MODEL
        ? TBODY_DATA_MODEL.pages.flatMap((page) => {
            const pageRows: any = [];

            page.data.forEach((segment) => {
              const row: any = {};
              row.segment = {
                id: segment.segmentnr,
                text: segment.segment_text,
              };

              segment.parallels.forEach((parallel) => {
                const currentCollectionValue = row[parallel.collection] || [];
                row[parallel.collection] = [
                  ...currentCollectionValue,
                  parallel,
                ];
              });
              pageRows.push(row);
            });

            return pageRows;
          })
        : [],
    [],
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
        <NumbersView
          headers={THEAD_DATA_MODEL.collections}
          data={allData}
          language={sourceLanguage}
          onEndReached={fetchNextPage}
          onStartReached={fetchPreviousPage}
        />
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
