// cypress/support/loginHelper.js
export function loginAndVisit({ email, password, nextRoute }) {
    // Aller sur la page de login
    cy.visit('/login')

    // Attendre 100ms avant de saisir les identifiants
    cy.wait(100)

    cy.get('input[placeholder="Email"]').clear().type(email)
    cy.get('input[placeholder="Mot de passe"]').clear().type(password)

    cy.contains('button', 'Se connecter')
        .should('not.be.disabled')
        .click()

    // Attendre 200ms après la connexion
    cy.wait(200)

    // Visiter la page suivante
    cy.visit(nextRoute)

    // Attendre 200ms après la navigation
    cy.wait(200)
}