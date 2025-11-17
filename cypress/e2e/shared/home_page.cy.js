describe('Shared - Page d\'accueil', () => {
    it('affiche le texte principal et le typewriter', () => {
        cy.visit('/')

        cy.contains('Avec FED,').should('be.visible')
        cy.contains('votre travail.').should('be.visible')
    })
})

