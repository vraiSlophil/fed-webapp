// cypress/support/loginHelper.js
export function loginAndVisit({ email, password, nextRoute }) {
    // Aller sur la page de login
    cy.visit('/login');

    cy.wait(500);

    // Remplir le formulaire
    cy.get('input[placeholder="Email"]').clear().type(email);
    cy.get('input[placeholder="Mot de passe"]').clear().type(password);

    // Intercepter la requête de login pour savoir quand elle est finie
    cy.intercept('POST', '**/api/login').as('loginRequest');

    cy.contains('button', 'Se connecter').should('not.be.disabled').click();

    // Attendre la fin de la requête de login
    cy.wait('@loginRequest');

    // Vérifier qu'on n'est plus sur /login (redirection effectuée par l'appli)
    cy.location('pathname', { timeout: 10000 }).should('not.eq', '/login');

    // Si on a prévu une route cible différente, on y va sinon on reste
    if (nextRoute) {
        cy.visit(nextRoute);
    }

    // S'assurer que la route finale est bien atteinte
    cy.location('pathname', { timeout: 10000 }).should('include', nextRoute);

    cy.wait(500);
}
