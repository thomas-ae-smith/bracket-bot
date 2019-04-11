/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import express from 'express';

// ===== DB ====================================================================
import Brackets from '../models/brackets';

const router = express.Router();

router.get('/:bracketId', (req, res) => {
  const {hostname} = req;
  const {DEMO, PORT, LOCAL} = process.env;
  const reqId = req.params.bracketId;
  const socketAddress = (DEMO && LOCAL) ?
    `http://${hostname}:${PORT}` : `wss://${hostname}`;

  if (reqId === 'new') {
    Brackets.create().then(({id}) => {
      res.render('./index', {bracketId: id, socketAddress, demo: DEMO});
    });
  } else {
    res.render('./index', {bracketId: reqId, socketAddress, demo: DEMO});
  }
});

export default router;
