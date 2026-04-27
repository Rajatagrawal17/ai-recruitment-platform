describe('Recruiter dashboard smoke', () => {
  it('loads dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('Recruiter Dashboard');
  });
});
