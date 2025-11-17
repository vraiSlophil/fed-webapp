describe("Thèmes - Gestion", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter en tant qu'admin
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche la liste des thèmes disponibles", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme-list").should("be.visible");
  });

  it("permet de créer un nouveau thème", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.contains("Nouveau thème").click();

    cy.get('input[name="name"]').type("Mon nouveau thème");
    cy.get('textarea[name="description"]').type("Description du thème");
    cy.get('button[type="submit"]').click();

    cy.contains("Mon nouveau thème").should("be.visible");
  });

  it("permet de modifier un thème existant", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().contains("Modifier").click();

    cy.get('input[name="name"]').clear().type("Thème modifié");
    cy.get('button[type="submit"]').click();

    cy.contains("Thème modifié").should("be.visible");
  });

  it("permet de supprimer un thème et met à jour la liste", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().contains("Supprimer").click();
    cy.contains("Confirmer").click();

    cy.contains("Thème supprimé").should("be.visible");
  });
});

