import {loginAndVisit} from "../../support/loginHelper.js";

const newTaskTitle = `Ma nouvelle tâche ${Date.now()}`;

describe("Tâches - Gestion via TaskList sur le playground", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        loginAndVisit({
            email: "user@example.com", password: "password", nextRoute: "/playground",
        });

        cy.wait(250);
    });

    it("affiche la liste des tâches pour le thème ouvert", () => {
        cy.wait(250);

        // Ouvrir un thème pour que TaskList soit visible
        cy.get("button[title='Ouvrir']").first().click();
        cy.wait(250);

        // TaskList affiche soit des tâches, soit un message "Aucune tâche"; on vérifie que la zone existe
        cy.get("input[placeholder='Ajouter une nouvelle tâche...']").should("be.visible");
    });

    it("permet d'ajouter une nouvelle tâche via TaskList", () => {
        cy.wait(250);

        cy.get("button[title='Ouvrir']").first().click();
        cy.wait(250);

        cy.get("input[placeholder='Ajouter une nouvelle tâche...']")
            .type(newTaskTitle);

        cy.wait(250);

        cy.get("button[title='Créer une tâche']").click();

        cy.wait(250);

        cy.contains(newTaskTitle).should("be.visible");
    });

    it("permet de marquer une tâche comme terminée", () => {
        cy.wait(250);

        cy.get("button[title='Ouvrir']").first().click();
        cy.wait(250);

        // Si aucune tâche, on en crée une d’abord avec un titre connu
        cy.get("body").then(($body) => {
            if ($body.text().includes("Aucune tâche")) {
                cy.get("input[placeholder='Ajouter une nouvelle tâche...']").type(newTaskTitle);
                cy.wait(250);
                cy.get("button[title='Créer une tâche']").click();
                cy.wait(250);
            }
        });

        // On récupère la tâche par son titre, puis on clique sur le bouton "Marquer comme terminé"
        cy.contains("h3", newTaskTitle)
            .closest("div.p-4")
            .within(() => {
                cy.get("button").first().click(); // bouton de completion
            });

        cy.wait(250);

        cy.contains("h3", newTaskTitle)
            .closest("div.p-4")
            .within(() => {
                cy.get(".p-tag-label").should("not.contain", "À faire");
            });
    });

    it("permet de supprimer une tâche depuis TaskList", () => {
        cy.wait(250);

        cy.get("button[title='Ouvrir']").first().click();
        cy.wait(250);

        // Créer systématiquement une tâche à supprimer (plus simple et plus fiable)
        // cy.get("input[placeholder='Ajouter une nouvelle tâche...']").type(newTaskTitle);
        // cy.wait(250);
        // cy.get("button[title='Créer une tâche']").click();
        // cy.wait(250);

        // Cibler la tâche par son titre et cliquer sur le bouton Supprimer dans son conteneur .p-4
        cy.contains("h3", newTaskTitle)
            .closest("div.p-4")
            .within(() => {
                cy.get("button[title='Supprimer']").click();
            });

        cy.wait(250);

        // Si une boîte de dialogue de confirmation apparaît, confirmer
        cy.get("body").then(($body) => {
            if ($body.find("button:contains('Oui')").length) {
                cy.contains("button", "Oui").click();
            }
        });

        cy.wait(250);

        // Vérifier que la tâche n'est plus présente
        cy.contains("h3", newTaskTitle).should("not.exist");
    });
});
