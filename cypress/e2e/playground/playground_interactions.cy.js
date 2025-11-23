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

        cy.get(".draggable-component").then(($startList) => {
            const startCount = $startList.length;

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

            cy.wait(500);
            cy.get("body").then(($body) => {
                if ($body.find("button[data-testid='theme-storage-toggle']").length) {
                    cy.get("button[data-testid='theme-storage-toggle']").click();
                } else if ($body.find(".theme-storage-button").length) {
                    cy.get(".theme-storage-button").click();
                } else if ($body.find(".theme-storage, [data-testid='theme-storage']").length) {
                    cy.get(".theme-storage, [data-testid='theme-storage']").first().within(() => {
                        cy.get("button").first().click();
                    });
                } else if ($body.find(".flex.justify-start.items-center").length) {
                    cy.get(".flex.justify-start.items-center").first().within(() => {
                        cy.get("button").first().click();
                    });
                } else {
                    cy.get("button").first().click();
                }
            });

            cy.wait(500);
            cy.get("body").then(($body) => {
                if ($body.find(".theme-storage-list, .stored-themes, [data-testid='theme-storage-list']").length) {
                    cy.get(".theme-storage-list, .stored-themes, [data-testid='theme-storage-list']").first().within(() => {
                        cy.get("button[title='Remettre sur le tableau']").first().click();
                    });
                } else if ($body.find(".theme-storage, [data-testid='theme-storage']").length) {
                    cy.get(".theme-storage, [data-testid='theme-storage']").first().within(() => {
                        cy.get("button[title='Remettre sur le tableau']").first().click();
                    });
                } else {
                    cy.get("button[title='Remettre sur le tableau']").first().click();
                }
            });

            cy.wait(500);

            cy.get(".draggable-component").its("length").should("eq", startCount);
        });
    });
});