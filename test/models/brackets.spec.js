import {expect} from 'chai';
import {describe} from 'mocha';

import knex from '../../db/knex';
import Brackets from '../../models/brackets';

// Test comparator values are created in `test/sample-seeds` file.
const DEFAULT_TITLE = 'Custom Bracket';
const BRACKET_1_TITLE = DEFAULT_TITLE;
const BRACKET_2_TITLE = 'Default Bracket';
const USER_1_FB_ID = '1';
const USER_2_FB_ID = '2';

describe('Bracket', () => {
  beforeEach((done) => {
    knex.migrate.latest()
      .then(() => {
        knex.seed.run().then(() => done());
      });
  });

  afterEach((done) => {
    knex.migrate.rollback().then(() => done());
  });

  describe('addUser', () => {
    it('adds a new User to the Bracket', (done) => {
      Brackets.getAllUsers(3)
        .then((users) => {
          expect(users).to.have.length(2);
          expect(users[0].fbId).to.not.equal('1');

          return Brackets.addUser(3, 1);
        })
        .then((usersBracket) => {
          expect(usersBracket).to.have.property('owner');
          expect(usersBracket).to.have.property('bracketId');
          expect(usersBracket.bracketId).to.equal(3);
          expect(usersBracket.owner).to.equal(false);

          return Brackets.getAllUsers(3);
        })
        .then((users) => {
          expect(users).to.have.length(3);

          const newUser = users.find((user) => user.fbId === '1');

          expect(newUser).to.exist;
          expect(newUser).to.be.an('object');
          done();
        });
    });
  });

  describe('create', () => {
    it('creates a new Bracket with the given title', (done) => {
      const newBracketTitle = 'My New Bracket';
      Brackets.create(newBracketTitle)
        .then((bracket) => {
          expect(bracket).to.be.an('object');
          expect(bracket).to.have.property('title');
          expect(bracket.title).to.equal(newBracketTitle);
          done();
        });
    });

    it('creates a Bracket with default title if no title is given', (done) => {
      Brackets.create()
        .then((bracket) => {
          expect(bracket).to.be.an('object');
          expect(bracket).to.have.property('title');
          expect(bracket.title).to.equal(DEFAULT_TITLE);
          done();
        });
    });
  });

  describe('get', () => {
    it('returns the requested Bracket', (done) => {
      Brackets.get(1)
        .then((bracket) => {
          expect(bracket).to.be.an('object');
          expect(bracket).to.have.property('title');
          expect(bracket.title).to.equal(BRACKET_1_TITLE);
          done();
        });
    });

    it('returns Undefined when requested Bracket does not exist', (done) => {
      Brackets.get(6)
        .then((bracket) => {
          expect(bracket).to.be.an('undefined');
          done();
        });
    });
  });

  describe('getAll', () => {
    it('returns an Array of all Brackets', (done) => {
      Brackets.getAll()
        .then((bracket) => {
          expect(bracket).to.have.lengthOf(3);
          expect(bracket[0]).to.be.an('object');
          expect(bracket[0]).to.have.property('title');
          done();
        });
    });
  });

  describe('getAllMembers', () => {
    it('returns an Array of all Members for a Bracket', (done) => {
      Brackets.getAllMembers(1)
        .then((members) => {
          expect(members).to.have.lengthOf(3);
          expect(members[0]).to.be.an('object');
          expect(members[0]).to.have.property('name');
          expect(members[0]).to.have.property('bracketId');
          expect(members[0]).to.have.property('ownerFbId');
          expect(members[0]).to.have.property('completerFbId');
          done();
        });
    });

    it('returns an empty Array when there are no Members/Bracket', (done) => {
      Brackets.getAllMembers(6)
        .then((members) => {
          expect(members).to.have.lengthOf(0);
          expect(members).to.be.an('array');
          done();
        });
    });
  });

  describe('getAllUsers', () => {
    it('returns an Array of all Users of a Bracket', (done) => {
      Brackets.getAllUsers(1)
        .then((users) => {
          expect(users).to.have.lengthOf(3);
          expect(users[0]).to.be.an('object');
          expect(users[0]).to.have.property('fbId');
          done();
        });
    });

    it('returns an empty Array when there are no Users/Bracket', (done) => {
      Brackets.getAllUsers(1)
        .then((users) => {
          expect(users).to.have.lengthOf(3);
          expect(users[0]).to.be.an('object');
          expect(users[0]).to.have.property('fbId');
          done();
        });
    });
  });

  describe('getForUser', () => {
    it("returns a User's owned Brackets", (done) => {
      Brackets.getForUser(1)
        .then((brackets) => {
          expect(brackets).to.be.an('array');
          expect(brackets).to.have.length(2);
          expect(brackets[0]).to.have.property('id');
          expect(brackets[0]).to.have.property('title');
          expect(brackets[0].id).to.equal(1);
          expect(brackets[0].title).to.equal(BRACKET_1_TITLE);
          done();
        });
    });
  });

  describe('getOwnedForUser', () => {
    it("returns a User's owned Brackets", (done) => {
      Brackets.getOwnedForUser(1)
        .then((brackets) => {
          expect(brackets).to.be.an('array');
          expect(brackets).to.have.length(1);
          expect(brackets[0]).to.have.property('id');
          expect(brackets[0]).to.have.property('title');
          expect(brackets[0].id).to.equal(1);
          expect(brackets[0].title).to.equal(BRACKET_1_TITLE);
          done();
        });
    });
  });

  describe('getSharedToUser', () => {
    it("returns a User's shared, unowned Brackets", (done) => {
      Brackets.getSharedToUser(1)
        .then((brackets) => {
          expect(brackets).to.be.an('array');
          expect(brackets).to.have.length(1);
          expect(brackets[0]).to.have.property('id');
          expect(brackets[0]).to.have.property('title');
          expect(brackets[0].id).to.equal(2);
          expect(brackets[0].title).to.equal(BRACKET_2_TITLE);
          done();
        });
    });
  });

  describe('getWithUsers', () => {
    it('returns a bracket with an array of subscriberIds', (done) => {
      Brackets.getWithUsers(1)
        .then((bracket) => {
          expect(bracket).to.be.an('object');
          expect(bracket).to.have.property('subscriberIds');
          expect(bracket.subscriberIds).to.have.length(3);
          expect(bracket.subscriberIds[0]).to.equal('1');
          done();
        });
    });
  });

  describe('getOwner', () => {
    it('returns the User object for the owner of the given Bracket', (done) => {
      Promise.all([
        Brackets.getOwner(1),
        Brackets.getOwner(2),
        Brackets.getOwner(3),
      ]).then((owners) => {
        expect(owners[0]).to.be.an('object');
        expect(owners[0]).to.be.have.property('fbId');
        expect(owners[0].fbId).to.equal(USER_1_FB_ID);
        expect(owners[1].fbId).to.equal(USER_2_FB_ID);
        expect(owners[2].fbId).to.equal(USER_2_FB_ID);
        done();
      });
    });

    it('returns Undefined if there is no owner for given Bracket', (done) => {
      Brackets.getOwner(4)
        .then((user) => {
          expect(user).to.be.an('undefined');
          done();
        });
    });
  });

  describe('setOwner', () => {
    it('sets a User as the owner of a bracket', (done) => {
      Brackets.create('My Ownerless Bracket')
        .then((bracket) => {
          return Brackets.setOwner(bracket.id, 1);
        })
        .then((usersBracket) => {
          expect(usersBracket).to.have.property('owner');
          expect(usersBracket.owner).to.equal(true);
          done();
        });
    });

    it('resets the existing Bracket Owner, if there is one', (done) => {
      knex('users_brackets')
        .where({bracket_id: 1, user_fb_id: 1}) // eslint-disable-line camelcase
        .first()
        .then((usersBracket) => {
          expect(usersBracket.owner).to.equal(true);
        }).then(() =>
          Brackets.setOwner(1, 3))
        .then((usersBracket) => {
          expect(usersBracket).to.have.property('owner');
          expect(usersBracket.owner).to.equal(true);

          knex('users_brackets')
            // eslint-disable-next-line camelcase
            .where({bracket_id: 1, user_fb_id: 1})
            .first()
            .then((usersBracket) => {
              expect(usersBracket.owner).to.equal(false);
              done();
            });
        });
    });
  });

  describe('setTitle', () => {
    it('updates the title of a given Bracket', (done) => {
      const newTitle = 'My Renamed Bracket';

      Brackets.setTitle(newTitle, 1)
        .then((bracket) => {
          expect(bracket).to.be.an('object');
          expect(bracket.title).to.equal(newTitle);
          done();
        });
    });

    it('resets to a default value if no name is provided', (done) => {
      Promise.all([
        Brackets.setTitle(null, 1),
        Brackets.setTitle(undefined, 2),
      ]).then((brackets) => {
        expect(brackets[0]).to.be.an('object');
        expect(brackets[0].title).to.equal(DEFAULT_TITLE);
        expect(brackets[1]).to.be.an('object');
        expect(brackets[1].title).to.equal('');
        done();
      });
    });
  });
});
