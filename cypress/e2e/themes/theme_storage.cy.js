import {loginAndVisit} from "../../support/loginHelper.js";

// Tests de ThemeStorage via la page /playground (PlaygroundPage + ThemeStorage)

describe("Thèmes - Stockage via ThemeStorage sur le playground", () => {
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

    it("affiche le popover des thèmes rangés quand on ouvre ThemeStorage", () => {
        cy.wait(250);

        // Sur PlaygroundPage, ThemeStorage est dans la barre du haut (bouton inventory_2)
        cy.get("body").then(($body) => {
            if ($body.find("button[data-testid='theme-storage-toggle']").length) {
                cy.get("button[data-testid='theme-storage-toggle']").click();
            } else {
                cy.get("button").contains("inventory_2").click({force: true});
            }
        });

        cy.wait(250);

        cy.contains("Thèmes rangés").should("be.visible");
    });

    it("permet de remettre un thème rangé sur le tableau via le bouton + dans ThemeStorage", () => {
        cy.wait(250);

        // D'abord, on range un thème via le drag & drop vers la drop zone (déjà testé ailleurs, on refait rapidement ici)
        cy.get(".draggable-component").first().then(($el) => {
            const el = $el[0];
            const rect = el.getBoundingClientRect();
            const startClientX = Math.round(rect.left + rect.width / 2);
            const startClientY = Math.round(rect.top + rect.height / 2);

            cy.wrap($el).trigger("mousedown", {
                clientX: startClientX,
                clientY: startClientY,
                button: 0,
                which: 1,
                force: true,
            });

            cy.wait(250);

            cy.window().then((win) => {
                const targetX = Math.max(50, Math.round(win.innerWidth - 30));
                const targetY = startClientY;

                cy.get("body").trigger("mousemove", {
                    clientX: targetX,
                    clientY: targetY,
                    which: 1,
                    buttons: 1,
                    force: true,
                });

                cy.wait(250);

                cy.get("body").trigger("mouseup", {
                    clientX: targetX,
                    clientY: targetY,
                    force: true,
                });
            });
        });

        cy.wait(250);
        cy.contains("Thème rangé").should("be.visible");

        // Ouvrir ThemeStorage
        cy.wait(250);
        cy.get("body").then(($body) => {
            if ($body.find("button[data-testid='theme-storage-toggle']").length) {
                cy.get("button[data-testid='theme-storage-toggle']").click();
            } else if ($body.find(".theme-storage-button").length) {
                cy.get(".theme-storage-button").click();
            } else if ($body.find(".theme-storage, [data-testid='theme-storage']").length) {
                cy.get(".theme-storage, [data-testid='theme-storage']").first().within(() => {
                    cy.get("button").first().click();
                });
            } else {
                cy.get("button").contains("inventory_2").click({force: true});
            }
        });

        cy.wait(250);

        // Cliquer sur le bouton + "Remettre sur le tableau" dans le popover
        cy.get("body").then(($body) => {
            if ($body.find("button[title='Remettre sur le tableau']").length) {
                cy.get("button[title='Remettre sur le tableau']").first().click({force: true});
            }
        });

        cy.wait(250);

        // Toast de succès attendu depuis ThemeStorage.vue
        cy.contains("Thème restauré").should("be.visible");
    });
});
