import React from "react";
import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
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

const CopyQueryTitleUtility = () => {
  const { t } = useTranslation("settings");
  const { fileName: file } = useDbQueryParams();
  // TODO: get text file name

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleCopy = React.useCallback(
    async (event: React.MouseEvent<HTMLElement>, fileName: string) => {
      setAnchorEl((prev) => (prev ? null : event.currentTarget));
      await navigator.clipboard.writeText(fileName);
    },
    [setAnchorEl],
  );

  const isPopperOpen = Boolean(anchorEl);

  return (
    <>
      <ListItem
        sx={{ position: "relative" }}
        disablePadding
        onMouseLeave={() => setAnchorEl(null)}
      >
        <ListItemButton
          id="copy-query-link-utility"
          sx={{ px: 0 }}
          onClick={(event) => handleCopy(event, file)}
        >
          <ListItemIcon>
            <LocalOfferOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t(`optionsLabels.copyQueryTitle`)} />
        </ListItemButton>
      </ListItem>
      <Popper
        id="copy-query-link-utility-popper"
        open={isPopperOpen}
        anchorEl={anchorEl}
        placement="top"
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <PopperMsgBox>{t(`optionsPopperMsgs.copyQueryTitle`)}</PopperMsgBox>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default CopyQueryTitleUtility;
