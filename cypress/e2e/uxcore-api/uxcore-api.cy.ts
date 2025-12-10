describe('UX Core Api Page', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcore-api`);
  });

  it('Should show a h1', () => {
    cy.checkH1('UX CORE API');
  });

  it('Should check external links', () => {
    cy.checkExternalLinks(['localhost', '']);
  });

  it('Should copy code and show "Copied!" text', () => {
    cy.get('[data-cy="copy-code"]').first().click();
    cy.get('[data-cy="copy-code"]')
      .first()
      .should('have.text', 'Copy code')
      .should(
        'have.attr',
        'data-copied',
        'GET https://api.keepsimple.io/uxcore/?field=[usage, desc]',
      );
  });
});
