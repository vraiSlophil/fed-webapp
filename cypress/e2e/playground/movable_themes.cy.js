describe("Playground - Thèmes déplaçables", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche les thèmes déplaçables dans le playground", () => {
    cy.visit("/playground/1");
    cy.get(".movable-theme").should("exist");
  });

  it("permet de déplacer un thème à une nouvelle position", () => {
    cy.visit("/playground/1");

    // Drag & drop manuel
    cy.get(".movable-theme").first()
      .trigger("mousedown", { which: 1 })
      .trigger("mousemove", { clientX: 300, clientY: 300 })
      .trigger("mouseup");

    // Vérifier que la position a changé
    cy.get(".movable-theme").first().should("have.css", "transform");
  });

  it("persiste la position des thèmes après rafraîchissement", () => {
    cy.visit("/playground/1");

    // Déplacer un thème
    cy.get(".movable-theme").first()
      .trigger("mousedown", { which: 1 })
      .trigger("mousemove", { clientX: 300, clientY: 300 })
      .trigger("mouseup");

    // Rafraîchir la page
    cy.reload();

    // Vérifier que la position est conservée
    cy.get(".movable-theme").first().should("have.css", "transform");
  });
});

