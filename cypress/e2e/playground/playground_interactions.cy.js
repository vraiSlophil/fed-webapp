describe("Playground - Interactions drag & drop", () => {
  it("permet de glisser un thème vers une zone de drop", () => {
    cy.visit("/playground");
    // Ces sélecteurs sont génériques, à adapter si besoin
    cy.get(".draggable").first().trigger("mousedown", { which: 1 });
    cy.get(".dropzone").first().trigger("mousemove").trigger("mouseup", { force: true });
  });
});

