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
const BracketsItems = () => Knex('brackets_items');
const Users = () => Knex('users');
const UsersBrackets = () => Knex('users_brackets');

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
 * getAllItems - Gets all BracketsItems for the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to get items for.
 * @returns {Array} bracketsItems - Array of all BracketsItems
 */
const getAllItems = (bracketId) =>
  BracketsItems()
    .where('bracket_id', parseInt(bracketId, 10))
    .select()
    .then((bracketsItems) => bracketsItems.map(camelCaseKeys));

/**
 * getAllUsers - Gets all Users of the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to get Users for.
 * @returns {Array} users - Array of all Users for the matched Bracket.
 */
const getAllUsers = (bracketId) =>
  Users()
    .join('users_brackets', 'fb_id', 'users_brackets.user_fb_id')
    .where('bracket_id', parseInt(bracketId, 10))
    .select('fb_id')
    .then((users) => users.map(camelCaseKeys));

/**
 * getOwner - Gets the User who owns the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to get the Owner of.
 * @returns {Object} user - The User who owns the bracket.
 */
const getOwner = (bracketId) =>
  Users()
    .join('users_brackets', 'fb_id', 'users_brackets.user_fb_id')
    .where({bracket_id: parseInt(bracketId, 10), owner: true})
    .first('fb_id')
    .then(camelCaseKeys);

/**
 * getWithUsers - Returns the Bracket with the given ID, with an array of
 *                subscribed user FB IDs provided under `subscriberIds` key.
 * @param   {Number} bracketId - The ID of the Bracket to return.
 * @returns {Object} bracket - The matched bracket, with `subscriberIds` key.
 */
const getWithUsers = (bracketId) =>
  Promise.all([get(bracketId), getAllUsers(bracketId)])
    .then(([bracket, users]) => {
      if (bracket) {
        bracket.subscriberIds = users.map((user = {}) => user.fbId);
      }

      return bracket;
    });

/**
 * getForUser - Returns all Brackets associated with the given FB ID
 *              and ownership value.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @param   {Boolean} owner - The Ownership state to match Brackets against.
 * @returns {Array} brackets - The matched brackets.
 */
const getForUser = (userFbId, owner) => {
  const query = Brackets()
    .join('users_brackets', 'brackets.id', 'users_brackets.bracket_id')
    .where('user_fb_id', userFbId);

  if (typeof owner !== 'undefined') {
    query.andWhere({owner});
  }

  return query.pluck('brackets.id')
    .then((bracketIds = []) => Promise.all(bracketIds.map(getWithUsers)));
};

/**
 * getOwnedForUser — Returns all Brackets that a User owns.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @returns {Array} brackets - Array of all brackets owned by the User.
 */
const getOwnedForUser = (userFbId) => getForUser(userFbId, true);

/**
 * getSharedToUser — Returns all Brackets that have been shared with a User.
 * @param   {Number} userFbId - The FB ID of the User to find Brackets for.
 * @returns {Array} brackets - Array of all Brackets shared with the User.
 */
const getSharedToUser = (userFbId) => getForUser(userFbId, false);

/**
 * addUser - Associates a User with a Bracket, making
 *           them the owner if no other owner is found.
 * @param   {Number} bracketId - The ID of the Bracket to subscribe a User to.
 * @param   {Number} userFbId - The FB ID of the User to add to a Bracket.
 * @returns {Object} usersBracket
 */
const addUser = (bracketId, userFbId) => {
  return getOwner(bracketId)
    .then((user) => !!user)
    .then((hasOwner) =>
      UsersBrackets()
        .where({bracket_id: bracketId, user_fb_id: userFbId})
        .first()
        .then((usersBracket) => ({hasOwner, alreadyAdded: !!usersBracket}))
    )
    .then(({hasOwner, alreadyAdded}) => {
      if (alreadyAdded && !hasOwner) {
        return UsersBrackets()
          .where({bracket_id: bracketId, user_fb_id: userFbId})
          .first()
          .update({owner: true}, ['id', 'bracket_id', 'user_fb_id', 'owner'])
          .then(([usersBracket]) => camelCaseKeys(usersBracket));
      } else if (alreadyAdded) {
        return UsersBrackets()
          .where({bracket_id: bracketId, user_fb_id: userFbId})
          .first()
          .then(camelCaseKeys);
      }

      return UsersBrackets()
        .insert(
          {owner: !hasOwner, bracket_id: bracketId, user_fb_id: userFbId},
          ['id', 'bracket_id', 'user_fb_id', 'owner']
        )
        .then(([usersBracket]) => camelCaseKeys(usersBracket));
    });
};

/**
 * setOwner - Make the User with the provided FB ID
 *            the owner of the Bracket with the given ID.
 * @param   {Number} bracketId - The ID of the Bracket to make User owner of.
 * @param   {Number} userFbId - The FB ID of the User to be made owner.
 * @returns {Object} usersBracket
 */
const setOwner = (bracketId, userFbId) =>
  getOwner(bracketId)
    .then((user) => {
      if (!!user) {
        return UsersBrackets()
          .where({bracket_id: bracketId, user_fb_id: user.fbId})
          .update({owner: false}, 'id')
          .then(() => addUser(bracketId, userFbId));
      }

      return addUser(bracketId, userFbId);
    });

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
  addUser,
  create,
  get,
  getAll,
  getAllItems,
  getAllUsers,
  getForUser,
  getOwnedForUser,
  getSharedToUser,
  getOwner,
  getWithUsers,
  setOwner,
  setTitle,
};
