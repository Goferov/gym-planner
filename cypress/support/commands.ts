/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

/// <reference types="cypress" />

// Logowanie po API i zwrócenie tokenu
Cypress.Commands.add('apiLogin', (email: string, password: string) => {
    return cy
        .request('POST', `${Cypress.env('api')}/login`, { email, password })
        .its('body.token')
        .should('exist');
});

Cypress.Commands.add('loginByApi', (email, password) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('api')}/login`,
        body: { email, password }
    })
        .then(({ body }) => {
            expect(body).to.have.property('token')
            // zakładam, że Twój AuthContext trzyma token w localStorage pod kluczem 'token'
            window.localStorage.setItem('token', body.token)
        })
})