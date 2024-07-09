import { NodeResult } from "axe-core";
import { THEMES } from "cypress/support/utils";

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
    cy.wait(100);
    cy.get("html").should("have.attr", "data-mui-color-scheme", newTheme);
  });
}

export function runA11yTest(path: string) {
  const axeViolationElements: NodeResult["target"][] = [];
  cy.visitWithAxe(path);
  testA11y();
  return axeViolationElements;
}

export function runA11yThemeTest(path: string) {
  const axeViolationElements: NodeResult["target"][] = [];
  cy.visitWithAxe(path);
  testThemeToggle();
  testA11y();
  return axeViolationElements;
}
