import React from "react";
import { useTranslation } from "next-i18next";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
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

type UtilityHandlerProps = {
  href: string;
  fileName: string;
  messages: {
    subject: string;
  };
};

const openEmail = ({ href, messages, fileName }: UtilityHandlerProps) => {
  const encodedURL = encodeURI(href);
  const subject = fileName
    ? `${messages.subject} - ${fileName.toUpperCase()}`
    : messages.subject;
  const link = document.createElement("a");
  link.href = `mailto:?subject=${subject}&body=${encodedURL}`;
  link.click();
  link.remove();
};

const EmailQueryLinkUtility = () => {
  const { t } = useTranslation("settings");
  const { fileName: file } = useDbQueryParams();
  // TODO: get full text name + update email message
  let url: string;

  if (typeof window !== "undefined") {
    url = window.location.toString();
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleEmail = React.useCallback(
    ({
      event,
      href,
      messages,
      fileName,
    }: { event: React.MouseEvent<HTMLElement> } & UtilityHandlerProps) => {
      setAnchorEl((prev) => (prev ? null : event.currentTarget));
      openEmail({ href, messages, fileName });
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
          onClick={(event) =>
            handleEmail({
              event,
              href: url,
              fileName: file,
              messages: {
                subject: t("generic.resutsSubject"),
              },
            })
          }
        >
          <ListItemIcon>
            <ForwardToInboxIcon />
          </ListItemIcon>
          <ListItemText primary={t(`optionsLabels.emailQueryLink`)} />
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
            <PopperMsgBox>{t(`optionsPopperMsgs.emailQueryLink`)}</PopperMsgBox>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default EmailQueryLinkUtility;
