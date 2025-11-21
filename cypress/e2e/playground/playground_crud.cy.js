// javascript
// cypress/e2e/playground/playground_crud.cy.js
import {loginAndVisit} from "../../support/loginHelper.js";

const generateRandomString = (length) => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const uniquePlaygroundName = `Playground-${generateRandomString(8)}`;
const uniquePlaygroundSlug = uniquePlaygroundName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const editedPlaygroundName = `Playground-Edited-${generateRandomString(8)}`;
const editedPlaygroundSlug = editedPlaygroundName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

describe("Playground - CRUD", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        loginAndVisit({
            email: "user@example.com",
            password: "password",
            nextRoute: "/playground",
        });

        // Debug: log le pathname réel
        cy.location("pathname", {timeout: 10000}).then((path) => {
            cy.log("Current path after loginAndVisit:", path);
        });

        // Vérifier qu'on n'est plus sur /login
        cy.location("pathname", {timeout: 10000}).should("not.eq", "/login");

        // Puis vérifier que la redirection vers /playground est bien faite
        cy.url({timeout: 10000}).should("include", "/playground");

        // s'assurer que la navbar / bouton playground sont rendus
        cy.get("button.playground-button").should("be.visible");
    });

    it("permet d'ouvrir la gestion des playgrounds", () => {
        cy.get("button.playground-button").click();
        cy.wait(100);
        cy.contains("Gestion des Playgrounds").should("be.visible");
    });

    it("permet de créer un nouveau playground", () => {
        cy.get("button.playground-button").click();
        cy.contains("Gestion des Playgrounds").should("be.visible");

        cy.get("button[title='Créer un nouveau Playground']").click();
        cy.contains("Créer un nouveau Playground").should("be.visible");

        cy.wait(100);

        cy.get("input[placeholder='Nom du playground']").type(uniquePlaygroundName);

        cy.wait(100);

        cy.get("input[placeholder='Slug du playground']")
            .should("have.value", uniquePlaygroundSlug);

        cy.get("input[placeholder='Icône du playground']").type("home");

        cy.contains("button", "Créer").click();

        cy.contains("Playground créé avec succès.").should("be.visible");
        // cy.contains("Gestion des Playgrounds").should("be.visible");

        cy.contains("span", uniquePlaygroundName).should("exist");
    });

    it("permet de modifier un playground existant", () => {
        cy.get("button.playground-button").click();
        cy.contains("Gestion des Playgrounds").should("be.visible");

        cy.contains("span", uniquePlaygroundName)
            .parents("div.flex.justify-between.items-center.flex-col")
            .within(() => {
                cy.get("button.edit-button").click();
            });

        cy.contains("Modifier le Playground").should("be.visible");

        cy.get("input[placeholder='Nom du playground']")
            .clear();

        cy.wait(100);

        cy.get("input[placeholder='Nom du playground']")
            .clear()
            .type(editedPlaygroundName);

        cy.get("input[placeholder='Slug du playground']")
            .should("have.value", editedPlaygroundSlug);

        cy.contains("button", "Mettre à jour").click();
        cy.contains("Playground mis à jour avec succès.").should("be.visible");

        cy.contains("span", editedPlaygroundName).should("exist");
    });

    it("permet de supprimer un playground", () => {
        cy.get("button.playground-button").click();
        cy.contains("Gestion des Playgrounds").should("be.visible");

        cy.contains("span", editedPlaygroundName)
            .parents("div.flex.justify-between.items-center.flex-col")
            .within(() => {
                cy.get("button[title='Supprimer le Playground']")
                    .not("[disabled]")
                    .click();
            });

        cy.contains("Confirmer la suppression du playground").should("be.visible");

        cy.contains("button", "Supprimer").click();

        cy.contains("Playground supprimé avec succès.").should("be.visible");

        cy.contains("span", editedPlaygroundName).should("not.exist");
    });
});