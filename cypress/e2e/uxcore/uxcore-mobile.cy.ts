describe('UX Core Page: Mobile View', () => {
  beforeEach(() => {
    cy.viewport(800, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcore`);
  });

  it('should have a heading with text "UX CORE"', () => {
    cy.checkH1('UX CORE');
  });
  it('should swipe to the next slide and check URL', () => {
    cy.get('[data-cy="uxcore-mobile-bias"]').first().click();
    cy.url().should('include', '/uxcore/1-availability-heuristics');
    cy.wait(2000);
    cy.checkSwiperSlide(
      `${Cypress.config().baseUrl}/uxcore/1-availability-heuristics`,
      `${Cypress.config().baseUrl}/uxcore/2-attentional-bias`,
    );
  });

  it('clicks to useful links dropdown and checks its content', () => {
    cy.get('[data-cy="useful-links-dropdown"]').click();
    cy.get('[data-cy="useful-links-content"]').should('be.visible');
    cy.get('[data-cy="useful-links-content"] a').should(
      'have.length.greaterThan',
      0,
    );
    cy.get('[data-cy="useful-links-dropdown"]').click();
    cy.get('[data-cy="useful-links-content"]').should('not.be.visible');
  });

  it('opens first UX Core bias and verifies URL', () => {
    cy.get('[data-cy="uxcore-mobile-bias"]').first().click();
    cy.url().should('include', '/uxcore/1-availability-heuristics');
    cy.get('[data-cy="uxcore-modal-close-button"]').click();
    cy.url().should('include', '/uxcore');
  });
});
