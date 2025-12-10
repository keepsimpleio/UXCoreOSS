// Exclude this from CI
describe('Login page', () => {
  before(() => {
    cy.visit(`${Cypress.config().baseUrl}/uxcore`);
    cy.loginBySession();
  });

  it('Should show logged-in user content', () => {
    cy.visit(`${Cypress.config().baseUrl}/uxcore`);
    // cy.contains('Welcome'); // add valid condition here
  });
});
