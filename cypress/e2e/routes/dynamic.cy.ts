import "cypress/support/commands";

import {
  runBasicPageTestBatch,
  testDBTextPageViews,
} from "cypress/support/tests";
import { API_ROOT_URL, otherLocales } from "cypress/support/utils";
import { SOURCE_LANGUAGES } from "utils/constants";

// TODO: Mobile tests
describe("Dynamic routes", () => {
  SOURCE_LANGUAGES.forEach((language) => {
    const page = `/db/${language}`;

    it(`Satisfies basic page requirements for ${language} DB landing page`, function (this: Mocha.Context) {
      cy.section(`Testing page: ${page}`);
      runBasicPageTestBatch(page);
    });

    it(`Makes random ${language} BD text selection`, function (this: Mocha.Context) {
      cy.section(`Opening ${language} DB page text selector`);
      cy.intercept(`${API_ROOT_URL}/menus/files/?language=${language}`).as(
        "textlist",
      );
      cy.visit(page);

      cy.wait("@textlist").then(({ response }) => {
        cy.step(`Text selector opens text list on click`);
        cy.getByTestId("db-source-text-selector-input").within(() => {
          cy.get("button").click({ force: true });
        });

        cy.step(`Select random ${language} DB text`);
        const textListItems = response?.body?.results?.flat() ?? [];
        const index = Math.floor(Math.random() * textListItems.length);
        const testText = textListItems[index];

        if (!testText?.filename) {
          expect(
            testText?.filename,
            `Test text filename should exist for ${language}. Step: select random text via input & click. Text list length: ${
              textListItems.length
            }. Random index: ${index}. Test text: ${JSON.stringify(testText)}`,
          ).to.exist;
        }

        const selectedDbTextPath = `/db/${language}/${testText.filename}/table`;
        this.randomDbTextPath = selectedDbTextPath;

        cy.getByTestId("db-source-text-input-list").should("be.visible");

        cy.focused().type(testText.displayName);
        cy.getByTestId("db-source-text-input-list-item")
          .first()
          .then((element) => {
            cy.wrap(element)
              .invoke("data", "testdata-file-name")
              .should("eq", testText?.filename);
            cy.wrap(element).click();
          });

        cy.step(`App navigates to correct ${language} DB text in table view`);
        cy.location().should((location) => {
          expect(
            location.pathname,
            `App navigates to correct ${language} DB text in table view. Expected: ${selectedDbTextPath}. Actual: ${
              location.pathname
            }. Test text: ${JSON.stringify(testText)}`,
          ).to.eq(selectedDbTextPath);
        });
      });
    });

    it(`Satisfies basic page requirements for random ${language} DB text selection`, function (this: Mocha.Context) {
      cy.section(`Testing page: ${this.randomDbTextPath}`);
      runBasicPageTestBatch(this.randomDbTextPath);
    });

    it(`Renders random ${language} DB text selection in all views`, function (this: Mocha.Context) {
      cy.section(`Test DB text views for ${language}`);
      const viewPaths = testDBTextPageViews(this.randomDbTextPath);
      viewPaths.forEach((path) => {
        runBasicPageTestBatch(path);
      });
    });

    it(`Renders i18n pages for ${language} DB text selection`, function (this: Mocha.Context) {
      cy.section(`i18n tests for ${language} DB pages`);
      otherLocales.forEach((locale) => {
        runBasicPageTestBatch(`/${locale}${page}`);
        runBasicPageTestBatch(`/${locale}${this.randomDbTextPath}`);
        const i18nViewPaths = testDBTextPageViews(
          `/${locale}${this.randomDbTextPath}`,
        );
        i18nViewPaths.forEach((path) => {
          runBasicPageTestBatch(path);
        });
        // TODO: language content spot checks
      });
    });
  });
});
