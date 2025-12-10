describe('UXCG Page', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcg`);
  });

  it('should show a h1', () => {
    cy.checkH1('UX CORE GUIDE');
  });

  it('uxcore informmative tooltip should be visible', () => {
    cy.get('[data-cy="uxcore-informative-tooltip"]').should('be.visible');
  });

  it('should toggle accordion open and close by clicking', () => {
    // Close accordion
    cy.get('[data-cy="open-close-accordion-button"]').first().click();
    cy.get('[data-cy="accordion-content"]').should('not.be.visible');

    // Open accordion
    cy.get('[data-cy="open-close-accordion-button"]').first().click();
    cy.get('[data-cy="accordion-content"]').should('be.visible');
  });
  it('should click tag and open related questions list', () => {
    cy.get('[data-cy="tag"]').click({ multiple: true });
  });

  it('searches correctly for valid and invalid inputs', () => {
    cy.uxcgTestSearchBehavior('reputation', 'asdasdasdnotfoundquery');
  });

  it('should open the first question and verify URL and content', () => {
    cy.get('[data-cy="open-question"]').first().click();
    cy.url().should('include', '/users-do-not-like-our-customer-support');
  });
});
