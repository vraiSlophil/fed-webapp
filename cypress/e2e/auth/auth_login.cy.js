describe('Auth - Login', () => {
    it("affiche le formulaire de connexion et valide l'état initial", () => {
        cy.visit('/login');

        cy.contains('h1', 'Connexion').should('be.visible');
        cy.get('input[placeholder="Email"]').should('be.visible').and('have.value', '');
        cy.get('input[placeholder="Mot de passe"]').should('exist').and('have.value', '');
        cy.contains('button', 'Se connecter').should('be.visible').and('be.disabled');
    });
});
