import "cypress/support/commands";

import { otherLocales, runBasicPageTests } from "cypress/support/utils";
// import { searchPageFilter } from "features/sidebarSuite/config/settings";
import { SOURCE_LANGUAGES } from "utils/constants";

describe("Static routes", () => {
  it("renders accessible, home page in dark and light mode and all locals", () => {
    runBasicPageTests("/");

    cy.step(`DB options render`);
    cy.getByTestId("db-language-tile").should(
      "have.length",
      SOURCE_LANGUAGES.length,
    );

    otherLocales.forEach((locale) => {
      runBasicPageTests(`/${locale}`);
    });
  });

  // it("renders accessible, search page in dark and light mode and all locals", () => {
  //   const url = `/search?${searchPageFilter.search}=${encodeURI(
  //     "Kacci pana vo, anuruddhā, samaggā sammodamānā",
  //   )}`;
  //   runBasicPageTests(url);

  //   // TODO

  //   otherLocales.forEach((locale) => {
  //     runBasicPageTests(`/${locale}/${url}`);
  //   });
  // });

  // it("renders accessible, mdx content pages in all locales", () => {
  //   cy.readDirectory("./content/pages").then((pages: string[]) => {
  //     pages.forEach((page) => {
  //       runBasicPageTests(page);

  //       otherLocales.forEach((locale) => {
  //         runBasicPageTests(`/${locale}/${page}`);
  //       });
  //     });
  //   });

  //   cy.readDirectory("./content/news").then((pages: string[]) => {
  //     pages.forEach((page) => {
  //       const path = `news/${page}`;
  //       runBasicPageTests(path);

  //       otherLocales.forEach((locale) => {
  //         runBasicPageTests(`/${locale}/${path}`);
  //       });
  //     });
  //   });
  // });
});
