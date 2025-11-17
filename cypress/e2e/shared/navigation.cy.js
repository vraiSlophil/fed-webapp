describe("Navigation - Utilisateur authentifié", () => {
    const login = (email, password = "password") => {
        cy.visit("/login");
        cy.get('input[type="email"]').clear().type(email);
        cy.get('input[type="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    it("permet de se déconnecter depuis la navigation et redirige vers la page de connexion", () => {
        login("user@example.com");
        cy.get("nav").contains("Déconnexion").should("be.visible").click();
        cy.url().should("include", "/login");
    });

    it("affiche un lien vers l'espace admin pour un utilisateur administrateur connecté", () => {
        login("admin@example.com");
        cy.get("nav").contains("Administration").should("be.visible");
    });

    it("affiche un lien vers l'espace utilisateur pour un utilisateur standard connecté", () => {
        login("user@example.com");
        cy.get("nav").contains("Profil").should("be.visible");
    });

    it("affiche la navbar sur toutes les pages principales", () => {
        const pages = ["/", "/about", "/dashboard"];
        pages.forEach((p) => {
            cy.visit(p);
            cy.get("nav").should("be.visible");
        });
    });
});