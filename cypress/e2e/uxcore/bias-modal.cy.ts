describe('UX Core Bias Page: Availability Heuristics', () => {
  beforeEach(() => {
    cy.viewport(1920, 900);
    cy.visit(`${Cypress.config().baseUrl}/uxcore/1-availability-heuristics`);
  });

  it('Should show a h1', () => {
    cy.checkH1('Availability heuristics');
  });

  it('toggles Show More / Show Less', () => {
    cy.showMoreAndLess();
  });
  it('Should open the first question and verify URL and content', () => {
    cy.get('[data-cy="open-question"]').first().click();
    cy.url().should('include', '/why-our-company-is-having-reputation-issue#0');
  });

  it('checks social share links', () => {
    cy.checkSocialMediaLink('LinkedIn', 'linkedin.com');
    cy.checkSocialMediaLink('Facebook', 'facebook.com');
    cy.checkSocialMediaLink('Twitter', 'twitter.com');
  });

  it('shows tooltip on copy and hides after 2.5s', () => {
    cy.showCopiedTooltip();
  });

  it('toggles between product and HR views', () => {
    cy.get('[data-cy="switch-hr"]').click();
    cy.get('[data-cy="switch-hr"]')
      .invoke('attr', 'class')
      .should('contain', 'activeHr');

    cy.wait(500);

    cy.get('[data-cy="switch-product"]').click();
    cy.get('[data-cy="switch-product"]')
      .invoke('attr', 'class')
      .should('contain', 'activeProduct');
  });

  it('navigates between biases using arrows', () => {
    cy.clickArrowWhenReady(
      'next',
      `${Cypress.config().baseUrl}/uxcore/2-attentional-bias`,
    );
    cy.wait(1000);

    cy.clickArrowWhenReady(
      'prev',
      `${Cypress.config().baseUrl}/uxcore/1-availability-heuristics`,
    );
  });
});
