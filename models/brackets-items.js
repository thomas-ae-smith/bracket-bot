/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable camelcase */

// ===== DB ====================================================================
import Knex  from '../db/knex';

// ===== UTIL ==================================================================
import {camelCaseKeys} from './util';

const BracketsItems = () => Knex('brackets_items');

/**
 * get - Gets the BracketItem with the given ID.
 * @param   {Number} bracketsItemId - the ID of the BracketItem to return.
 * @returns {Objst} bracketsItem - The matching BracketsItem object.
 */
export const get = (bracketsItemId) =>
  BracketsItems()
    .where('id', parseInt(bracketsItemId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * create - Creates a new BracketsItem.
 * @param   {String} name - The name of the BracketsItem to create.
 * @param   {Number} bracketId - The ID of the Bracket to create
 *                               the BracketsItem for.
 * @param   {Number} ownerFbId - The FB ID of the User who owns the bracket.
 * @returns {Object} bracketsItem - The newly created BracketsItem.
 */
export const create = (name = '', bracketId, ownerFbId) =>
  BracketsItems().insert({
    bracket_id: bracketId,
    name: name,
    owner_fb_id: ownerFbId,
  }, 'id')
    .then((bracketsItemId) => get(bracketsItemId));

/**
 * update - Update a BracketsItem with the given values.
 * @param   {Number} options.id - The ID of the BracketsItem to update.
 * @param   {String} options.name - The updated name of the BracketsItem.
 * @param   {Number} options.completerFbId - FB ID of the Completer
 * @returns {Object} bracketsItem - the updated BracketsItem.
 */
export const update = ({id, name, completerFbId}) =>
  BracketsItems().where('id', parseInt(id, 10)).update({
    completer_fb_id: completerFbId,
    name,
  }, 'id').then((bracketsItemId) => get(bracketsItemId));

export default {create, get, update};
