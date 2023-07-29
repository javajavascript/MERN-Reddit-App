// To run the tests, run the following:
// npx cypress open

// Use vanilla JS query selectors!
// Inspect element to see the DOM, there are no custom React elements!
// Everything is a plain HTML element!

//cy.reload() is a cheap way to test if server was updated
//because if the client reloads and remains updated, then
//that means the server was updated because client gets data from server
//HOWEVER, that means the client has to call the server on every page reload
//this will not work if we use caching or other page loading methods that do not involve the server

//THIS IS THE DATA FOR THIS TEST SET (from localhost:4000)
// [{"_id":"63635cb9e88914b5a17c04f5","name":"b","text":"a","dateTime":"11/3/2022 2:16:24 AM","__v":0},
// {"_id":"63635cbae88914b5a17c04f7","name":"b","text":"ab","dateTime":"11/3/2022 2:16:26 AM","__v":0},
// {"_id":"63635cbbe88914b5a17c04f9","name":"b","text":"abc","dateTime":"11/3/2022 2:16:27 AM","__v":0},
// {"_id":"64bf59436637e1f4a9231ffd","name":"Guest","text":"Automated by Cypress","dateTime":"7/25/2023 1:10:27 AM","__v":0},
// {"_id":"64bf597b6637e1f4a923201e","name":"Guest","text":"Added by Cypress","dateTime":"7/26/2023 12:18:05 AM","__v":0}]

//every test case should return the state of the app back to normal
//the dom/app should be the same after the test cases are done running

//the test cases should be the minimum combination of actions that can represent all combinations of actions
//for example, if I have a test case for (add, delete) and (add, edit, delete), then I know that (add, delete, add, edit, delete) will work

//need an algorithm that can take in all actions (add, edit, delete, search, sort) and then produce outputs of various combinations and lengths
//then see if test cases can cover them all
//HOWEVER, if the algorithm generates an add, it must be followed by a delete (like the stack brackets problem), and if it generates a delete, it must be preceded by add

//should there be 3 databases?
//one that gets pulled to the client (excluding deleted posts)
//one that ONLY stores deleted posts
//one that stores all posts (including deleted and marks it as a property such as deleted: true or deleted: false)

//look into google geolocation api

// import { Helper } from './helper.po';
// const helper = new Helper();

const client = 'http://localhost:3000/'
const startLength = 5;
const startLengthAdd = startLength+1;

// Helper function
function getLastPost() {
  return cy.get('.post').last().find('div');
}

// Adds a post with the text "Added by Cypress"
function cypressAdd() {
  cy.get('#enterPost').type('Added by Cypress');
  cy.get('#addButton').click();
  cy.get('.posts').find('.post').should('have.length', startLengthAdd); // check if client is correct
  cy.reload(); // reload to force update from server
  cy.get('.posts').find('.post').should('have.length', startLengthAdd); // check if server is correct
}

// Deletes the last post
function cypressDelete() {
  cy.get('.post').last().find('div').last().find('.delete').click(); // cy.get('.delete').last().click();
  cy.get('.post').last().find('div').last().find('.confirmDelete').click(); // cy.get('.confirmDelete').last().click();
  cy.get('.posts').find('.post').should('have.length', startLength); // check if client is correct
  cy.reload(); // reload to force update from server
  cy.get('.posts').find('.post').should('have.length', startLength); // check if server is correct
}

// Changes the last post from "Added by Cypress" to "Changed by Cypress"
function cypressEdit() {
  getLastPost().find('span').should('have.text', 'Added by Cypress')
  getLastPost().find('.edit').click();
  getLastPost().find('.editInput').clear();
  getLastPost().find('.editInput').type('Changed by Cypress');
  getLastPost().find('.confirmEdit').click();
  getLastPost().find('span').should('have.text', 'Changed by Cypress') // check if client is correct
  cy.reload(); // reload to force update from server
  getLastPost().find('span').should('have.text', 'Changed by Cypress') // check if server is correct
}

// Changes the last post from "Changed by Cypress" to "Added by Cypress" 
function cypressEditRevert() {
  getLastPost().find('span').should('have.text', 'Changed by Cypress')
  getLastPost().find('.edit').click();
  getLastPost().find('.editInput').clear();
  getLastPost().find('.editInput').type('Added by Cypress');
  getLastPost().find('.confirmEdit').click();
  getLastPost().find('span').should('have.text', 'Added by Cypress') // check if client is correct
  cy.reload(); // reload to force update from server
  getLastPost().find('span').should('have.text', 'Added by Cypress') // check if server is correct
}

// Searches the page with {text} and checks if the number of posts = {length}
function cypressSearch(text, length) {
  cy.get('#search').type(text);
  cy.get('.posts').find('.post').should('have.length', length);
}

// Searches the page with empty string and checks if the number of posts = {length}
function cypressSearchClear(length=startLength) {
  cy.get('#search').clear();
  cy.get('.posts').find('.post').should('have.length', length);
}

describe('search', () => {
  before(() => {
    cy.visit(client);
  });

  it('should search', () => {
    cy.get('#continueAsGuest').click();
    cypressSearch('Added by', 1);
    cypressSearchClear();
  })
})

