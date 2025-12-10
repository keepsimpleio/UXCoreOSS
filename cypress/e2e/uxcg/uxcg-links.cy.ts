describe('External Links from API', () => {
  let routes: string[] = [];
  const apiUrl =
    'https://strapi.keepsimple.io/api/questions?locale=en&pagination[pageSize]=105&fields[1]=slug';

  before(() => {
    cy.request(apiUrl).then(response => {
      routes = response.body.data.map(
        item =>
          `${Cypress.config().baseUrl}/uxcg/${item.attributes.slug}` || '/',
      );
    });
  });

  it('should check external links on every route from API', () => {
    cy.checkAllLinks(routes);
  });
});
