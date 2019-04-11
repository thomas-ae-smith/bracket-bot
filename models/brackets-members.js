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

const BracketsMembers = () => Knex('brackets_members');

/**
 * get - Gets the BracketMember with the given ID.
 * @param   {Number} bracketsMemberId - the ID of the BracketMember to return.
 * @returns {Objst} bracketsMember - The matching BracketsMember object.
 */
export const get = (bracketsMemberId) =>
  BracketsMembers()
    .where('id', parseInt(bracketsMemberId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * create - Creates a new BracketsMember.
 * @param   {String} name - The name of the BracketsMember to create.
 * @param   {Number} bracketId - The ID of the Bracket to create
 *                               the BracketsMember for.
 * @param   {Number} ownerFbId - The FB ID of the User who owns the bracket.
 * @returns {Object} bracketsMember - The newly created BracketsMember.
 */
export const create = (name = '', bracketId, ownerFbId) =>
  BracketsMembers().insert({
    bracket_id: bracketId,
    name: name,
    owner_fb_id: ownerFbId,
  }, 'id')
    .then((bracketsMemberId) => get(bracketsMemberId));

/**
 * update - Update a BracketsMember with the given values.
 * @param   {Number} options.id - The ID of the BracketsMember to update.
 * @param   {String} options.name - The updated name of the BracketsMember.
 * @param   {Number} options.completerFbId - FB ID of the Completer
 * @returns {Object} bracketsMember - the updated BracketsMember.
 */
export const update = ({id, name, completerFbId}) =>
  BracketsMembers().where('id', parseInt(id, 10)).update({
    completer_fb_id: completerFbId,
    name,
  }, 'id').then((bracketsMemberId) => get(bracketsMemberId));

export default {create, get, update};
