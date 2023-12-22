# Cypress testing

- to test a specific element, add a `data-testid` attribute to the component:

  ```
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: materialTheme.zIndex.drawer + 1,
        borderBottom: `1px solid ${materialTheme.palette.background.accent}`,
      }}
      data-testid="app-bar"
    >
  ```

  Access it in the test using the custom `getByTestId` helper function:

  ```
   cy.getByTestId("app-bar").should("exist");
  ```



- 