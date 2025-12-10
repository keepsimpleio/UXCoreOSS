describe('UXCG Page: Mobile View', () => {
  beforeEach(() => {
    cy.viewport(800, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcg`);
  });

  it('should have a heading with text "UX CORE GUIDE"', () => {
    cy.checkH1('UX CORE GUIDE');
  });
  it('should swipe to the next slide and check URL', () => {
    cy.get('[data-cy="open-question"]').first().click();
    cy.wait(2000);
    cy.url().should('include', '/uxcg/users-do-not-like-our-customer-support');
    cy.wait(2000);
    cy.checkSwiperSlide(
      `${Cypress.config().baseUrl}/uxcg/users-do-not-like-our-customer-support`,
      `${Cypress.config().baseUrl}/uxcg/users-blame-us-for-their-own-mistakes`,
    );
  });
});
