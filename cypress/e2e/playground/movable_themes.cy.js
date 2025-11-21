import {loginAndVisit} from "../../support/loginHelper.js";

describe("Playground - Thèmes déplaçables", () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        loginAndVisit({
            email: "user@example.com",
            password: "password",
            nextRoute: "/playground",
        });
    });

    it("affiche les thèmes déplaçables dans le playground", () => {
        cy.visit("/playground");
        cy.get(".draggable-component")
            .first()
            .should("have.attr", "data-theme-id");
    });

    // javascript
    it("permet de déplacer un thème et vérifie le delta via le `transform: translate(...)`", () => {
        cy.visit("/playground");
        const moveDeltaX = 50;
        const moveDeltaY = 80;

        function parseTranslate(transform) {
            if (!transform || transform === "none") return { x: 0, y: 0 };
            transform = transform.trim();

            if (transform.startsWith("matrix3d(")) {
                const vals = transform.slice(8, -1).split(",").map(v => parseFloat(v));
                return { x: vals[12] || 0, y: vals[13] || 0 };
            }
            if (transform.startsWith("matrix(")) {
                const vals = transform.slice(7, -1).split(",").map(v => parseFloat(v));
                return { x: vals[4] || 0, y: vals[5] || 0 };
            }
            // translate(...) or translate3d(...)
            const m = transform.match(/translate(?:3d)?\(\s*([-\d.]+)px(?:,\s*([-\d.]+)px)?/);
            if (m) {
                return { x: parseFloat(m[1]) || 0, y: parseFloat(m[2]) || 0 };
            }
            return { x: 0, y: 0 };
        }

        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };

        cy.get(".draggable-component").first().then(($el) => {
            const el = $el[0];
            const style = window.getComputedStyle(el);
            start = parseTranslate(style.transform);

            const rect = el.getBoundingClientRect();
            const startClientX = rect.left + rect.width / 2;
            const startClientY = rect.top + rect.height / 2;

            cy.wrap($el)
                .trigger("mousedown", {
                    clientX: startClientX,
                    clientY: startClientY,
                    button: 0,
                    which: 1,
                    force: true,
                });

            cy.get("body")
                .trigger("mousemove", {
                    clientX: startClientX + moveDeltaX,
                    clientY: startClientY + moveDeltaY,
                    which: 1,
                    buttons: 1,
                    force: true,
                })
                .trigger("mouseup", {
                    force: true,
                });
        });

        // laisser le temps au DOM / transition d'appliquer le transform si besoin
        cy.wait(100);

        cy.get(".draggable-component").first().then(($el2) => {
            const el2 = $el2[0];
            const style2 = window.getComputedStyle(el2);
            end = parseTranslate(style2.transform);

            // assertions
            expect(start.x).to.be.a("number");
            expect(start.y).to.be.a("number");
            expect(end.x).to.be.a("number");
            expect(end.y).to.be.a("number");

            expect(end.x - start.x).to.be.closeTo(moveDeltaX, 3);
            expect(end.y - start.y).to.be.closeTo(moveDeltaY, 3);
        });
    });
});