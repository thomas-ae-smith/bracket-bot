/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Constants for placeholder Bracket data for seed files.
const BRACKETS = [
  {title: 'Custom Bracket'},
  {title: 'Colour Bracket'},
  {title: 'Number Bracket'},
];

// Constants for placeholder User data for seed files.
const USERS = [
  {fb_id: 1},
  {fb_id: 2},
  {fb_id: 3},
];

// Constants for placeholder Pairing data for seed files.
const getUpperPairings = (bracketIds = []) => [
  {bracket_id: bracketIds[1]},
  {bracket_id: bracketIds[2]},
];

// Constants for placeholder Pairing data for seed files.
const getMiddlePairings = (bracketIds = [], pairingIds = []) => [
  {bracket_id: bracketIds[1], pairing_id: pairingIds[0]},
  {bracket_id: bracketIds[1], pairing_id: pairingIds[0]},
  {bracket_id: bracketIds[2], pairing_id: pairingIds[1]},
  {bracket_id: bracketIds[2], pairing_id: pairingIds[1]},
];

// Constants for placeholder Pairing data for seed files.
const getBasePairing = (bracketIds = [], pairingIds = []) => [
  {bracket_id: bracketIds[1], pairing_id: pairingIds[1]},
];

// todo: figure out how to set pairings internal relations

// Constants for placeholder Member data for seed files.
const getMembers = (bracketIds = [], pairingIds = []) => [
  {name: 'White', bracket_id: bracketIds[1], pairing_id: pairingIds[6]},
  {name: 'Blue', bracket_id: bracketIds[1], pairing_id: pairingIds[2]},
  {name: 'Black', bracket_id: bracketIds[1], pairing_id: pairingIds[6]},
  {name: 'Red', bracket_id: bracketIds[1], pairing_id: pairingIds[2]},
  {name: 'Green', bracket_id: bracketIds[1], pairing_id: pairingIds[3]},
  {name: 'One', bracket_id: bracketIds[2], pairing_id: pairingIds[4]},
  {name: 'Two', bracket_id: bracketIds[2], pairing_id: pairingIds[5]},
  {name: 'Three', bracket_id: bracketIds[2], pairing_id: pairingIds[5]},
  {name: 'Four', bracket_id: bracketIds[2], pairing_id: pairingIds[4]},
];

/**
 * getUsersBrackets - Gets placeholder UsersBrackets data for seed files.
 * @param   {Array} pairingIds - Array of pairing IDs.
 * @param   {Array} memberIds - Array of member IDs.
 * @returns {Array} usersBrackets - Array of placeholder usersBrackets
 *                                  data for seeds.
 */
const getVotes = (pairingIds = [], memberIds = []) => [
  {pairing_id: pairingIds[0], member_id: memberIds[3], user_fb_id: 1},
  {pairing_id: pairingIds[1], member_id: memberIds[7], user_fb_id: 1},
  {pairing_id: pairingIds[2], member_id: memberIds[3], user_fb_id: 1},
  {pairing_id: pairingIds[3], member_id: memberIds[0], user_fb_id: 1},
  {pairing_id: pairingIds[4], member_id: memberIds[5], user_fb_id: 1},
  {pairing_id: pairingIds[5], member_id: memberIds[7], user_fb_id: 1},
  {pairing_id: pairingIds[6], member_id: memberIds[0], user_fb_id: 1},
  {pairing_id: pairingIds[0], member_id: memberIds[4], user_fb_id: 2},
  {pairing_id: pairingIds[1], member_id: memberIds[8], user_fb_id: 2},
  {pairing_id: pairingIds[2], member_id: memberIds[1], user_fb_id: 2},
  {pairing_id: pairingIds[3], member_id: memberIds[2], user_fb_id: 2},
  {pairing_id: pairingIds[4], member_id: memberIds[8], user_fb_id: 2},
  {pairing_id: pairingIds[5], member_id: memberIds[7], user_fb_id: 2},
  {pairing_id: pairingIds[6], member_id: memberIds[2], user_fb_id: 2},
  {pairing_id: pairingIds[0], member_id: memberIds[2], user_fb_id: 3},
  {pairing_id: pairingIds[1], member_id: memberIds[5], user_fb_id: 3},
  {pairing_id: pairingIds[2], member_id: memberIds[1], user_fb_id: 3},
  {pairing_id: pairingIds[3], member_id: memberIds[2], user_fb_id: 3},
  {pairing_id: pairingIds[4], member_id: memberIds[5], user_fb_id: 3},
  {pairing_id: pairingIds[5], member_id: memberIds[6], user_fb_id: 3},
  {pairing_id: pairingIds[6], member_id: memberIds[2], user_fb_id: 3},
];

module.exports = {getUpperPairings, getMiddlePairings, getBasePairing,
  getMembers, getVotes, BRACKETS, USERS};
