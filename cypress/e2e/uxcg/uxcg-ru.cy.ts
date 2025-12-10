describe('UXCG Russian', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/ru/uxcg`);
  });

  it('searches correctly for valid and invalid inputs', () => {
    cy.uxcgTestSearchBehavior('работа', 'асасасасасасасадневерныйзапрос');
  });
});
