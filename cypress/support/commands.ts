/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("readDirectory", (directory: string) => {
  return cy.task("readDirectory", directory);
});

Cypress.Commands.add("getByTestId", (id, ...args) => {
  return cy.get(`[data-testid=${id}]`, ...args);
});

Cypress.Commands.add("visitWithAxe", (path: string) => {
  return cy.visit(path).injectAxe();
});

declare global {
  namespace Cypress {
    interface Chainable {
      readDirectory(directory: string): Chainable<string[]>;
      /**
       * Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestId('greeting')
       */
      getByTestId(
        dataTestAttribute: string,
        args?: any
      ): Chainable<JQuery<HTMLElement>>;
      /**
       * Custom command to visit page and inject accessibility rules.
       *
       * cy.injectAxe() must be run *after* a call to cy.visit() and before you run the checkA11y command.
       *
       * @example cy.visitWithAxe('/');
       * @see https://github.com/cypress-io/cypress-axe
       */
      visitWithAxe(path: string): Chainable<void>;
    }
  }
}

export {};
