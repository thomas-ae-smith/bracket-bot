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

const Brackets = () => Knex('brackets');
const Members = () => Knex('members');

/**
 * get - Gets the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to return.
 * @returns {Object} bracket - The matched Bracket.
 */
const get = (bracketId) =>
  Brackets()
    .where('id', parseInt(bracketId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * getAll - Gets all Brackets
 * @returns {Array} brackets - Array of all Brackets.
 */
const getAll = () =>
  Brackets().select()
    .then((brackets) => brackets.map(camelCaseKeys));

/**
 * getAllMembers - Gets all Members of the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to get members of.
 * @returns {Array} members - Array of all Members
 */
const getAllMembers = (bracketId) =>
  Members()
    .where('bracket_id', parseInt(bracketId, 10))
    .select()
    .then((members) => members.map(camelCaseKeys));

/**
 * getForUser - Returns all Brackets associated with the given FB ID
 *              and ownership value.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @param   {Boolean} completed - The completion state to match Brackets with.
 * @returns {Array} brackets - The matched brackets.
 */
const getForUser = (userFbId, completed) => {
  const query = Brackets()
    .join('pairings', 'brackets.id', 'pairings.bracket_id')
    .join('votes', 'pairings.id', 'votes.vote_pairing_id')
    .where('user_fb_id', userFbId);

  // If we are looking for completed brackets, return only
  // those containing a vote for a terminal pairing
  if (completed === true) {
    query.andWhere('pairings.next_pairing_id', null);
  }

  return query.distinct().pluck('brackets.id')
    .then((bracketIds = []) => {
      // If we are looking for uncompleted brackets, rerun
      // the modified query to find completed brackets,
      // and filter those out
      if (completed === false) {
        query.andWhere('pairings.next_pairing_id', null);

        return query.distinct().pluck('brackets.id')
        .then((completedIds = []) => {
          const uncompletedIds = bracketIds.filter(
            (id) => !(completedIds.includes(id)) );
          // Return early.
          return Promise.all(uncompletedIds.map(get));
        });
      }
      // otherwise return all matching brackets
      return Promise.all(bracketIds.map(get));
    });
};

/**
 * getCompletedByUser — Returns all Brackets that a User has completed.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @returns {Array} brackets - Array of all brackets completed by the User.
 */
const getCompletedByUser = (userFbId) => getForUser(userFbId, true);

/**
 * getUncompletedByUser — Returns all Brackets that have been started by a User.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @returns {Array} brackets - Array of all Brackets started but not
 *                             finished by the User.
 */
const getUncompletedByUser = (userFbId) => getForUser(userFbId, false);

/**
 * setTitle - Sets the title of a given bracket.
 * @param   {String} newTitle - The new Title of the Bracket
 * @param   {Number} bracketId - The ID of the bracket to gain the new title.
 * @returns {Object} bracket - The updated Bracket.
 */
const setTitle = (newTitle = '', bracketId) => {
  const title = (newTitle === null) ? 'Custom Bracket' : newTitle;

  return Brackets()
    .where('id', parseInt(bracketId, 10)).update({title}, ['id', 'title'])
    .then(([bracket]) => bracket);
};

/**
 * create - Creates a new bracket with the given title.
 * @param   {String} title - The title of the bracket to create.
 * @returns {Object} bracket - The newly created bracket.
 */
const create = (title = 'Custom Bracket') =>
  Brackets()
    .insert({title}, 'id').then(get);

export default {
  create,
  get,
  getAll,
  getAllMembers,
  getForUser,
  getCompletedByUser,
  getUncompletedByUser,
  setTitle,
};
