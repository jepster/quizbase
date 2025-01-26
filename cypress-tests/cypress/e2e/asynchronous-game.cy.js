describe('Synchronous single player game', () => {
  it('Join by link', () => {
    cy.visit('http://172.17.30.97:9000/quiz/geschichte-im-mittelalter/low');
    cy.contains('Login')
        .parent()
        .find('button')
    cy.get('input')
        .type('sandra');
    cy.get('button').click()

    cy.contains('a', 'Zur Startseite').should('exist')
    cy.get('input')
        .type('Peter');
    cy.get('button').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 1/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 2/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 3/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 4/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 5/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()
    cy.contains('a', 'Zur Startseite').should('exist')

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 6/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 7/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 8/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 9/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h3', '(leicht)').should('exist')
    cy.contains('h2', 'Frage 10/10:').should('exist')
    cy.get('button').first().click()
    cy.contains('button', 'Nächste Frage').click()

    cy.contains('h2', 'Spielergebnis').should('exist')
    cy.contains('p', 'Dein Endergebnis:').should('exist')
    cy.contains('h3', 'Bestenliste').should('exist')
    cy.contains('ul li', 'Peter').should('exist')
    cy.contains('ul li', 'Punkte').should('exist')
    cy.contains('a', 'Zur Startseite').should('exist')
    cy.contains('button', 'Neues Spiel starten').click()

    cy.contains('a', 'Zur Startseite').should('exist')
    cy.contains('h2', 'Spiel starten').should('exist')
  })

  // it('Select quiz', () => {
  //   cy.visit('http://172.17.30.97:9000')
  //   cy.contains('Login')
  //       .parent()
  //       .find('button')
  //   cy.get('input')
  //       .type('sandra');
  //   cy.get('button').click()
  //
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //   cy.contains('button', 'Geschichte im Mittelalter').should('exist')
  //   cy.contains('button', 'Geschichte im Mittelalter').click()
  //
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //   cy.contains('button', 'Leicht').click()
  //
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //   cy.get('input')
  //       .type('Peter');
  //   cy.get('button').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 1/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 2/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 3/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 4/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 5/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 6/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 7/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 8/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 9/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h3', '(leicht)').should('exist')
  //   cy.contains('h2', 'Frage 10/10:').should('exist')
  //   cy.get('button').first().click()
  //   cy.contains('button', 'Nächste Frage').click()
  //
  //   cy.contains('h2', 'Spielergebnis').should('exist')
  //   cy.contains('p', 'Dein Endergebnis:').should('exist')
  //   cy.contains('h3', 'Bestenliste').should('exist')
  //   cy.contains('ul li', 'Peter').should('exist')
  //   cy.contains('ul li', 'Punkte').should('exist')
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //   cy.contains('button', 'Neues Spiel starten').click()
  //
  //   cy.contains('a', 'Zur Startseite').should('exist')
  //   cy.contains('h2', 'Spiel starten').should('exist')
  // })
})