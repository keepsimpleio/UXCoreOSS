describe('UXCat Page', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcat`);
  });

  it('Should show a h1', () => {
    cy.checkH1('Awareness Test');
  });

  it('should open login modal on start test button click', () => {
    cy.openLoginModalByButtonClick('start-test-btn');
  });

  it('should open login modal on show all achievements button click', () => {
    cy.openLoginModalByButtonClick('show-all-achievements-btn');
  });
});
