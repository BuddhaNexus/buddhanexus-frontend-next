import "cypress/support/commands";

import { SOURCE_LANGUAGES } from "utils/constants";

function runDefaultTests() {
  cy.get("[data-testid='app-bar']");
  cy.get("main").should("have.length", 1);
  cy.checkA11y();
}
// function testLocal() {}
// function testTheme() {}

describe("Basic tests on static content pages", () => {
  it("renders home page accessible content", () => {
    cy.visit("/");
    cy.injectAxe();
    runDefaultTests();
    cy.get("[data-testid='db-language-tile']").should(
      "have.length",
      SOURCE_LANGUAGES.length,
    );
  });

  it("renders mdx static pages accessible content", () => {
    cy.readDirectory("./content/pages").then((pages: string[]) => {
      pages.forEach((page) => {
        cy.visit(page);
        cy.injectAxe();
        runDefaultTests();
      });
    });
  });

  // it("renders mdx news pages accessible content", () => {
  //   cy.readDirectory("./content/news").then((pages: string[]) => {
  //     pages.forEach((page) => {
  //       cy.visit(page);
  //       cy.injectAxe();
  //       runDefaultTests();
  //     });
  //   });
  // });
});
