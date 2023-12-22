import "cypress/support/commands";

import {
  runBasicPageTests,
  testDBTextPageViews,
  testDBTextSelector,
} from "cypress/support/tests";
import { API_ROOT_URL, otherLocales } from "cypress/support/utils";
import { SOURCE_LANGUAGES } from "utils/constants";

// TODO: Mobile tests
describe("Dynamic routes", () => {
  SOURCE_LANGUAGES.forEach((language) => {
    const page = `/db/${language}`;
    let testTextPath: string;

    it(`Renders accessible DB landing & result pages for ${language}`, () => {
      cy.section(`DB landing & text selection for ${language}`);
      cy.intercept(`${API_ROOT_URL}/menus/files/?language=${language}`).as(
        "textlist",
      );
      // TODO: see why text selector jams after theme switch
      // runBasicPageTests(page);
      cy.visit(page);

      cy.wait("@textlist").then(({ response }) => {
        testTextPath = testDBTextSelector(language, response);
        runBasicPageTests(testTextPath);
        testDBTextPageViews(testTextPath);
      });
    });

    it(`Renders internationalized DB pages for ${language}`, () => {
      otherLocales.forEach((locale) => {
        runBasicPageTests(`/${locale}${page}`);
        runBasicPageTests(`/${locale}${testTextPath}`);
        testDBTextPageViews(`/${locale}${testTextPath}`);
        // TODO: language content spot checks
      });
    });
  });
});
