describe('Espace utilisateur', () => {
    it("redirige vers /login si l'utilisateur n'est pas authentifié", () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit('/user');
        cy.url().should('include', '/login');
    });

    it('affiche le profil utilisateur pour un utilisateur connecté (scénario dépendant du backend)', () => {
        // Ce test suppose qu'un backend de test est en place avec un user connecté via un autre flux
        // Ici on vérifie simplement la structure de la page après authentification
        cy.visit('/user');
        // À adapter si tu as une façon de pré-authentifier (cookie, API, etc.)
        // cy.setCookie('auth', 'token-de-test');
        // cy.reload();

        cy.contains('Profil utilisateur').should('exist');
    });
});
