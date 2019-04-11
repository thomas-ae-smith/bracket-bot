/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== LODASH ================================================================
import castArray from 'lodash/castArray';

// ===== MESSENGER =============================================================
import messages from './messages';
import api from './api';

const {APP_URL} = process.env;

// Turns typing indicator on.
const typingOn = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_on', // eslint-disable-line camelcase
  };
};

// Turns typing indicator off.
const typingOff = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off', // eslint-disable-line camelcase
  };
};

// Wraps a message JSON object with recipient information.
const messageToJSON = (recipientId, messagePayload) => {
  return {
    recipient: {
      id: recipientId,
    },
    message: messagePayload,
  };
};

// Send one or more messages using the Send API.
const sendMessage = (recipientId, messagePayloads) => {
  const messagePayloadArray = castArray(messagePayloads)
    .map((messagePayload) => messageToJSON(recipientId, messagePayload));

  api.callMessagesAPI([
    typingOn(recipientId),
    ...messagePayloadArray,
    typingOff(recipientId),
  ]);
};

// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen', // eslint-disable-line camelcase
  };

  api.callMessagesAPI(messageData);
};

// Send the initial message welcoming & describing the bot.
const sendWelcomeMessage = (recipientId) => {
  sendMessage(recipientId, messages.welcomeMessage(APP_URL));
};

// Let the user know that they don't have any brackets yet.
const sendNoBracketsYet = (recipientId) => {
  sendMessage(recipientId, messages.noBracketsMessage(APP_URL));
};

// Show user the brackets they are associated with.
const sendBrackets = (recipientId, action, brackets, offset) => {
  // Show different responses based on number of brackets.
  switch (brackets.length) {
  case 0:
    // Tell User they have no brackets.
    sendNoBracketsYet(recipientId);
    break;
  case 1:
    // Show a single bracket — Bracket view templates require
    // a minimum of 2 Elements. Rease More at:
    // https://developers.facebook.com/docs/
    // messenger-platform/send-api-reference/bracket-template
    const {id, title} = brackets[0];

    sendMessage(
      recipientId,
      messages.shareBracketMessage(APP_URL, id, title, 'Open Bracket'),
    );

    break;
  default:
    // Show a paginated set of brackets — Bracket view templates require
    // a maximum of 4 Elements. Rease More at:
    // https://developers.facebook.com/docs/
    // messenger-platform/send-api-reference/bracket-template
    sendMessage(
      recipientId,
      messages.paginatedBracketsMessage(APP_URL, action, brackets, offset)
    );

    break;
  }
};

// Send a message notifying the user their bracket has been created.
const sendBracketCreated = (recipientId, bracketId, title) => {
  sendMessage(
    recipientId,
    [
      messages.bracketCreatedMessage,
      messages.shareBracketMessage(APP_URL, bracketId, title, 'Open Bracket'),
    ]);
};

export default {
  sendBracketCreated,
  sendBrackets,
  sendMessage,
  sendNoBracketsYet,
  sendReadReceipt,
  sendWelcomeMessage,
};
