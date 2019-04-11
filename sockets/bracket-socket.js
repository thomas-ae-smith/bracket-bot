/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Brackets from '../models/brackets';
import BracketsItems from '../models/brackets-items';

// Update the title of the given Bracket and
// notifies all subscribed users of the change.
const updateTitle = ({request: {bracketId, title}, sendStatus, socket}) => {
  Brackets.setTitle(title, bracketId)
    .then((bracket) => {
      socket.to(bracket.id).emit('title:update', bracket.title);
      sendStatus('ok');
    });
};

// Creates a new BracketItem and notifies
// all subscribed users of the change.
const addItem = ({
  request: {senderId, bracketId, name},
  sendStatus,
  allInRoom,
}) => {
  BracketsItems.create(name, bracketId, senderId)
    .then((bracketItem) => {
      allInRoom(bracketId).emit('item:add', bracketItem);
      sendStatus('ok');
    });
};

// Updates an existing BracketItem and notifies
// all subscribed users of the change.
const updateItem = ({request, sendStatus, allInRoom}) => {
  const {bracketId, id, name, completerFbId} = request;
  console.log('request', {bracketId, id, name, completerFbId});

  BracketsItems.update({id, name, completerFbId})
    .then(({id, name, completerFbId}) => {
      allInRoom(bracketId)
        .emit('item:update', {id, name, completerFbId});
      sendStatus('ok');
    });
};

export default {
  addItem,
  updateItem,
  updateTitle,
};
