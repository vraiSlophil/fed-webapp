describe("Playground - Menu", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche le menu du playground", () => {
    cy.visit("/playground/1");
    cy.get(".playground-menu").should("be.visible");
  });

  it("permet d'accéder aux paramètres du playground via le menu", () => {
    cy.visit("/playground/1");
    cy.get(".playground-menu").contains("Paramètres").click();
    cy.get(".playground-settings").should("be.visible");
  });

  it("permet d'ajouter un nouveau thème au playground via le menu", () => {
    cy.visit("/playground/1");
    cy.get(".playground-menu").contains("Ajouter un thème").click();

    cy.get('select[name="theme"]').select("Thème 1");
    cy.get('button[type="submit"]').click();

    cy.contains("Thème ajouté").should("be.visible");
  });
});

