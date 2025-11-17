describe("Composants partagés - Texte animé", () => {
  it("affiche correctement le composant TypewriterText sur la page d'accueil", () => {
    cy.visit("/");
    // Vérifier que l'élément est présent
    cy.get(".typewriter").should("exist");
  });

  it("anime progressivement le texte", () => {
    cy.visit("/");
    // Attendre que l'animation soit terminée
    cy.wait(3000);
    cy.get(".typewriter").should("not.be.empty");
  });
});

