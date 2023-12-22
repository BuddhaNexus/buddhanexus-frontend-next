/* eslint no-console: "off" */

// TODO - import form i18n if poss.
export const defaultLocale = "en";
export const locales = ["en", "de"];
// TODO - see if env vars can be used
export const API_ROOT_URL = "https://buddhanexus2.kc-tbts.uni-hamburg.de/api";

export const otherLocales = locales.filter(
  (locale) => locale !== defaultLocale,
);

export const THEMES = ["light", "dark"];
// export const isMobile = () => {
//   return (
//     Cypress.config("viewportWidth") <
//     Cypress.env("mobileViewportWidthBreakpoint")
//   );
// };

export const makeRoute = (path: string, locale: string) => {
  const pathParts = path.split("/");
  const defaultPath = pathParts
    .filter((part) => !otherLocales.includes(part))
    .join("/");

  if (locale === defaultLocale)
    return defaultPath.length > 0 ? defaultPath : "/";

  if (path === "/") return `/${locale}`;
  return `/${locale}/${path}`.replace("//", "/");
};
