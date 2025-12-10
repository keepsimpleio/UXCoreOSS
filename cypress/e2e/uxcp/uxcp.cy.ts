describe('UXCP Page', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcp`);
  });

  it('Should show a h1', () => {
    cy.checkH1('UX CORE PERSONA');
  });

  it('clicks to show all buttons', () => {
    cy.get('[data-cy="show-all-button"]').first().click();
    cy.get('[data-cy="show-all-button"]').first().should('not.be.visible');
  });

  it('adds biases to the list', () => {
    cy.uxcpAddBiases();
    cy.get('[data-cy="suggested-question"]').should('be.visible');
    cy.get('[data-cy="full-screen-button"]').click();
    cy.get('[data-cy="expanded-decision-table-modal"]').should('be.visible');
    cy.get('[data-cy="modal-background-click"]').click({ force: true });
    cy.wait(500);

    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="login-modal"]').should('be.visible');
  });

  it("searches for 'confirmation' and checks results", () => {
    cy.uxcpSearchBehavior('confirmation', 'nonexistentword');
  });

  it('clicks to analyze as team member and types a name', () => {
    cy.get('[data-cy="uxcp-switcher-as-team-member"]').click();
    cy.get('[data-cy="input-field"]', { timeout: 4000 })
      .should('be.visible')
      .first()
      .type('Mary Khachatryan');
  });

  it('checks external links', () => {
    const singleRoute = `${Cypress.config().baseUrl}/uxcp`;

    cy.visit(singleRoute);

    cy.get('a').each($a => {
      const href = $a.prop('href');
      const message = $a.text();

      expect($a, message)
        .to.have.attr('href')
        .and.not.match(/undefined|null|^$/);

      if (
        href &&
        href.startsWith('http') &&
        !href.includes('localhost') &&
        !href.includes('linkedin.com') &&
        !href.includes('facebook.com')
      ) {
        cy.request({
          url: href,
          failOnStatusCode: false,
        }).then(response => {
          cy.log(
            `Checking external link: ${href} - Status: ${response.status}`,
          );
          expect(response.status).to.be.oneOf([200, 301, 302, 403]);
        });
      }
    });
  });
});
