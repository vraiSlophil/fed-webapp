describe('Shared - Pages de test', () => {
    it('permet de naviguer vers les pages de test depuis /tests', () => {
        cy.visit('/tests')

        cy.contains('Tests').should('be.visible')
        cy.contains('Page Playground').parent().within(() => {
            cy.contains('Playground').click()
        })
        cy.url().should('include', '/playground')

        cy.visit('/tests')
        cy.contains('Tests sur le composant').parent().within(() => {
            cy.contains('Themes').click()
        })
        cy.url().should('include', '/tests/themes')
    })
})

