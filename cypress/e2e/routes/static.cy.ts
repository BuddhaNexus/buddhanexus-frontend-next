import "cypress/support/commands";

import { runBasicPageTestBatch } from "cypress/support/tests";
import { otherLocales } from "cypress/support/utils";
import { uniqueQueryParams } from "features/sidebarSuite/config/settings";
import { SOURCE_LANGUAGES } from "utils/constants";

describe("Static routes", () => {
  it("renders accessible, home page in dark and light mode and all locals", () => {
    runBasicPageTestBatch("/");

    cy.step(`DB options render`);
    cy.getByTestId("db-language-tile").should(
      "have.length",
      SOURCE_LANGUAGES.length,
    );

    otherLocales.forEach((locale) => {
      runBasicPageTestBatch(`/${locale}`);
    });
  });

  it("renders accessible, mdx content pages in all locales", () => {
    cy.readDirectory("./content/pages").then((pages: string[]) => {
      pages.forEach((page) => {
        runBasicPageTestBatch(page);

        otherLocales.forEach((locale) => {
          runBasicPageTestBatch(`/${locale}/${page}`);
        });
      });
    });

    cy.readDirectory("./content/news").then((pages: string[]) => {
      pages.forEach((page) => {
        const path = `news/${page}`;
        runBasicPageTestBatch(path);

        otherLocales.forEach((locale) => {
          runBasicPageTestBatch(`/${locale}/${path}`);
        });
      });
    });
  });

  it("renders accessible, search page in dark and light mode and all locals", () => {
    const url = `/search?${uniqueQueryParams.searchString}=${encodeURI(
      "Kacci pana vo, anuruddhā, samaggā sammodamānā",
    )}`;
    runBasicPageTestBatch(url);

    otherLocales.forEach((locale) => {
      runBasicPageTestBatch(`/${locale}/${url}`);
    });
  });
});
