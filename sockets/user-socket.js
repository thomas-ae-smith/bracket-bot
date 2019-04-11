/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Brackets from '../models/brackets';
import Users from '../models/users';

// ===== MESSENGER =============================================================
import userApi from '../messenger-api-helpers/user';
import sendApi from '../messenger-api-helpers/send';

// Find or Create a new/existing User with the given id.
const getUser = (senderId) => {
  return Users.findOrCreate({
    fb_id: senderId, // eslint-disable-line camelcase
  });
};

// Promise wrapper for Facebook UserApi.
const getUserDetails = (senderId) => {
  return new Promise((resolve, reject) => {
    userApi.getDetails(senderId, (err, {statusCode}, body) => {
      if (err) {
        return reject(err);
      } else if (statusCode !== 200) {
        return reject({
          statusCode,
          message: 'Unable to fetch user data for user',
          senderId,
        });
      }

      return resolve({
        name: body.first_name || body.last_name || senderId,
        profilePic: body.profile_pic,
        fbId: senderId,
      });
    });
  });
};

const getFacebookProfileInfoForUsers = (users = [], bracketId, socketUsers) =>
  Promise.all(users.map((user) => getUserDetails(user.fbId)))
    .then((res) => res.map((resUser = {}) => {
      // Detect online status via socketUser with matching bracket & FB IDs.
      const isOnline = [...socketUsers.values()].find((socketUser) =>
        socketUser.bracketId === bracketId &&
          socketUser.userId === resUser.fbId);

      return Object.assign({}, resUser, {online: !!isOnline || false});
    }));

// Join Room, Update Necessary Bracket Info, Notify Users in room of changes.
const join = ({
  request: {senderId, bracketId},
  allInRoom,
  sendStatus,
  socket,
  socketUsers,
  userSocket,
}) => {
  Promise.all([
    Brackets.get(bracketId),
    Brackets.getAllItems(bracketId),
    Brackets.getOwner(bracketId),
    getUser(senderId),
  ]).then(([bracket, items, bracketOwner, user]) => {
    if (!bracket) {
      console.error("Bracket doesn't exist!");
      sendStatus('noBracket');
    }

    Brackets.addUser(bracket.id, user.fbId)
      .then((usersBracket) => {
        if (!bracketOwner) {
          sendApi.sendBracketCreated(user.fbId, bracket.id, bracket.title);
          allInRoom(bracket.id).emit('bracket:setOwnerId',
            usersBracket.userFbId);
        }
      })
      .then(() => {
        socketUsers.set(socket.id, {bracketId: bracket.id, userId: user.fbId});

        Brackets.getAllUsers(bracketId)
          .then((users) => {
            return getFacebookProfileInfoForUsers(users, bracketId,
              socketUsers);
          })
          .then((fbUsers) => {
            const viewerUser =
              fbUsers.find((fbUser) => fbUser.fbId === user.fbId);
            socket.join(bracket.id);
            socket.in(bracket.id).emit('user:join', viewerUser);

            userSocket.emit('init', {
              ...bracket,
              items,
              users: fbUsers,
              ownerId: bracketOwner ? bracketOwner.fbId : user.fbId,
            });

            sendStatus('ok');
          });
      });
  });
};

// Notify users in room when user leaves.
const leave = ({userId, bracketId, allInRoom, socket, socketUsers}) => {
  if (!userId) {
    console.error('User not registered to socket');
    return;
  }

  socketUsers.delete(socket.id);

  // Detect online status via socketUser with matching bracket & FB IDs.
  const onlineUsers =
    [...socketUsers.values()].reduce((onlineUsers, socketUser) => (
      (socketUser.bracketId === bracketId)
        ? [...onlineUsers, socketUser.userId]
        : onlineUsers
  ), []);

  allInRoom(bracketId).emit('users:setOnline', onlineUsers);
};

export default {join, leave};
