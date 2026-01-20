import { loginAndVisit } from '../../support/loginHelper.js';

describe('Administration - Accès', () => {
    it("redirige vers /login si on tente d'accéder à /admin sans être authentifié", () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit('/admin');
        cy.url().should('include', '/login');
    });
});

describe('Administration - Tableau de bord', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it("refuse l'accès à la page admin pour un utilisateur non connecté", () => {
        cy.visit('/admin');
        cy.url().should('include', '/login');
    });

    it('affiche le tableau de bord admin pour un administrateur connecté', () => {
        // cy.visit("/login");
        // cy.get('input[type="email"]').should("be.visible");
        // cy.get('input[type="email"]').type("admin@example.com");
        // cy.get('input[type="password"]').type("password");
        // cy.get('button[type="submit"]').click();
        //
        // cy.visit("/admin");

        loginAndVisit({
            email: 'admin@example.com',
            password: 'password',
            nextRoute: '/admin',
        });

        cy.url().should('include', '/admin');
        cy.contains('h1', 'Administration').should('be.visible');
    });
});
