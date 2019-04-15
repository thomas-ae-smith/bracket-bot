/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {getUpperPairings, getMiddlePairings, getBasePairing,
  getMembers, getVotes, BRACKETS, USERS} =
  require('../sample-seed-helpers');

/**
 * Test ENV Seed File - When run with `knex seed:run`,
 * populates database with placeholder data.
 * @param {string} knex - Knex dependency
 * @param {Promise} Promise - Promise dependency
 * @returns {Promise} A single Promise that resolves when
 * user and bracket items have been inserted into the database.
 */
exports.seed = (knex, Promise) =>
  Promise.all([
    knex('votes').del(),
    knex('members').del(),
    knex('pairings').del(),
    knex('users').del(),
    knex('brackets').del(),
  ]).then(() =>
    Promise.all([
      knex('brackets').insert(BRACKETS, 'id'),
      knex('users').insert(USERS, 'id'),
    ]).then((ids) => {
      const bracketIds = ids[0];

      return Promise.all([
        knex('pairings').insert(getUpperPairings(bracketIds), 'id'),
      ]).then((ids) => {
        const upperPairingIds = ids[0];

        return Promise.all([
          knex('pairings').insert(getMiddlePairings(bracketIds,
            upperPairingIds), 'id'),
        ]).then((ids) => {
          const middlePairingIds = ids[0];

          return Promise.all([
            knex('pairings').insert(getBasePairing(bracketIds,
              middlePairingIds), 'id'),
            knex('pairings').pluck('id'), // is there a race condition here?
          ]).then((ids) => {
            const pairingIds = ids[1];

            return Promise.all([
              knex('members').insert(getMembers(bracketIds, pairingIds), 'id'),
            ]).then((ids) => {
              const memberIds = ids[0];
console.log(pairingIds);
console.log(memberIds);
              return Promise.all([
                knex('votes').insert(getVotes(pairingIds, memberIds)),
              ]);
            });
          });
        });
      });
    })
  );

  /* There are better ways of doing the above than hardcoding it
   * ( https://github.com/tgriesser/knex/issues/556
   *   https://stackoverflow.com/questions/40543668/batch-update-in-knex )
   * but since this is only seeding code it's not worth the hassle.
   */