describe('search fail', () => {
  before(() => {
    cy.visit(client);
  });

  it('should NOT search', () => {
    cy.get('#continueAsGuest').click();
    cypressSearchClear();
  })
})

describe('add fail', () => {
  before(() => {
    cy.visit(client);
  });

  it('should NOT add', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    cy.get('#enterPost').clear();
    cy.get('#addButton').click();
    // ADD: add a post
    cy.get('.posts').find('.post').should('have.length', startLength); // check if client is correct
  })
}) 

describe('delete fail', () => {
  before(() => {
    cy.visit(client);
  });

  it('should NOT delete', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    cy.get('.post').last().find('div').last().find('.delete').click();
    cy.get('.post').last().find('div').last().find('.cancelDelete').click();
    // END: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
  })
})

describe('edit fail', () => {
  before(() => {
    cy.visit(client);
  });

  it('should NOT edit', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    cy.get('.post').last().find('div').find('.edit').click();
    cy.get('.post').last().find('div').find('.cancelEdit').click();
    // END: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
  })
})

describe('edit', () => {
  before(() => {
    cy.visit(client);
  });

  it('should edit', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // EDIT: new text
    cypressEdit();
    cypressEditRevert();
    // END: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
  })
})

describe('edit, search', () => {
  before(() => {
    cy.visit(client);
  });

  it('should edit, search', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // EDIT: new text
    cypressEdit();
    // changed the only "Added by" to "Changed by", should find nothing
    cypressSearch('Added by', 0);
    // must clear input to show all results or else cypressEditRevert() won't a post with "Changed By"
    cypressSearchClear();
    // END: original text
    cypressEditRevert();
    // revert change so we should find 1
    cypressSearch('Added by', 1);
    cypressSearchClear();
  })
})

describe('add, delete', () => {
  before(() => {
    cy.visit(client);
  });

  it('should add, delete', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // ADD: add a post
    cypressAdd();
    cypressSearch
    // END: delete post, return to original number of posts
    cypressDelete();
  })
})

describe('add, search, delete, search', () => {
  before(() => {
    cy.visit(client);
  });

  it('should add, search, delete, search', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // ADD: add a post
    cypressAdd();
    // added another post with "Added by", should find 2
    cypressSearch('Added by', 2);
    // END: delete post, return to original number of posts
    cypressDelete();
    // revert change so we should find 1
    cypressSearch('Added by', 1);
    cypressSearchClear();
  })
})

describe('add, edit, delete', () => {
  before(() => {
    cy.visit(client);
  });

  it('should add, edit, delete', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // ADD: add a post
    cypressAdd();
    // CHANGE: new text
    cypressEdit();
    // END: original text
    cypressEditRevert();
    cypressDelete();
    // END: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
  })
})

describe('add, search, edit, search, delete, search', () => {
  before(() => {
    cy.visit(client);
  });

  it('should add, search, edit, search, delete, search', () => {
    cy.get('#continueAsGuest').click();
    // START: original number of posts
    cy.get('.posts').find('.post').should('have.length', startLength);
    // ADD: add a post
    cypressAdd();
    // added another post with "Added by", should find 2
    cypressSearch('Added by', 2);
    // CHANGE: new text
    cypressEdit();
    // changed one "Added by" to "Changed by", should find 1
    cypressSearch('Added by', 1);
    // must clear input to show all results or else cypressEditRevert() won't a post with "Changed By"
    cypressSearchClear(6);
    cypressEditRevert();
    // revert change so we should find 2
    cypressSearch('Added by', 2);
    cypressDelete();
    // revert change so we should find 1
    cypressSearch('Added by', 1);
    // END: original number of posts
    cypressSearchClear();
    cy.get('.posts').find('.post').should('have.length', startLength);
  })
})

//LESSONS LEARNED
//do not try to remove the element by calling cypress.remove()
//we already have a button to remove the element, so just simulate the user interaction!

//to get an element within an element, you CANNOT stack .get()
//if you do cy.get('post').last().get('button'), it only executes the last get(), so it only gets button while igorning the last post
//instead, use .find() to find an element within an element

// https://stackoverflow.com/questions/62785153/how-to-access-react-components-for-cypress
// https://glebbahmutov.com/blog/react-state-from-e2e-tests/
// https://github.com/gregfenton/example-cypress-react-selector-formik/blob/master/cypress/integration/form_spec.js
// https://stackoverflow.com/questions/46850694/in-cypress-how-to-count-a-selection-of-items-and-get-the-length
// https://stackoverflow.com/questions/65478186/how-to-click-on-the-next-element-using-the-first-and-last-function-in-cypres
// https://stackoverflow.com/questions/56247354/cypress-select-element-within-another-element-selector-syntax-shortcut-for
// https://stackoverflow.com/questions/52430983/how-do-you-check-the-equality-of-the-inner-text-of-a-element-using-cypress
// https://stackoverflow.com/questions/74887371/asserting-in-cypress-assert-expected-span-text-xogo-grey-light-ml-2-to-have
// https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-get-an-elements-text-contents