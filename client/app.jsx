/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import io from 'socket.io-client';
import React, {createElement} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Panel, Form} from 'react-weui';

// ===== COMPONENTS ============================================================
import Invite from './invite.jsx';
import Member from './member.jsx';
import BracketNotFound from './bracket_not_found.jsx';
import LoadingScreen from './loading_screen.jsx';
import NewMember from './new_member.jsx';
import Title from './title.jsx';
import Updating from './updating.jsx';
import Viewers from './viewers.jsx';

let socket;

/* =============================================
   =            React Application              =
   ============================================= */

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.addMember = this.addMember.bind(this);
    this.addNewMember = this.addNewMember.bind(this);
    this.pushUpdatedMember = this.pushUpdatedMember.bind(this);
    this.setDocumentTitle = this.setDocumentTitle.bind(this);
    this.setMember = this.setMember.bind(this);
    this.setNewMemberText = this.setNewMemberText.bind(this);
    this.setOwnerId = this.setOwnerId.bind(this);
    this.setTitleText = this.setTitleText.bind(this);
    this.userJoin = this.userJoin.bind(this);
    this.setOnlineUsers = this.setOnlineUsers.bind(this);

    this.state = {
      items: [],
      newMemberText: '',
      ownerId: null,
      resetting: false,
      title: this.props.title,
      updating: false,
      users: [],
    };
  }

  static propTypes = {
    apiUri: React.PropTypes.string.isRequired,
    bracketId: React.PropTypes.number.isRequired,
    socketAddress: React.PropTypes.string.isRequired,
    viewerId: React.PropTypes.number.isRequired,
    threadType: React.PropTypes.string.isRequired,
  }

  /* =============================================
     =               Helper Methods              =
     ============================================= */

  /* ----------  Communicate with Server  ---------- */

  /*
   * Push a message to socket server
   * To keep things clear, we're distinguishing push events by automatically
   * prepending 'push:' to the channel name
   *
   * Returned responses have no prefix,
   * and read the same in the rest of the code
   */
  pushToRemote(channel, message) {
    this.setState({updating: true}); // Set the updating spinner

    socket.emit(
      `push:${channel}`,
      {
        senderId: this.props.viewerId,
        bracketId: this.props.bracketId,
        ...message,
      },
      (status) => {
        // Finished successfully with a special 'ok' message from socket server
        if (status !== 'ok') {
          console.error(
            `Problem pushing to ${channel}`,
            JSON.stringify(message)
          );
        }

        this.setState({
          socketStatus: status,
          updating: false, // Turn spinner off
        });
      }
    );
  }

  /* ----------  Update Document Attributes  ---------- */

  setDocumentTitle(title = 'Shopping Bracket') {
    console.log('Updating document title (above page):', title);
    document.title = title;
  }

  /* =============================================
     =           State & Event Handlers          =
     ============================================= */

  /* ----------  Bracket  ---------- */

  // For the initial data fetch
  setOwnerId(ownerId) {
    console.log('Set owner ID:', ownerId);
    this.setState({ownerId});
  }

  setTitleText(title) {
    console.log('Push title to remote:', title);
    this.setState({title});
    this.setDocumentTitle(title);
    this.pushToRemote('title:update', {title});
  }

  /* ----------  Users  ---------- */

  // Socket Event Handler for Set Online Users event.
  setOnlineUsers(onlineUserFbIds = []) {
    const users = this.state.users.map((user) => {
      const isOnline =
        onlineUserFbIds.find((onlineUserFbId) => onlineUserFbId === user.fbId);

      return Object.assign({}, user, {online: isOnline});
    });

    this.setState({users});
  }

  // Socket Event Handler for User Join event.
  userJoin(newUser) {
    const oldUsers = this.state.users.slice();
    const existing = oldUsers.find((user) => user.fbId === newUser.fbId);

    let users;
    if (existing) {
      users = oldUsers.map((user) =>
        (user.fbId === newUser.fbId)
        ? newUser
        : user
      );
    } else {
      oldUsers.push(newUser);
      users = oldUsers;
    }

    this.setState({users});
  }

  /* ----------  Members  ---------- */

  addMember(item) {
    this.setState({items: [...this.state.items, item]});
  }

  pushUpdatedMember(itemId, name, completerFbId) {
    this.pushToRemote('item:update', {id: itemId, name, completerFbId});
  }

  setMember({id, name, completerFbId}) {
    const items = this.state.items.map((item) =>
      (item.id === id)
        ? Object.assign({}, item, {id: id, name, completerFbId})
        : item
    );

    this.setState({items});
  }

  /* ----------  New Member Field  ---------- */

  setNewMemberText(newText) {
    console.log('Set new item text:', newText);
    this.setState({newMemberText: newText});
  }

  // Turn new item text into an actual bracket item
  addNewMember() {
    const {newMemberText: name} = this.state;

    this.resetNewMember();
    this.pushToRemote('item:add', {name});
  }

  resetNewMember() {
    this.setState({resetting: true});

    setTimeout(() => {
      this.setState({newMemberText: '', resetting: false});
    }, 600);
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    // Connect to socket.
    socket = io.connect(
      this.props.socketAddress,
      {reconnect: true, secure: true}
    );

    // Add socket event handlers.
    socket.on('init', ({users, items, ownerId, title} = {}) => {
      this.setState({users, items, ownerId, title});
    });

    socket.on('item:add', this.addMember);
    socket.on('item:update', this.setMember);
    socket.on('bracket:setOwnerId', this.setOwnerId);
    socket.on('title:update', this.setDocumentTitle);
    socket.on('user:join', this.userJoin);
    socket.on('users:setOnline', this.setOnlineUsers);

    const self = this;
    // Check for permission, ask if there is none
    window.MessengerExtensions.getGrantedPermissions(function(response) {
      // check if permission exists
      const permissions = response.permissions;
      if (permissions.indexOf('user_profile') > -1) {
        self.pushToRemote('user:join', {id: self.props.viewerId});
      } else {
        window.MessengerExtensions.askPermission(function(response) {
          const isGranted = response.isGranted;
          if (isGranted) {
            self.pushToRemote('user:join', {id: self.props.viewerId});
          } else {
            window.MessengerExtensions.requestCloseBrowser(null, null);
          }
        }, function(errorCode, errorMessage) {
          console.error({errorCode, errorMessage});
          window.MessengerExtensions.requestCloseBrowser(null, null);
        }, 'user_profile');
      }
    }, function(errorCode, errorMessage) {
      console.error({errorCode, errorMessage});
      window.MessengerExtensions.requestCloseBrowser(null, null);
    });
  }

  render() {
    const {
      ownerId,
      items,
      users,
      title,
      resetting,
      newMemberText,
      updating,
      socketStatus,
    } = this.state;

    let page;

    // Skip and show loading spinner if we don't have data yet
    if (users.length > 0) {
      /* ----------  Setup Sections (anything dynamic or repeated) ---------- */

      const {apiUri, bracketId, viewerId, threadType} = this.props;
      const itemBracket = items.filter(Boolean).map((item) => {
        return (
          <Member
            {...item}
            key={item.id}
            users={users}
            viewerId={viewerId}
            pushUpdatedMember={this.pushUpdatedMember}
          />
        );
      });

      let invite;
      const isOwner = viewerId === ownerId;
      if (isOwner || threadType !== 'USER_TO_PAGE') {
        // only owners are able to share their brackets and other
        // participants are able to post back to groups.
        let sharingMode;
        let buttonText;

        if (threadType === 'USER_TO_PAGE') {
          sharingMode = 'broadcast';
          buttonText = 'Invite your friends to this bracket';
        } else {
          sharingMode = 'current_thread';
          buttonText = 'Send to conversation';
        }

        invite = (
          <Invite
            title={title}
            apiUri={apiUri}
            bracketId={bracketId}
            sharingMode={sharingMode}
            buttonText={buttonText}
          />
        );
      }

      let titleField;
      if (isOwner) {
        titleField = (
          <Title
            text={title}
            setTitleText={this.setTitleText}
          />
        );
      }

    /* ----------  Inner Structure  ---------- */
      page =
        (<section id='bracket'>
          <Viewers
            users={users}
            viewerId={viewerId}
          />

          <Panel>
            {titleField}

            <section id='items'>
              <Form checkbox>
                <ReactCSSTransitionGroup
                  transitionName='item'
                  transitionEnterTimeout={250}
                  transitionLeaveTimeout={250}
                >
                  {itemBracket}
                </ReactCSSTransitionGroup>
              </Form>

              <NewMember
                newMemberText={newMemberText}
                disabled={updating}
                resetting={resetting}
                addNewMember={this.addNewMember}
                setNewMemberText={this.setNewMemberText}
              />
            </section>
          </Panel>

          <Updating updating={updating} />

          {invite}
        </section>);
    } else if (socketStatus === 'noBracket') {
      // We were unable to find a matching bracket in our system.
      page = <BracketNotFound/>;
    } else {
      // Show a loading screen until app is ready
      page = <LoadingScreen key='load' />;
    }

    /* ----------  Animated Wrapper  ---------- */

    return (
      <div id='app'>
        <ReactCSSTransitionGroup
          transitionName='page'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {page}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
