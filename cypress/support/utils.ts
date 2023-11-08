/* eslint no-console: "off" */

// TODO - import form i18n if poss.
export const defaultLocale = "en";
export const locales = ["en", "de"];
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

// TODO: anchors on mdx pages have been temorarily disabled because of a bug returning a false possitive colour contrast error

export function runThemeToggleTest() {
  cy.get("html").then(($el) => {
    const theme = $el.attr("data-mui-color-scheme");
    const newTheme = THEMES.find((item) => item !== theme);

    cy.step(`Renders accessible ${newTheme} theme page?`);
    cy.getByTestId("theme-toggle")
      .click()
      .then(() => {
        cy.get(`[data-mui-color-scheme="${newTheme}"]`).should("exist");
        cy.checkA11y();
      });
  });
}

const makeRoute = (path: string, locale: string) => {
  const pathParts = path.split("/");
  const defaultPath = pathParts
    .filter((part) => !otherLocales.includes(part))
    .join("/");

  if (locale === defaultLocale)
    return defaultPath.length > 0 ? defaultPath : "/";

  if (path === "/") return `/${locale}`;
  return `/${locale}/${path}`.replace("//", "/");
};

export function runLocaleSwitchTests(path: string) {
  cy.step(`Locale selector navs to other locales?`);

  cy.getByTestId("locale-button").click();
  cy.getByTestId("locale-menu-item").each((item) => {
    const locale = item.prop("lang");
    const isSelected = item.attr("data-locale-selected");

    if (isSelected === "true") return;
    cy.request(makeRoute(path, locale));
  });
}

export function runBasicPageTests(path: string) {
  cy.section(`Testing page: ${path}`);
  console.log(`Testing page: ${path}`);

  cy.visitWithAxe(path);
  cy.checkA11y();
  runThemeToggleTest();
  runLocaleSwitchTests(path);
  // TODO: Mobile tests
}
