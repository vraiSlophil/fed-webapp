describe('Auth - Register', () => {
    it("affiche le formulaire d'inscription et désactive le bouton tant que le formulaire est incomplet", () => {
        cy.visit('/register');

        cy.contains('h1', 'Inscription').should('be.visible');
        cy.get('input[placeholder="Nom d\'utilisateur"]').should('be.visible');
        cy.get('input[placeholder="Email"]').should('be.visible');
        cy.get('input[placeholder="Mot de passe"]').should('exist');
        cy.get('input[placeholder="Confirmer le mot de passe"]').should('exist');

        cy.contains('button', "S'inscrire").should('be.disabled');
    });
});
