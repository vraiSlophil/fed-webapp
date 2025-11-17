describe("Playground - CRUD", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("permet de créer un nouveau playground", () => {
    cy.visit("/playground");
    cy.contains("Nouveau playground").click();

    cy.get('input[name="name"]').type("Mon playground");
    cy.get('textarea[name="description"]').type("Description du playground");
    cy.get('button[type="submit"]').click();

    cy.contains("Mon playground").should("be.visible");
  });

  it("permet de modifier un playground existant", () => {
    cy.visit("/playground");
    cy.get(".playground").first().contains("Modifier").click();

    cy.get('input[name="name"]').clear().type("Playground modifié");
    cy.get('button[type="submit"]').click();

    cy.contains("Playground modifié").should("be.visible");
  });

  it("permet de supprimer un playground", () => {
    cy.visit("/playground");
    cy.get(".playground").first().contains("Supprimer").click();
    cy.contains("Confirmer").click();

    cy.contains("Playground supprimé").should("be.visible");
  });

  it("gère le cas d'un playground inexistant", () => {
    cy.visit("/playground/999999");
    cy.contains("Playground introuvable").should("be.visible");
  });
});

