import { loginAndVisit } from '../../support/loginHelper.js';
import { buildUniqueThemeName } from '../../support/stringUtils.js';

// Tests de gestion des thèmes via la page /playground (PlaygroundPage + Theme / TaskList)

describe('Thèmes - Gestion sur le playground', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();

        loginAndVisit({
            email: 'user@example.com',
            password: 'password',
            nextRoute: '/playground',
        });

        cy.wait(250);
    });

    it('permet de créer un nouveau thème avec un nom précis et de le retrouver', () => {
        cy.wait(250);

        const themeName = buildUniqueThemeName('Playground-Theme');

        // Ouvrir le menu contextuel du playground et choisir "Créer un thème"
        cy.get('body').rightclick(300, 300);
        cy.wait(250);

        cy.contains('Créer un thème').click({ force: true });
        cy.wait(250);

        // Remplir le formulaire de création de thème
        cy.get("input[placeholder='Titre du thème'], input[placeholder='Nom du thème']").type(
            themeName,
        );

        cy.wait(250);

        cy.contains('button', /Créer le thème|Créer/i).click({ force: true });

        cy.wait(250);

        // Vérifier le toast de succès
        cy.contains('Thème "').contains('créé avec succès.').should('be.visible');

        // Rechercher le thème par son titre et vérifier que les boutons sont accessibles via les parents
        cy.contains('span', themeName)
            .parents('div')
            .within(() => {
                cy.get("button[title='Ouvrir']").should('exist');
                cy.get("button[title='Modifier']").should('exist');
            });
    });

    it('affiche au moins un thème sur le playground', () => {
        cy.wait(250);

        // On se base sur le bouton Ouvrir qui est rendu par Theme.vue pour chaque thème
        cy.get("button[title='Ouvrir']").its('length').should('be.greaterThan', 0);
    });

    it("permet de modifier le titre d'un thème existant depuis le playground", () => {
        cy.wait(250);

        // Cibler le premier thème via son bouton Ouvrir
        cy.get("button[title='Ouvrir']").first().as('openThemeButton');

        cy.get('@openThemeButton').click({ force: true });
        cy.wait(250);

        // Depuis la barre du thème ouvert, cliquer sur Modifier
        cy.get("button[title='Modifier']").first().click({ force: true });
        cy.wait(250);

        // Règle clear + wait(500) + type sur l’input d’édition du titre
        cy.get("input[placeholder='Nom du thème']").clear();
        cy.wait(250);

        const newTitle = `Thème modifié ${Date.now()}`;

        cy.get("input[placeholder='Nom du thème']").type(newTitle);

        // Valider l’édition (Enter ou clic suivant implémentation)
        cy.get('body').type('{enter}');
        cy.wait(250);

        // Vérifier que le nouveau titre apparaît bien dans la barre de thème
        cy.contains('span', newTitle).should('be.visible');
    });

    it("permet de supprimer un thème si l'utilisateur est propriétaire", () => {
        cy.wait(250);

        // Ouvrir un thème d’abord pour que les boutons d’action soient visibles
        cy.get("button[title='Ouvrir']").first().click({ force: true });
        cy.wait(250);

        // Cliquer sur le bouton Supprimer dans la barre d’actions du thème
        cy.get("button[title='Supprimer']").first().click({ force: true });

        cy.wait(250);

        cy.contains('Confirmer la suppression').should('be.visible');
        cy.contains('button', 'Oui').click({ force: true });

        cy.wait(250);

        // Toast de succès attendu depuis Theme.vue / useThemes
        cy.contains('Thème').contains('supprimé avec succès.').should('be.visible');
    });
});
