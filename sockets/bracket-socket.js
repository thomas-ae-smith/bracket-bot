/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Brackets from '../models/brackets';
import BracketsMembers from '../models/brackets-members';

// Update the title of the given Bracket and
// notifies all subscribed users of the change.
const updateTitle = ({request: {bracketId, title}, sendStatus, socket}) => {
  Brackets.setTitle(title, bracketId)
    .then((bracket) => {
      socket.to(bracket.id).emit('title:update', bracket.title);
      sendStatus('ok');
    });
};

// Creates a new BracketMember and notifies
// all subscribed users of the change.
const addMember = ({
  request: {senderId, bracketId, name},
  sendStatus,
  allInRoom,
}) => {
  BracketsMembers.create(name, bracketId, senderId)
    .then((bracketMember) => {
      allInRoom(bracketId).emit('member:add', bracketMember);
      sendStatus('ok');
    });
};

// Updates an existing BracketMember and notifies
// all subscribed users of the change.
const updateMember = ({request, sendStatus, allInRoom}) => {
  const {bracketId, id, name, completerFbId} = request;
  console.log('request', {bracketId, id, name, completerFbId});

  BracketsMembers.update({id, name, completerFbId})
    .then(({id, name, completerFbId}) => {
      allInRoom(bracketId)
        .emit('member:update', {id, name, completerFbId});
      sendStatus('ok');
    });
};

export default {
  addMember,
  updateMember,
  updateTitle,
};
