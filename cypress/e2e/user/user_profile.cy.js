describe("Espace utilisateur - Profil", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche les informations du profil utilisateur", () => {
    cy.visit("/user");
    cy.contains("Profil").should("be.visible");
    cy.contains("user@example.com").should("be.visible");
  });

  it("permet de modifier les informations du profil", () => {
    cy.visit("/user");
    cy.contains("Modifier le profil").click();

    cy.get('input[name="name"]').clear().type("Nouveau nom");
    cy.get('button[type="submit"]').click();

    cy.contains("Profil modifié").should("be.visible");
    cy.contains("Nouveau nom").should("be.visible");
  });

  it("permet de changer le mot de passe", () => {
    cy.visit("/user");
    cy.contains("Changer le mot de passe").click();

    cy.get('input[name="current_password"]').type("password");
    cy.get('input[name="new_password"]').type("newpassword123");
    cy.get('input[name="confirm_password"]').type("newpassword123");
    cy.get('button[type="submit"]').click();

    cy.contains("Mot de passe modifié").should("be.visible");
  });
});

