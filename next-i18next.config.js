/* eslint-disable @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires */
const HttpBackend = require("i18next-http-backend/cjs");

const supportedLocales = ["en", "de"];

// https://github.com/felixmosh/i18next-hmr/blob/master/examples/next-with-next-i18next-v13/next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: supportedLocales,
  },
  ...(typeof window !== "undefined"
    ? {
        backend: {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      }
    : {}),
  serializeConfig: false,
  // allows reloading translations on each page navigation / a hacky way to reload translations on the server at Next v13
  reloadOnPrerender: process.env.NODE_ENV === "development",
  use:
    process.env.NODE_ENV !== "production"
      ? typeof window !== "undefined"
        ? [HttpBackend]
        : []
      : [],
};
