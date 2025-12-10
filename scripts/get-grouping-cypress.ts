const group = process.argv[2];

const groupToSpec = {
  uxcore: 'cypress/e2e/uxcore/**/*.cy.ts',
  uxcat: 'cypress/e2e/uxcat/**/*.cy.ts',
  all: 'cypress/e2e/**/*.cy.ts',
};

const exclude = 'cypress/e2e/auth/login.cy.ts';

if (!groupToSpec[group]) {
  console.error(`Unknown group: ${group}`);
  process.exit(1);
}

if (group === 'all') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execSync } = require('child_process');
  const result = execSync(
    `find cypress/e2e -name '*.cy.ts' ! -path '${exclude}'`,
    { encoding: 'utf-8' },
  );
  const files = result.split('\n').filter(Boolean).join(',');
  console.log(files);
} else {
  console.log(groupToSpec[group]);
}
