import type { FC, PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { Container } from "@mui/material";
import type { Breakpoint } from "@mui/system";
import bgChn from "@public/assets/images/bg_chn_upscaled_bw.jpg";
import bgPli from "@public/assets/images/bg_pli_upscaled_bw.jpg";
import bgSkt from "@public/assets/images/bg_skt_upscaled_bw.jpg";
import bgTib from "@public/assets/images/bg_tib_upscaled_bw.jpg";
import bgWelcome from "@public/assets/images/bg_welcome_upscaled_bw.jpg";
import type { Property } from "csstype";
import { SourceLanguage } from "utils/constants";

const BgImageSrcs: Record<BackgroundName, string> = {
  [SourceLanguage.TIBETAN]: bgTib.src,
  [SourceLanguage.CHINESE]: bgChn.src,
  [SourceLanguage.SANSKRIT]: bgSkt.src,
  [SourceLanguage.PALI]: bgPli.src,
  welcome: bgWelcome.src,
};

const BgImageBgSize: Record<BackgroundName, Property.BackgroundSize> = {
  [SourceLanguage.TIBETAN]: "contain",
  [SourceLanguage.CHINESE]: "contain",
  [SourceLanguage.SANSKRIT]: "contain",
  [SourceLanguage.PALI]: "contain",
  welcome: "cover",
};

type BackgroundName = SourceLanguage | "welcome";

interface Props extends PropsWithChildren {
  backgroundName?: BackgroundName;
  maxWidth?: Breakpoint;
}

export const PageContainer: FC<Props> = ({
  children,
  backgroundName,
  maxWidth = "md",
}) => {
  const { theme } = useTheme();

  return (
    <>
      {backgroundName && (
        <Container
          maxWidth={false}
          sx={{
            background: `url(${BgImageSrcs[backgroundName]})`,
            backgroundPosition: "center",

            backgroundSize: BgImageBgSize[backgroundName],
            opacity: theme === "dark" ? 0.02 : 0.05,
            height: "100%",
            minWidth: "100vw",
            position: "fixed",
            zIndex: -1,
          }}
        />
      )}
      <Container
        component="main"
        maxWidth={maxWidth}
        sx={{
          pt: { xs: 0, sm: 4 },
          px: { xs: 0, sm: 2, lg: 4 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Container>
    </>
  );
};
