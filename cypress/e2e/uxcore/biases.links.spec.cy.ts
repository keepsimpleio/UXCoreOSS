describe('External Links from API', () => {
  let routes: string[] = [];
  const apiUrl =
    'https://strapi.keepsimple.io/api/biases?locale=en&pagination[pageSize]=105&fields[1]=slug';

  before(() => {
    cy.request(apiUrl).then(response => {
      routes = response.body.data.map(
        item =>
          `${Cypress.config().baseUrl}/uxcore/${item.attributes.slug}` || '/',
      );
    });
  });

  it('should check external links on every route from API', () => {
    routes.forEach(route => {
      cy.visit(route);
      cy.wait(1000);
      cy.get('[data-cy="modal-body"]').within(() => {
        cy.get('a').each($a => {
          const message = $a.text();
          const href = $a.prop('href');
          cy.wait(1000);
          expect($a, message)
            .to.have.attr('href')
            .and.not.match(/undefined|null|^$/);

          if (
            href &&
            href.startsWith('http') &&
            !href.includes('http//localhost:3005') &&
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
  });
});
