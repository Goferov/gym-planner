function finishAllExercises() {
    cy.contains('button', 'Complete Exercise', { timeout: 20_000 })
        .scrollIntoView()
        .should('be.enabled')
        .click({ force: true });

    cy.get('body').then(($body) => {
        if (!$body.text().includes('Workout Complete!')) {
            finishAllExercises();
        }
    });
}

describe('Pełny przepływ treningu seniora', () => {
    const user = { email: 'senior@test.com', password: 'password' };

    before(() => {
        cy.apiLogin(user.email, user.password).then((token: string) => {
            cy.visit('/client', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('token', token);
                },
            });
        });
    });

    it('raportuje trudność pierwszego ćwiczenia, kończy trening i sprawdza podsumowanie', () => {
        cy.contains("Today's Training").should('be.visible');
        cy.contains("Start Today's Workout").click({ force: true });

        cy.clock();
        cy.tick(30_000);

        cy.contains('This Was Difficult').click({ force: true });
        cy.contains('button', 'Hard').click();
        cy.get('textarea').type('Left knee pain');
        cy.contains('Submit & Continue').click();

        finishAllExercises();

        cy.contains('Workout Complete!').should('be.visible');
        cy.contains('3/3 Exercises Completed').should('be.visible');
        cy.contains('100% of today').should('be.visible');

        cy.contains('Return to Home').click();
        cy.url().should('include', '/client');
    });
});