#!/bin/bash
# Script pour lancer des tests E2E spécifiques

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tests E2E Cypress ===${NC}"
echo ""

# Fonction d'aide
show_help() {
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  all              Lance tous les tests"
    echo "  auth             Lance les tests d'authentification"
    echo "  admin            Lance les tests admin"
    echo "  user             Lance les tests utilisateur"
    echo "  playground       Lance les tests playground"
    echo "  themes           Lance les tests thèmes"
    echo "  tasks            Lance les tests tâches"
    echo "  shared           Lance les tests composants partagés"
    echo "  open             Ouvre l'interface Cypress"
    echo "  help             Affiche cette aide"
    echo ""
}

# Si aucun argument
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# Traitement des arguments
case "$1" in
    all)
        echo -e "${GREEN}Lancement de tous les tests E2E...${NC}"
        npx cypress run
        ;;
    auth)
        echo -e "${GREEN}Lancement des tests d'authentification...${NC}"
        npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
        ;;
    admin)
        echo -e "${GREEN}Lancement des tests admin...${NC}"
        npx cypress run --spec "cypress/e2e/admin/**/*.cy.js"
        ;;
    user)
        echo -e "${GREEN}Lancement des tests utilisateur...${NC}"
        npx cypress run --spec "cypress/e2e/user/**/*.cy.js"
        ;;
    playground)
        echo -e "${GREEN}Lancement des tests playground...${NC}"
        npx cypress run --spec "cypress/e2e/playground/**/*.cy.js"
        ;;
    themes)
        echo -e "${GREEN}Lancement des tests thèmes...${NC}"
        npx cypress run --spec "cypress/e2e/themes/**/*.cy.js"
        ;;
    tasks)
        echo -e "${GREEN}Lancement des tests tâches...${NC}"
        npx cypress run --spec "cypress/e2e/tasks/**/*.cy.js"
        ;;
    shared)
        echo -e "${GREEN}Lancement des tests composants partagés...${NC}"
        npx cypress run --spec "cypress/e2e/shared/**/*.cy.js"
        ;;
    open)
        echo -e "${GREEN}Ouverture de l'interface Cypress...${NC}"
        npm run test:e2e
        ;;
    help)
        show_help
        ;;
    *)
        echo "Option invalide: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

