/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* ----------  External Libraries  ---------- */

import React from 'react';
import {Button} from 'react-weui';

/* ----------  Messenger Helpers  ---------- */

import messages from '../messenger-api-helpers/messages';

/*
 * Button to invite firends by invoking the share menu
 */
const Invite = ({
  title,
  bracketId,
  apiUri,
  sharingMode,
  buttonText,
  imgSource,
}) => {
  const shareBracket = () => {
    window.MessengerExtensions.beginShareFlow(
      function success(response) {
        if (response.is_sent) {
          window.MessengerExtensions.requestCloseBrowser(null, null);
        }
      }, function error(errorCode, errorMessage) {
        console.error({errorCode, errorMessage});
      },
      messages.shareBracketMessage(apiUri, bracketId, title),
      sharingMode);
  };

  const iconClassName = sharingMode === 'broadcast' ? 'share' : 'send';

  return (
    <div id='invite'>
      <Button onClick={shareBracket}>
        <span className={`invite-icon ${iconClassName}`} />
        {buttonText}
      </Button>
    </div>
  );
};

Invite.PropTypes = {
  shareBracket: React.PropTypes.func.isRequired,
};

export default Invite;
