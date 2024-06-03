import React from "react";
import { useTranslation } from "next-i18next";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
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

const CopyQueryLinkUtility = () => {
  const { t } = useTranslation("settings");
  let url: string;

  if (typeof window !== "undefined") {
    url = window.location.toString();
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleCopy = React.useCallback(
    async (event: React.MouseEvent<HTMLElement>, href: string) => {
      setAnchorEl((prev) => (prev ? null : event.currentTarget));
      await navigator.clipboard.writeText(href);
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
          onClick={(event) => handleCopy(event, url)}
        >
          <ListItemIcon>
            <ShareOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t(`optionsLabels.copyQueryLink`)} />
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
            <PopperMsgBox>{t(`optionsPopperMsgs.copyQueryLink`)}</PopperMsgBox>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default CopyQueryLinkUtility;
