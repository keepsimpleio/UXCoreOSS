describe('UX Core Page', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcore`);
  });

  it('uxcg informmative tooltip should be visible', () => {
    cy.get('[data-cy="uxcg-informative-tooltip"]').should('be.visible');
  });

  it('opens podcast popup by clicking on the icon', () => {
    cy.get('[data-cy="podcast-button"]').click();
    cy.get('[data-cy="uxcore-podcast-popup"]').should('be.visible');
    cy.get('[data-cy="uxcore-podcast-close-icon"]').click();
  });

  it('switch view mode', () => {
    cy.get('[data-cy="folder-view-switcher"]').click();
    cy.wait(1000);
    cy.get('h1').first().should('have.text', 'UX CORE');

    cy.get('[data-cy="sticky-label"]')
      .should('be.visible')
      .and('have.css', 'position', 'sticky');

    cy.get('[data-cy="list-container"]').scrollTo('bottom', {
      ensureScrollable: false,
    });
    cy.wait(1000);
    cy.get('[data-cy="sticky-label"]').should('be.visible');
    cy.wait(500);

    cy.get('[data-cy="uxcore-folder-item"]').first().click({ force: true });
    cy.wait(500);

    cy.url().should('include', '/uxcore/1-availability-heuristics');
    cy.get('[data-cy="uxcore-modal-close-button"]').click();
    cy.wait(500);
    cy.get('[data-cy="folder-view-switcher"]').click();
    cy.wait(1000);

    cy.get('[data-cy="uxcore-folder-item-bottom"]').first().click();
    cy.url().should('include', '/105-serial-position-effect');
    cy.wait(500);
    cy.get('[data-cy="uxcore-modal-close-button"]').click();
    cy.wait(500);

    cy.get('[data-cy="folder-view-switcher"]').click();
    cy.wait(1000);

    cy.get('[data-cy="core-view-switcher"]').click({ force: true });
    cy.wait(500);
  });

  it('checks search inpt', () => {
    cy.uxcoreSearchBehavior('confirmation', 'asdasdasdnotfoundquery');
  });

  it('Switches between product and HR views', () => {
    cy.get('[data-cy="switch-hr"]').click();
    cy.get('[data-cy="uxcore-snackbar"]').should('be.visible');

    cy.wait(500);

    cy.get('[data-cy="switch-product"]').click();
    cy.get('[data-cy="uxcore-snackbar"]').should('be.visible');
  });

  it('shows zoom box on mouseover core bias label', () => {
    cy.get('[data-cy="core-bias-label"]').first().trigger('mouseover');
    cy.get('[data-cy="core-zoom-box"]').should('be.visible');
  });

  it('opens first search result item and verifies URL', () => {
    cy.get('[data-cy="search-result-item"]').first().click({ force: true });

    cy.url().should('include', '/uxcore/1-availability-heuristics');
  });
});
