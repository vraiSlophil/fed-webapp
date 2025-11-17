describe("Thèmes - Membres et permissions", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter en tant qu'admin
    cy.visit("/login");
    cy.get('input[type="email"]').type("admin@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche les membres d'un thème dans le menu des membres", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().click();
    cy.contains("Membres").click();

    cy.get(".theme-members-menu").should("be.visible");
  });

  it("permet d'ajouter un membre à un thème avec un rôle spécifique", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().click();
    cy.contains("Membres").click();

    cy.contains("Ajouter un membre").click();
    cy.get('input[name="email"]').type("newmember@example.com");
    cy.get('select[name="role"]').select("Éditeur");
    cy.get('button[type="submit"]').click();

    cy.contains("newmember@example.com").should("be.visible");
  });

  it("permet de modifier les permissions d'un membre via l'éditeur de permissions", () => {
    cy.visit("/admin");
    cy.contains("Thèmes").click();
    cy.get(".theme").first().click();
    cy.contains("Membres").click();

    cy.get(".member").first().contains("Modifier").click();
    cy.get('input[type="checkbox"][name="can_edit"]').check();
    cy.get('input[type="checkbox"][name="can_delete"]').uncheck();
    cy.get('button[type="submit"]').click();

    cy.contains("Permissions modifiées").should("be.visible");
  });

  it("empêche un utilisateur sans droits adéquats de modifier les permissions", () => {
    // Se déconnecter et se reconnecter en tant qu'utilisateur standard
    cy.contains("Déconnexion").click();
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();

    // Essayer d'accéder aux permissions d'un thème
    cy.visit("/themes/1/members");
    cy.contains("Accès refusé").should("be.visible");
  });
});

