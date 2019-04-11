/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Constants for placeholder Bracket data for seed files.
const LISTS = [
  {title: 'Custom Bracket'},
  {title: 'Default Bracket'},
  {title: 'Party Planning Bracket'},
];

// Constants for placeholder User data for seed files.
const USERS = [
  {fb_id: 1},
  {fb_id: 2},
  {fb_id: 3},
  {fb_id: 4},
];

/**
 * getUsersBrackets - Gets placeholder UsersBrackets data for seed files.
 * @param   {Array} bracketIds - Array of bracket IDs.
 * @returns {Array} usersBrackets - Array of placeholder usersBrackets
 *                                  data for seeds.
 */
const getUsersBrackets = (bracketIds = []) => [
  {bracket_id: bracketIds[0], user_fb_id: 1, owner: true},
  {bracket_id: bracketIds[0], user_fb_id: 2},
  {bracket_id: bracketIds[0], user_fb_id: 3},
  {bracket_id: bracketIds[1], user_fb_id: 1},
  {bracket_id: bracketIds[1], user_fb_id: 2, owner: true},
  {bracket_id: bracketIds[2], user_fb_id: 2, owner: true},
  {bracket_id: bracketIds[2], user_fb_id: 3},
];

/**
 * getBracketsItems - Gets placeholder BracketsItems data for seed files.
 * @param   {Array} bracketIds - Array of bracket IDs.
 * @returns {Array} bracketsItems - Array of placeholder bracketsItems
 *                                  data for seeds.
 */
const getBracketsItems = (bracketIds = []) => [
  {name: 'Eggs', bracket_id: bracketIds[0], owner_fb_id: 1, completer_fb_id: 2},
  {name: 'Milk', bracket_id: bracketIds[0], owner_fb_id: 3, completer_fb_id: 3},
  {name: 'Bread', bracket_id: bracketIds[0], owner_fb_id: 1},
  {name: 'Cup', bracket_id: bracketIds[1], owner_fb_id: 1, completer_fb_id: 2},
  {name: 'Call Parents', bracket_id: bracketIds[1], owner_fb_id: 2},
  {name: 'Balloons', bracket_id: bracketIds[2], owner_fb_id: 2},
  {name: 'Invites', bracket_id: bracketIds[2], owner_fb_id: 3},
];

module.exports = {getBracketsItems, getUsersBrackets, LISTS, USERS};
