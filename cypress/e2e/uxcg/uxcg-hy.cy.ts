describe('UXCG Armenian', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/hy/uxcg`);
  });

  it('searches correctly for valid and invalid inputs', () => {
    cy.uxcgTestSearchBehavior('reputation', 'asdasdasdnotfoundquery');
  });

  it('Should open the first question and verify URL and content', () => {
    cy.get('[data-cy="open-question"]:visible').first().click();
    cy.url({ timeout: 10000 }).should(
      'include',
      '/users-do-not-like-our-customer-support',
    );
  });
});
