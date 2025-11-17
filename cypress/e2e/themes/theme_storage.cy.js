describe("Thèmes - Stockage et statistiques", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter en tant qu'admin
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche les statistiques d'utilisation d'un thème", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().click();
    cy.contains("Statistiques").click();

    cy.get(".theme-stats").should("be.visible");
    cy.contains("Utilisation").should("be.visible");
  });

  it("affiche les informations de stockage d'un thème", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().click();
    cy.contains("Stockage").click();

    cy.get(".theme-storage").should("be.visible");
  });
});

