/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import React, {createElement} from 'react';
import {Cell, CellBody, CellHeader, Input} from 'react-weui';

const SCROLL_DURATION = 1000; // total duration in ms for scroll animation.

/**
 * lockScroll — Force scrollY position to bottom of viewport for duration.
 * @param   {Number} startTime - Start Time for locking scroll duration.
 * @returns {Undefined} .
 */
const lockScroll = (startTime) => {
  const deltaTime = Date.now() - startTime;
  const htmlElement = document.documentElement;
  const {scrollTo, scrollX, innerHeight} = window;

  scrollTo(scrollX, htmlElement.offsetHeight - innerHeight);

  if (deltaTime <= SCROLL_DURATION) {
    window.requestAnimationFrame(() => lockScroll(startTime));
  }
};

// The NewMember Input Field Component
const NewMember = ({
  addNewMember,
  disabled,
  newMemberText,
  resetting,
  setNewMemberText,
}) => {
  const onSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled && newMemberText.length > 0) {
      addNewMember();
      lockScroll(Date.now());
    }
  };

  const classes = resetting ? 'resetting' : null; // For wipe animation

  return (
    <Cell id='new-item'>
      <CellHeader id='input-indicator' onClick={onSubmit}>
        <div className='weui-uploader__input-box' />
      </CellHeader>

      <CellBody>
        {/* Empty action attr enables 'Go' Submit Button on iOS Keyboard */}
        <form action onSubmit={onSubmit}>
          <Input
            className={classes}
            disabled={disabled}
            id='new-item-text'
            onBlur={onSubmit}
            onChange={(event) => setNewMemberText(event.target.value)}
            placeholder='Add an item to the bracket'
            type='text'
            value={newMemberText}
          />
        </form>
      </CellBody>
    </Cell>
  );
};

NewMember.proptypes = {
  addNewMember: React.PropTypes.func.isRequired,
  disabled: React.PropTypes.bool.isRequired,
  newMemberText: React.PropTypes.string,
  setNewMemberText: React.PropTypes.func.isRequired,
};

export default NewMember;
