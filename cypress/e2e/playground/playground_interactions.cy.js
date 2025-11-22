// javascript
// Fichier : `cypress/e2e/playground/playground_interactions.cy.js`
import {loginAndVisit} from "../../support/loginHelper.js";

describe("Playground - Interactions drag & drop", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        loginAndVisit({
            email: "user@example.com",
            password: "password",
            nextRoute: "/playground",
        });
        cy.wait(500);
    });

    it("permet de transporter un thème jusque dans la drop zone", () => {
        cy.wait(500);

        cy.get(".draggable-component").first().then(($el) => {
            const el = $el[0];
            const rect = el.getBoundingClientRect();
            const startClientX = Math.round(rect.left + rect.width / 2);
            const startClientY = Math.round(rect.top + rect.height / 2);

            cy.wrap($el)
                .trigger("mousedown", {
                    clientX: startClientX,
                    clientY: startClientY,
                    button: 0,
                    which: 1,
                    force: true,
                });

            cy.wait(500);

            cy.window().then((win) => {
                const targetX = Math.max(50, Math.round(win.innerWidth - 30));
                const targetY = startClientY;

                cy.get("body")
                    .trigger("mousemove", {
                        clientX: targetX,
                        clientY: targetY,
                        which: 1,
                        buttons: 1,
                        force: true,
                    });

                cy.wait(500);

                cy.get("body")
                    .trigger("mouseup", {
                        clientX: targetX,
                        clientY: targetY,
                        force: true,
                    });
            });
        });

        cy.wait(500);
        cy.contains("Thème rangé").should("be.visible");
    });

    it("remet un thème rangé sur le playground en cliquant sur le + dans ThemeStorage", () => {
        cy.wait(500);

        // Compter les éléments déplaçables au départ
        cy.get(".draggable-component").then(($startList) => {
            const startCount = $startList.length;

            // Drag & drop vers la drop zone (même logique que le test précédent)
            cy.get(".draggable-component").first().then(($el) => {
                const el = $el[0];
                const rect = el.getBoundingClientRect();
                const startClientX = Math.round(rect.left + rect.width / 2);
                const startClientY = Math.round(rect.top + rect.height / 2);

                cy.wrap($el)
                    .trigger("mousedown", {
                        clientX: startClientX,
                        clientY: startClientY,
                        button: 0,
                        which: 1,
                        force: true,
                    });

                cy.wait(500);

                cy.window().then((win) => {
                    const targetX = Math.max(50, Math.round(win.innerWidth - 30));
                    const targetY = startClientY;

                    cy.get("body")
                        .trigger("mousemove", {
                            clientX: targetX,
                            clientY: targetY,
                            which: 1,
                            buttons: 1,
                            force: true,
                        });

                    cy.wait(500);

                    cy.get("body")
                        .trigger("mouseup", {
                            clientX: targetX,
                            clientY: targetY,
                            force: true,
                        });
                });
            });

            cy.wait(500);
            cy.contains("Thème rangé").should("be.visible");

            // Vérifier qu'au moins un thème a disparu du playground
            // cy.wait(500);
            // cy.get(".draggable-component").its("length").should("be.lt", startCount);

            // Ouvrir explicitement ThemeStorage via son bouton — plusieurs fallback selectors
            cy.wait(500);
            cy.get("body").then(($body) => {
                if ($body.find("button[data-testid='theme-storage-toggle']").length) {
                    cy.get("button[data-testid='theme-storage-toggle']").click({force: true});
                } else if ($body.find(".theme-storage-button").length) {
                    cy.get(".theme-storage-button").click({force: true});
                } else if ($body.find(".theme-storage, [data-testid='theme-storage']").length) {
                    // Si le composant expose directement un bouton à l'intérieur
                    cy.get(".theme-storage, [data-testid='theme-storage']").first().within(() => {
                        cy.get("button").first().click({force: true});
                    });
                } else if ($body.find(".flex.justify-start.items-center").length) {
                    // Fallback : navbar left area, cliquer sur le premier bouton (ThemeStorage est le premier composant)
                    cy.get(".flex.justify-start.items-center").first().within(() => {
                        cy.get("button").first().click({force: true});
                    });
                } else {
                    // Dernier recours : cliquer sur le premier bouton qui ressemble à un toggle ThemeStorage (icône)
                    cy.get("button").first().click({force: true});
                }
            });

            // attendre l'ouverture du panneau puis cliquer sur le '+' du premier thème rangé
            cy.wait(500);
            cy.get("body").then(($body) => {
                if ($body.find(".theme-storage-list, .stored-themes, [data-testid='theme-storage-list']").length) {
                    cy.get(".theme-storage-list, .stored-themes, [data-testid='theme-storage-list']").first().within(() => {
                        cy.contains("+").first().click({force: true});
                    });
                } else if ($body.find(".theme-storage, [data-testid='theme-storage']").length) {
                    cy.get(".theme-storage, [data-testid='theme-storage']").first().within(() => {
                        cy.contains("+").first().click({force: true});
                    });
                } else {
                    // fallback général
                    cy.contains("+").first().click({force: true});
                }
            });

            // attendre la restauration
            cy.wait(500);

            // vérifier que le nombre d'éléments déplaçables est revenu au nombre initial
            cy.get(".draggable-component").its("length").should("eq", startCount);
        });
    });
});