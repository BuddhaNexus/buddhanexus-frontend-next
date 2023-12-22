import { makeRoute, THEMES } from "cypress/support/utils";

export function runThemeToggleTest() {
  cy.get("html").then(($el) => {
    const theme = $el.attr("data-mui-color-scheme");
    const newTheme = THEMES.find((item) => item !== theme);

    cy.step(`Renders accessible ${newTheme} theme page?`);
    cy.getByTestId("theme-toggle").click();
    cy.get(`[data-mui-color-scheme="${newTheme}"]`).should("exist");
    cy.checkA11y();
  });
}

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

  cy.visitWithAxe(path);
  cy.checkA11y();
  runThemeToggleTest();
  runLocaleSwitchTests(path);
  // TODO: Mobile tests
}

export const testDBTextSelector = (language: string, response: any) => {
  cy.step(`Text selector opens text list on click`);
  cy.getByTestId("db-source-text-selector-input").within(() => {
    cy.get("button").click({ force: true });
  });
  cy.getByTestId("db-source-text-input-list").should("be.visible");

  cy.step(`Select random text via input & click`);
  const textListItems = response?.body?.results?.flat() ?? [];
  const index = Math.floor(Math.random() * textListItems.length);
  const testText = textListItems[index];
  const testTextPath = `/db/${language}/${testText.filename}/table`;

  cy.focused().type(testText.displayName);
  cy.getByTestId("db-source-text-input-list-item").first().click();

  cy.step(`App navigates to correct DB text in table view`);
  cy.location().should((location) => {
    expect(location.pathname).to.eq(testTextPath);
  });

  return testTextPath;
};

export const testDBTextPageViews = (testTextPath: string) => {
  cy.section(`DB text result view pages`);

  cy.getByTestId("db-view-selector").click();
  cy.getByTestId("db-view-selector-list-item").should("be.visible");

  cy.getByTestId("db-view-selector-list-item").each(($item) => {
    const view = $item.attr("data-value");

    if (view === "table" || !view) return;
    cy.step(`Navigate to ${view} view`);
    const viewPath = testTextPath.replace("table", view);

    cy.wrap($item).click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq(viewPath);
    });
    runBasicPageTests(viewPath);
  });
};
