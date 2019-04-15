/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('brackets', (table) => {
      table.increments();
      table.string('title').defaultTo('Custom Bracket').notNullable();
    }),

    knex.schema.createTable('users', (table) => {
      table.increments();
      table.bigInteger('fb_id').unique().notNullable();
    }),

    knex.schema.createTable('pairings', (table) => {
      table.increments();
      table.integer('bracket_id').references('brackets.id').notNullable();
      table.integer('pairing_id').references('pairings.id');
    }),

    knex.schema.createTable('members', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.integer('bracket_id').references('brackets.id').notNullable();
      table.integer('pairing_id').references('pairings.id').notNullable();
    }),

    knex.schema.createTable('votes', (table) => {
      table.primary(['pairing_id', 'user_fb_id']);
      table.integer('pairing_id').references('pairings.id').notNullable();
      table.bigInteger('user_fb_id').references('users.fb_id').notNullable();
      table.integer('member_id').references('members.id').notNullable();
    }),
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('votes'),
    knex.schema.dropTable('members'),
    knex.schema.dropTable('pairings'),
    knex.schema.dropTable('brackets'),
    knex.schema.dropTable('users'),
  ]);
};
