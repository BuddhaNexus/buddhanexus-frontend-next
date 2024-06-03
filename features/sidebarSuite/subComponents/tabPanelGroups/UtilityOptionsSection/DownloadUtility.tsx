import React from "react";
import useDownloader from "react-use-downloader";
import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { currentViewAtom } from "@components/hooks/useDbView";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  Fade,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Popper,
  PopperMsgBox,
} from "features/sidebarSuite/common/MuiStyledSidebarComponents";
import type { QueryParams } from "features/sidebarSuite/config/types";
import { useAtomValue } from "jotai";
import { getParallelDownloadData } from "utils/api/endpoints/table-view/downloads";

type Download = {
  call: (url: string, name: string) => void;
  fileName: string;
  queryParams: Partial<QueryParams>;
};

const createDownload = async (download: Download) => {
  const { fileName, queryParams } = download;

  const file = await getParallelDownloadData({
    file_name: fileName,
    ...queryParams,
    // TODO: determine what is needed for this prop
    download_data: "",
  });

  if (file) {
    const { call: getDownload } = download;
    getDownload(file.url, file.name);
  }
};

const DownloadUtility = () => {
  const { t } = useTranslation("settings");
  const currentView = useAtomValue(currentViewAtom);
  const { fileName: file, queryParams: params } = useDbQueryParams();

  const { download, error } = useDownloader();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDownload = React.useCallback(
    async ({
      event,
      call,
      fileName,
      queryParams,
    }: { event: React.MouseEvent<HTMLElement> } & Download) => {
      setAnchorEl((prev) => (prev ? null : event.currentTarget));
      await createDownload({ call, fileName, queryParams });
    },
    [setAnchorEl],
  );

  const isPopperOpen = Boolean(error) && Boolean(anchorEl);

  if (!currentView.match("table|numbers")) {
    return null;
  }

  // TODO: add handling for table / numbers view
  return (
    <>
      <ListItem
        sx={{ position: "relative" }}
        disablePadding
        onMouseLeave={() => setAnchorEl(null)}
      >
        <ListItemButton
          id="download-utility"
          sx={{ px: 0 }}
          onClick={(event) =>
            handleDownload({
              event,
              call: download,
              fileName: file,
              queryParams: params,
            })
          }
        >
          <ListItemIcon>
            <FileDownloadIcon />
          </ListItemIcon>
          <ListItemText primary={t(`optionsLabels.download`)} />
        </ListItemButton>
      </ListItem>
      <Popper
        id="download-utility-popper"
        open={isPopperOpen}
        anchorEl={anchorEl}
        placement="top"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <PopperMsgBox>{t(`optionsPopperMsgs.download`)}</PopperMsgBox>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default DownloadUtility;
