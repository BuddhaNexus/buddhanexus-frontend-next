import React from "react";
import type { GetStaticProps } from "next";
import { PageContainer } from "@components/layout/PageContainer";
import { Typography } from "@mui/material";
import { getI18NextStaticProps } from "utils/nextJsHelpers";

// IN DEVELOPMENT ON FEATURE BRANCH

export default function SearchPage() {
  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h1">IN DEVELOPMENT ON FEATURE BRANCH</Typography>
    </PageContainer>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const i18nProps = await getI18NextStaticProps(
    {
      locale,
    },
    ["db"]
  );

  return {
    props: {
      ...i18nProps.props,
    },
  };
};
