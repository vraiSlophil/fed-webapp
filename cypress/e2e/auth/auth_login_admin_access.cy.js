import {loginAndVisit} from "../../support/loginHelper.js";

describe('Authentification - Accès admin', () => {
    // On suppose que baseUrl est configuré dans cypress.config.js

    beforeEach(() => {
        // Nettoyer l'état de session entre les tests
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it("permet à un utilisateur admin authentifié d'accéder à la page /admin", () => {
        loginAndVisit({
            email: 'admin@example.com',
            password: 'password',
            nextRoute: '/admin'
        })

        // Vérifier la redirection automatique vers /admin
        cy.url().should('include', '/admin');
        cy.contains('Administration').should('be.visible');
    });

    it("refuse l'accès à /admin pour un utilisateur non authentifié", () => {
        cy.visit('/admin');
        cy.url().should('include', '/login');
        cy.contains('Connexion').should('be.visible');
    });

    it("affiche un message d'erreur si les identifiants sont invalides", () => {
        cy.visit('/login');

        cy.contains('Connexion').should('be.visible');

        cy.get('input[type="email"]').type('admin@example.com');
        cy.get('input[type="password"]').type('wrong-password');

        cy.get('button[type="submit"]').click();

        // À adapter au texte exact de ton message d'erreur
        cy.contains('Identifiants invalides').should('be.visible');
        cy.url().should('include', '/login');
    });
});