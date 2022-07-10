describe('login as guest and logout', () => {
  it('visits slack-clone', () => {
    cy.visit('/')
  });

  it('clicks on login as guest', () => {
    cy.get('.mat-button')
      .contains('continue as guest').click();
    cy.get('.mat-sidenav').should('contain', 'Channel');
    cy.get('.mat-sidenav').should('contain', 'Direct Messages');
    cy.get('.mat-sidenav').should('contain', 'Legal & Privacy Notice');
    cy.get('.mat-toolbar').get('.mat-icon-button').should('contain', 'menu');
    cy.get('.mat-toolbar').get('img').should('have.attr', 'src', 'assets/img/avatar-neutral-light-grey.png');
  });

  it('clicks on avatar', () => {
    cy.get('.mat-toolbar').get('.toolbar-avatar').click();
    cy.get('.matMenu').should('contain', 'Edit Avatar');
    cy.get('.matMenu').should('contain', 'Edit Profile');
    cy.get('.matMenu').should('contain', 'Delete Account');
    cy.get('.matMenu').should('contain', 'Logout');
  })
  
  it('clicks on logout', () => {
    cy.get('.matMenu').contains('Logout').click();
    cy.url().should('include', 'login');
    cy.get('.mat-toolbar').get('.toolbar-avatar').should('not.exist');
    cy.get('.mat-toolbar').get('.mat-icon-button').contains('menu').should('not.exist');
    cy.get('.mat-toolbar').get('.menuLogo').should('be.visible');

  })
});