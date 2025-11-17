describe("Playground - Navigation", () => {
  it("affiche la page /playground avec la grille et les thèmes", () => {
    cy.visit("/playground");
    cy.get("nav").should("be.visible");
  });

  it("affiche la page de test pour un playground spécifique via /playground/[id]", () => {
    cy.visit("/playground/test-id");
    cy.contains("TEST").should("be.visible");
  });
});
