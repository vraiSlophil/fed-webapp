describe('Espace utilisateur - Préférences', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        // Se connecter
        cy.visit('/login');
        cy.get('input[type="email"]').type('user@example.com');
        cy.get('input[type="password"]').type('password');
        cy.get('button[type="submit"]').click();
    });

    it('affiche les préférences utilisateur', () => {
        cy.visit('/user');
        cy.contains('Préférences').click();
        cy.get('.preferences').should('be.visible');
    });

    it('permet de modifier les préférences de notification', () => {
        cy.visit('/user');
        cy.contains('Préférences').click();

        cy.get('input[name="email_notifications"]').uncheck();
        cy.get('button[type="submit"]').click();

        cy.contains('Préférences enregistrées').should('be.visible');
    });
});
