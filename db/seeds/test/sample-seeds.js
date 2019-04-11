/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {getBracketsItems, getUsersBrackets, LISTS, USERS} =
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
    knex('users_brackets').del(),
    knex('brackets_items').del(),
    knex('brackets').del(),
    knex('users').del(),
  ]).then(() =>
    Promise.all([
      knex('brackets').insert(LISTS, 'id'),
      knex('users').insert(USERS, 'id'),
    ]).then((ids) => {
      const bracketIds = ids[0];

      return Promise.all([
        knex('users_brackets').insert(getUsersBrackets(bracketIds)),
        knex('brackets_items').insert(getBracketsItems(bracketIds)),
      ]);
    })
  );
