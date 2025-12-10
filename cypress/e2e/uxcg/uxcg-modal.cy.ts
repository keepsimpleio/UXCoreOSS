describe('UXCG Modal: Availability Heuristics', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(
      `${Cypress.config().baseUrl}/uxcg/why-our-company-is-having-reputation-issue#0`,
    );
  });

  it('Should show the first h1', () => {
    cy.get('h1')
      .first()
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.equal('Why our company has reputation issue?');
      });
  });

  it('clicks related question and opens it in the same tab', () => {
    cy.get('[data-cy="related-question"]').first().click();
    cy.url().should(
      'eq',
      `${Cypress.config().baseUrl}/uxcg/which-product-components-are-most-sensitive-to-changes`,
    );
  });

  it('checks social share links', () => {
    cy.checkSocialMediaLink('LinkedIn', 'linkedin.com');
    cy.checkSocialMediaLink('Facebook', 'facebook.com');
    cy.checkSocialMediaLink('Twitter', 'twitter.com');
  });

  it('shows tooltip on copy and hides after 2.5s', () => {
    cy.showCopiedTooltip();
  });

  it('navigates between questions using arrows', () => {
    cy.clickArrowWhenReady(
      'next',
      `${Cypress.config().baseUrl}/uxcg/why-our-users-are-not-happy-with-product`,
    );
    cy.wait(1000);

    cy.clickArrowWhenReady(
      'prev',
      `${Cypress.config().baseUrl}/uxcg/why-our-company-is-having-reputation-issue`,
    );
  });

  it('Should check if the first tag is visible', () => {
    cy.get('[data-cy="modal-tag"]').first().should('be.visible');
  });
});
