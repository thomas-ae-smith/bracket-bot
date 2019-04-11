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

    knex.schema.createTable('brackets_items', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.integer('bracket_id').references('brackets.id').notNullable();
      table.bigInteger('owner_fb_id').references('users.fb_id').notNullable();
      table.bigInteger('completer_fb_id').references('users.fb_id');
    }),

    knex.schema.createTable('users', (table) => {
      table.increments();
      table.bigInteger('fb_id').unique().notNullable();
    }),

    knex.schema.createTable('users_brackets', (table) => {
      table.increments();
      table.integer('bracket_id').references('brackets.id').notNullable();
      table.bigInteger('user_fb_id').references('users.fb_id').notNullable();
      table.boolean('owner').defaultTo(false).notNullable();
    }),
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('users_brackets'),
    knex.schema.dropTable('brackets_items'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('brackets'),
  ]);
};
