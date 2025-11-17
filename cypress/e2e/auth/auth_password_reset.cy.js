describe('Auth - Mot de passe oublié / réinitialisation', () => {
    it('affiche le formulaire "mot de passe oublié"', () => {
        cy.visit('/forgot-password')

        cy.contains('h1', 'Mot de passe oublié').should('be.visible')
        cy.get('input[placeholder="Votre email"]').should('be.visible')
        cy.contains('button', 'Envoyer le lien de réinitialisation')
            .should('be.visible')
            .and('be.disabled')
    })

    it('affiche le formulaire de réinitialisation à partir d\'un token', () => {
        cy.visit('/password-reset/FAKE_TOKEN?email=test@example.com')

        cy.contains('h1', 'Réinitialiser le mot de passe').should('be.visible')
        cy.get('input[placeholder="Nouveau mot de passe"]').should('exist')
        cy.get('input[placeholder="Confirmer le mot de passe"]').should('exist')
        cy.contains('button', 'Réinitialiser').should('be.visible')
    })
})

