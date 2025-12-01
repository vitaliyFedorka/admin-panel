module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'tests/e2e/step-definitions/**/*.ts',
      'tests/e2e/support/**/*.ts',
    ],
    format: [
      'progress-bar',
      'html:tests/e2e/reports/cucumber-report.html',
      'json:tests/e2e/reports/cucumber-report.json',
      '@cucumber/pretty-formatter',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    publishQuiet: true,
    worldParameters: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
    },
  },
}

