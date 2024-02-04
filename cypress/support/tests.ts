import { NodeResult } from "axe-core";
import { makeRoute, THEMES } from "cypress/support/utils";

const setNodesOutline = (nodes: NodeResult[], value: string) => {
  nodes.forEach((node) => {
    cy.get(node.target.join(" "), { log: false }).invoke(
      { log: false },
      "css",
      "outline",
      value,
    );
  });
};

export function testA11y() {
  cy.location().then((location) => {
    cy.step(`Is ${location.pathname} accessible?`);

    cy.checkA11y(undefined, undefined, (violations) => {
      violations.forEach((violation) => {
        setNodesOutline(violation.nodes, "3px solid magenta");
        cy.log(`[AXE FAIL] ${violation.id}: ${violation.description}`);
        cy.screenshot({ capture: "runner", log: false });
        setNodesOutline(violation.nodes, "none");
      });
    });
  });
}

export function testThemeToggle() {
  cy.get("html").then(($el) => {
    const theme = $el.attr("data-mui-color-scheme");
    const newTheme = THEMES.find((item) => item !== theme);
    cy.step(`Renders accessible ${newTheme} theme page?`);

    cy.getByTestId("theme-toggle").click();
    cy.get(`[data-mui-color-scheme="${newTheme}"]`).should("exist");
  });
}

export function testLocaleSwitches(path: string) {
  cy.step(`Locale selector navs to other locales?`);

  cy.getByTestId("locale-button").click();
  cy.getByTestId("locale-menu-item").each((item) => {
    const locale = item.prop("lang");
    const isSelected = item.attr("data-locale-selected");

    if (isSelected === "true") return;
    cy.request(makeRoute(path, locale));
  });
}

export const testDBTextPageViews = (testTextPath: string) => {
  const viewPaths: string[] = [];
  cy.step(`Visit DB text results pages for all views`);

  cy.visitWithAxe(testTextPath);
  cy.getByTestId("db-view-selector").click();
  cy.getByTestId("db-view-selector-list-item").should("be.visible");

  cy.getByTestId("db-view-selector-list-item").each(($item) => {
    const view = $item.attr("data-value");

    if (view === "table" || !view) return;
    cy.step(`Navigate to ${view} view`);
    const viewPath = testTextPath.replace("table", view);
    viewPaths.push(viewPath);

    cy.wrap($item).click();
    cy.location().should((location) => {
      expect(location.pathname).to.eq(viewPath);
    });
  });

  return viewPaths;
};

export function runBasicPageTestBatch(path: string) {
  const axeViolationElements: NodeResult["target"][] = [];

  cy.visitWithAxe(path);
  testA11y();
  testThemeToggle();
  // TODO: investigate colour contrast error false positive.
  // testA11y();
  testLocaleSwitches(path);
  testA11y();
  // TODO: Mobile tets

  return axeViolationElements;
}
