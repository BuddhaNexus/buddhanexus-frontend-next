import "cypress/support/commands";

import { runA11yTest, runA11yThemeTest } from "cypress/support/tests";
import { otherLocales } from "cypress/support/utils";
import { uniqueQueryParams } from "features/sidebarSuite/config/settings";
import { SOURCE_LANGUAGES } from "utils/constants";

describe("Core page a11y tests", () => {
  it("renders accessible, home page for all locals", () => {
    runA11yTest("/");

    cy.step(`DB options render`);
    cy.getByTestId("db-language-tile").should(
      "have.length",
      SOURCE_LANGUAGES.length,
    );

    otherLocales.forEach((locale) => {
      runA11yTest(`/${locale}`);
    });
  });

  it("renders accessible, db landing pages for all locals", () => {
    SOURCE_LANGUAGES.forEach((language) => {
      runA11yTest(`/db/${language}`);

      otherLocales.forEach((locale) => {
        runA11yTest(`/${locale}/db/${language}`);
      });
    });
  });

  it("renders accessible, mdx content pages in all locales", () => {
    cy.readDirectory("./content/pages").then((pages: string[]) => {
      pages.forEach((page) => {
        runA11yTest(page);

        otherLocales.forEach((locale) => {
          runA11yTest(`/${locale}/${page}`);
        });
      });
    });

    cy.readDirectory("./content/news").then((pages: string[]) => {
      pages.forEach((page) => {
        const path = `news/${page}`;
        runA11yTest(path);

        otherLocales.forEach((locale) => {
          runA11yTest(`/${locale}/${path}`);
        });
      });
    });
  });

  it("renders accessible, search page for all locals", () => {
    const url = `/search?${uniqueQueryParams.searchString}=${encodeURI(
      "Kacci pana vo, anuruddhā, samaggā sammodamānā",
    )}`;
    runA11yTest(url);

    otherLocales.forEach((locale) => {
      runA11yTest(`/${locale}/${url}`);
    });
  });
});

describe("Core toggled theme a11y page tests", () => {
  // TODO: figure out why the commented tests fail in a non-UI run
  // it("renders accessible, home page", () => {
  //   runA11yThemeTest("/");
  // });

  // it("renders accessible, db landing pages", () => {
  //   SOURCE_LANGUAGES.forEach((language) => {
  //     runA11yThemeTest(`/db/${language}`);
  //   });
  // });

  it("renders accessible, mdx content pages in all locales", () => {
    cy.readDirectory("./content/pages").then((pages: string[]) => {
      pages.forEach((page) => {
        runA11yThemeTest(page);
      });
    });

    cy.readDirectory("./content/news").then((pages: string[]) => {
      pages.forEach((page) => {
        const path = `news/${page}`;
        runA11yThemeTest(path);
      });
    });
  });

  it("renders accessible, search page", () => {
    const url = `/search?${uniqueQueryParams.searchString}=${encodeURI(
      "Kacci pana vo, anuruddhā, samaggā sammodamānā",
    )}`;
    runA11yThemeTest(url);
  });
});
