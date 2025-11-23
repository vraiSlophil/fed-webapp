import {loginAndVisit} from "../../support/loginHelper.js";

// Tests des membres/permissions d’un thème via ThemeMembersMenu sur la page /playground

describe("Thèmes - Membres et permissions sur le playground", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        loginAndVisit({
            email: "user@example.com",
            password: "password",
            nextRoute: "/playground",
        });

        cy.wait(250);
    });

    it("affiche les membres d'un thème dans le menu des membres", () => {
        cy.wait(250);

        // Ouvrir un thème pour avoir accès aux boutons d’actions
        cy.get("button[title='Ouvrir']").first().click({force: true});
        cy.wait(250);

        // Ouvrir le menu des membres via le bouton Partager
        cy.get("button[title='Partager']").first().click({force: true});
        cy.wait(250);

        // Le composant LazyThemeMembersMenu devrait être visible (on utilise un sélecteur générique sur le dialog/menu)
        cy.contains("Inviter des membres").should("be.visible");
    });

    it("permet d'ajouter un membre à un thème avec un rôle spécifique", () => {
        cy.wait(250);

        cy.get("button[title='Ouvrir']").first().click({force: true});
        cy.wait(250);

        cy.get("button[title='Partager']").first().click({force: true});
        cy.wait(250);

        // Onglet ou section d’ajout
        cy.contains("Ajouter un membre").click({force: true});
        cy.wait(250);

        cy.get("input[placeholder*='Rechercher un utilisateur'], input[name='email']")
            .type("newmember@example.com");

        cy.wait(250);

        cy.get("[data-testid='user-search-result'], .user-search-result")
            .first()
            .click({force: true});

        cy.contains("Continuer").click({force: true});
        cy.wait(250);

        cy.contains(/Éditeur|Editeur/i).click({force: true});
        cy.contains("Confirmer").click({force: true});

        cy.wait(250);

        cy.contains("newmember@example.com").should("be.visible");
    });

    it("permet de modifier les permissions d'un membre via l'éditeur de permissions", () => {
        cy.wait(250);

        cy.get("button[title='Ouvrir']").first().click({force: true});
        cy.wait(250);

        cy.get("button[title='Partager']").first().click({force: true});
        cy.wait(250);

        // Ouvrir l’éditeur de permissions pour le premier membre
        cy.get("[data-testid='theme-member-row'], .member").first().within(() => {
            cy.contains(/Modifier|Permissions/i).click({force: true});
        });

        cy.wait(250);

        cy.get("input[type='checkbox'][name*='can_edit']").check({force: true});
        cy.get("input[type='checkbox'][name*='can_delete']").uncheck({force: true});

        cy.contains("Enregistrer").click({force: true});

        cy.wait(250);

        cy.contains(/Permissions mises à jour|Permissions modifiées/i).should("be.visible");
    });
});
