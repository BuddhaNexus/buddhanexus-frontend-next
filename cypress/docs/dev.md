# Test drafting notes


## Initial test spec outline drafting

- Home page renders
- responsive
- accessible
- Static pages render
- side menu opens with database file list content that is searchable & expandable, 
- selecting the primary database category 
  - database category menu data loads (but we should make a decision whether to mock the BE responses or not)
- database file results page:
  - correct file loads (defaults to table view)
  - the number of filters is 0 by default
  - results update on change to filter settings
  - filters are passed in the URL, they are loaded by default (without key press / click)
    - results change are shown in the filter count badge
  - when the reset button is pressed, the filter count is set to 0


## Resources

- https://filiphric.com/how-to-structure-a-big-project-in-cypress
- https://medium.com/@ryansongtamu/learn-cypress-io-the-hard-way-how-to-organize-test-cases-9c7643530c94
- https://learn.cypress.io/real-world-examples/cypress-real-world-app-overview
- https://github.com/cypress-io/cypress-example-recipes/tree/master/examples
- https://github.com/cypress-io/cypress-example-kitchensink/tree/master

- https://github.com/webkom/lego-webapp/blob/master/cypress/e2e/
- https://github.com/nareshbhatia/react-testing-techniques/blob/main/cypress/integration/checkout.spec.ts


