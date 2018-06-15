'use strict';

import express from 'express'
import Reply from '../controllers/reply'

const router = express.Router();

router.get('/putReply',Reply.putReply);
router.get('/delectRelpy',Reply.delectRelpy);
router.post('/editReply',Reply.editReply);
router.get('/likeReply',Reply.likeReply);
router.get('/getReplyById',Reply.getReplyById);
router.get('/changeReplyStatus',Reply.changeReplyStatus);

export default router;