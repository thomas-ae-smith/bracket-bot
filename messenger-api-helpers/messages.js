/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable camelcase */
/* eslint-disable max-len */

/*
 * BUTTONS
 *
 * Objects and methods that create objects that represent
 * buttons to be used in various UI elements.
 */

/**
 * Button for opening a specific bracket in a webview
 *
 * @param {string} bracketUrl - URL for a specific bracket.
 * @param {string} buttonText - Text for the action button.
 * @returns {object} -
 *   Message to create a button pointing to the bracket in a webview.
 */
const openExistingBracketButton = (bracketUrl, buttonText = 'Edit Bracket') => {
  return {
    type: 'web_url',
    title: buttonText,
    url: bracketUrl,
    messenger_extensions: true,
    webview_height_ratio: 'tall',
  };
};

/**
 * Button for opening a new bracket in a webview
 *
 * @param {string} apiUri - Hostname of the server.
 * @param {string=} buttonTitle - Button title.
 * @returns {object} -
 *   Message to create a button pointing to the new bracket form.
 */
const createBracketButton = (apiUri, buttonTitle = 'Create a Bracket') => {
  return {
    type: 'web_url',
    url: `${apiUri}/brackets/new`,
    title: buttonTitle,
    webview_height_ratio: 'tall',
    messenger_extensions: true,
  };
};

/*
 * MESSAGES
 *
 * Objects and methods that create objects that represent
 * messages sent to Messenger users.
 */

/**
 * Message that welcomes the user to the bot
 *
 * @param {string} apiUri - Hostname of the server.
 * @returns {object} - Message with welcome text and a button to start a new bracket.
 */
const welcomeMessage = (apiUri) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'Ready to make a shared bracket with your friends? Everyone can add items, check things off, and stay in sync.',
        buttons: [
          createBracketButton(apiUri),
        ],
      },
    },
  };
};

/**
 * Message for when the user has no brackets yet.
 *
 * @param {string} apiUri - Hostname of the server.
 * @returns {object} - Message with welcome text and a button to start a new bracket.
 */
const noBracketsMessage = (apiUri) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'It looks like you don’t have any brackets yet. Would you like to create one?',
        buttons: [
          createBracketButton(apiUri),
        ],
      },
    },
  };
};

/**
 * Helper to construct a URI for the desired bracket
 *
 * @param {string} apiUri -
 *   Base URI for the server.
 *   Because this moduele may be called from the front end, we need to pass it explicitely.
 * @param {int} bracketId - The bracket ID.
 * @returns {string} - URI for the required bracket.
 */
const bracketUrl = (apiUri, bracketId) => `${apiUri}/brackets/${bracketId}`;

/**
 * A single bracket for the bracket template.
 * The name here is to distinguish brackets and bracket templates.
 *
 * @param {string} id            - Bracket ID.
 * @param {string} apiUri        - Url of endpoint.
 * @param {string} subscriberIds - Ids of each subscriber.
 * @param {string} title         - Bracket title.
 * @returns {object} - Message with welcome text and a button to start a new bracket.
 */
const bracketElement = ({id, subscriberIds, title}, apiUri) => {
  return {
    title: title,
    subtitle: `Shared with ${[...subscriberIds].length} people`,
    default_action: {
      type: 'web_url',
      url: bracketUrl(apiUri, id),
      messenger_extensions: true,
      webview_height_ratio: 'tall',
    },
  };
};

/**
 * Messages for a bracket template of brackets (meta!), offset by how many
 * "read mores" the user has been through
 *
 * @param {string} apiUri - Hostname of the server.
 * @param {string} action - The postback action
 * @param {Array.<Object>} brackets - All of the brackets to be (eventually) displayed.
 * @param {int=} offset - How far through the bracket we are so far.
 * @returns {object} - Message with welcome text and a button to start a new bracket.
 */
const paginatedBracketsMessage = (apiUri, action, brackets, offset = 0) => {
  const pageBrackets = brackets.slice(offset, offset + 4);

  let buttons;
  if (brackets.length > (offset + 4)) {
    buttons = [
      {
        title: 'View More',
        type: 'postback',
        payload: `${action}_OFFSET_${offset + 4}`,
      },
    ];
  }

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'bracket',
        top_element_style: 'compact',
        elements: pageBrackets.map((bracket) => bracketElement(bracket, apiUri)),
        buttons,
      },
    },
  };
};

/**
 * Message that informs the user that their bracket has been created.
 */
const bracketCreatedMessage = {
  text: 'Your bracket was created.',
};

/**
 * Message to configure the customized sharing menu in the webview
 *
 * @param {string} apiUri - Application basename
 * @param {string} bracketId - The ID for bracket to be shared
 * @param {string} title - Title of the bracket
 * @param {string} buttonText - Text for the action button.
 * @returns {object} - Message to configure the customized sharing menu.
 */
const shareBracketMessage = (apiUri, bracketId, title, buttonText) => {
  const urlToBracket = bracketUrl(apiUri, bracketId);
  console.log({urlToBracket});
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{
          title: title,
          image_url: `${apiUri}/media/button-cover.png`,
          subtitle: 'A shared bracket from Tasks',
          default_action: {
            type: 'web_url',
            url: urlToBracket,
            messenger_extensions: true,
          },
          buttons: [openExistingBracketButton(urlToBracket, buttonText)],
        }],
      },
    },
  };
};

export default {
  welcomeMessage,
  bracketCreatedMessage,
  paginatedBracketsMessage,
  createBracketButton,
  noBracketsMessage,
  shareBracketMessage,
};
