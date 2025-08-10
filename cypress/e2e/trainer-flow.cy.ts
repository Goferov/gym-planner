describe('Trainer full workflow – registration, client, exercise, plan creation', () => {

    // Konfiguracja danych testowych...

    it('completes full trainer flow in one session', () => {

        // --- Rejestracja trenera ---
        cy.visit('/register')
        cy.get('#name').type(trainer.name)
        cy.get('#email').type(trainer.email)
        cy.get('#password').type(trainer.pass, { log: false })
        cy.get('#passwordConfirmation').type(trainer.pass, { log: false })
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/login')

        // --- Logowanie jako trener ---

        // --- Dodanie klienta ---
        cy.visit('/trainer/clients')
        cy.contains('button', 'Add Client').click()
        cy.url().should('include', '/trainer/clients/add')

        cy.get('#name').type(client.name)
        cy.get('#email').type(client.email)
        cy.get('#password').type(client.pass, { log: false })
        cy.get('#phone').type(client.phone)
        cy.get('#address').type(client.addr)
        cy.get('#notes').type(client.note)
        cy.get('button[type="submit"]').click()

        cy.url().should('include', '/trainer/clients')
        cy.contains(client.name).should('be.visible')

        // --- Dodanie ćwiczenia ---

        // --- Utworzenie planu ---
        cy.visit('/trainer/plans')
        cy.contains('button', 'Create Plan').click()
        cy.url().should('include', '/trainer/plans/add')

        cy.get('#name').type(planName)
        cy.get('#description').type(planDesc)

        // Przypisanie klienta do planu
        cy.contains('button', 'Manage Clients').click()
        cy.get('button[id^="client-"]', { timeout: 20000 })
            .first()
            .click({ force: true })
            .should('have.attr', 'aria-checked', 'true')
        cy.contains('button', 'Confirm Selection').click()

        // Dodanie ćwiczenia do dnia 1 / tygodnia 1
        cy.contains('Click to add exercises').click()
        cy.get('div[role="dialog"]')
            .find('div.flex.items-center.p-2')
            .first()
            .click()
        cy.contains(exercise.name)

        cy.contains('button', 'Save Plan').click()

        // --- Weryfikacja zapisania planu i obecności na liście ---
        cy.url().should('match', /\/trainer\/plans\/edit\/\d+$/)
        cy.contains('Saved!')

        cy.visit('/trainer/plans')
        cy.contains(planName).should('be.visible')
    })
})
