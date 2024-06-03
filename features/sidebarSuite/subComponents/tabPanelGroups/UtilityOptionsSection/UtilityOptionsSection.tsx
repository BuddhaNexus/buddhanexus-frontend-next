import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { List } from "@mui/material";
import PanelHeading from "features/sidebarSuite/common/PanelHeading";

import CopyQueryLinkUtility from "./CopyQueryLinkUtility";
import CopyQueryTitleUtility from "./CopyQueryTitleUtility";
import DownloadUtility from "./DownloadUtility";
import EmailQueryLinkUtility from "./EmailQueryLinkUtility";

const UtilityOptionsSectionFrame = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("settings");
  return (
    <>
      <PanelHeading heading={t("headings.tools")} sx={{ mt: 3 }} />
      <List>{children}</List>
    </>
  );
};

const UtilityOptionsSection = () => {
  const { route } = useRouter();
  const isSearchRoute = route.startsWith("/search");

  if (isSearchRoute) {
    return (
      <UtilityOptionsSectionFrame>
        <CopyQueryLinkUtility />
        <EmailQueryLinkUtility />
      </UtilityOptionsSectionFrame>
    );
  }

  return (
    <UtilityOptionsSectionFrame>
      <DownloadUtility />
      <CopyQueryTitleUtility />
      <CopyQueryLinkUtility />
      <EmailQueryLinkUtility />
    </UtilityOptionsSectionFrame>
  );
};

export default UtilityOptionsSection;
