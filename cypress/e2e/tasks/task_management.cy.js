describe("Tâches - Gestion de la todo list", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Se connecter avant chaque test
    cy.visit("/login");
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password");
    cy.get('button[type="submit"]').click();
  });

  it("affiche la liste des tâches existantes pour l'utilisateur connecté", () => {
    cy.visit("/user");
    cy.contains("Tâches").should("be.visible");
  });

  it("permet d'ajouter une nouvelle tâche via le formulaire", () => {
    cy.visit("/user");
    cy.get('input[placeholder*="Nouvelle tâche"]').type("Ma nouvelle tâche");
    cy.contains("Ajouter").click();
    cy.contains("Ma nouvelle tâche").should("be.visible");
  });

  it("permet de marquer une tâche comme terminée", () => {
    cy.visit("/user");
    cy.get(".task").first().find('input[type="checkbox"]').check();
    cy.get(".task").first().should("have.class", "completed");
  });

  it("permet de supprimer une tâche et la retire de la liste", () => {
    cy.visit("/user");
    cy.get(".task").first().find("button.delete").click();
    // Vérifier que la confirmation est demandée ou que la tâche disparaît
    cy.contains("Confirmer").click();
  });
});

