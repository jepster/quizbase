describe('Synchronous single player game', () => {
  it('Play the game', () => {
    cy.visit('http://172.17.30.97:9000/quiz/geschichte-im-mittelalter/low')
    cy.contains('Login')
        .parent()
        .find('button')
    cy.get('input')
        .type('sandra');
    cy.get('button').click()

    cy.get('input')
        .type('Peter');
    cy.get('button').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 1/10:').should('exist')
    cy.get('button').first().click()
  })
})