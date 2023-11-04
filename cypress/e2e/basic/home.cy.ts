describe("Basic tests on build", () => {
  it("passes", () => {
    cy.visit("/");
    cy.get("[data-testid='h1']").should("exist");
  });
});
