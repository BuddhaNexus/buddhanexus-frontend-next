export const defaultLocale = "en";
export const locales = ["en", "de"];

export const otherLocales = locales.filter(
  (locale) => locale !== defaultLocale,
);

export const THEMES = ["light", "dark"];

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
