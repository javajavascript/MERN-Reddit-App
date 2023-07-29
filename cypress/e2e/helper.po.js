export class Helper {
  getLastPost() {
    return cy.get('.post').last().find('div');
  }
}
