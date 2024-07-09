import { NodeResult } from "axe-core";

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

export function runBasicPageTestBatch(path: string) {
  const axeViolationElements: NodeResult["target"][] = [];
  cy.visitWithAxe(path);
  testA11y();
  return axeViolationElements;
}
