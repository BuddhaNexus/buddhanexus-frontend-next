export const defaultLocale = "en";
export const locales = ["en", "de"];

export const sampleTextViewPages = [
  "/db/pli/mn14/text",
  "/db/skt/T04sanss09u/text",
  "/db/tib/T02D1955/text",
  "/db/chn/T03n0191/text",
] as const;

export const sampleTableViewPages = [
  "/db/pli/vb1/table",
  "/db/skt/K01n742u/table",
  "/db/tib/K01D0002_H0002/table",
  "/db/chn/X35n0644/table",
] as const;

export const sampleNumbersViewPages = [
  "/db/pli/tha-ap293/numbers",
  "/db/chn/T32n1670A/numbers",
] as const;

export const sampleGraphViewPages = [
  "/db/pli/pli-tv-bu-vb-pc92/graph",
  "/db/skt/GR14vdhapadu/graph",
  "/db/tib/T02D3434/graph",
  "/db/chn/T32n1670A/graph",
] as const;

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
