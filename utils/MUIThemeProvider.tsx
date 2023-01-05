import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useDbQueryParams } from "@components/hooks/useDbQueryParams";
import { getDesignTokens } from "@components/theme";
import type {} from "@mui/lab/themeAugmentation";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

export const MUIThemeProvider = ({ children }: PropsWithChildren) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  const { sourceLanguage } = useDbQueryParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const MUITheme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          getDesignTokens({
            mode: isMounted ? (theme === "light" ? "light" : "dark") : "light",
            sourceLanguage,
          })
        )
      ),
    [isMounted, sourceLanguage, theme]
  );

  return (
    <ThemeProvider key={theme} theme={MUITheme}>
      {children}
    </ThemeProvider>
  );
};
