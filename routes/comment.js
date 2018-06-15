'use strict';

import express from 'express'
import Comment from '../controllers/comment'

const router = express.Router();

router.get('/putComment',Comment.putComment);
router.post('/editComment',Comment.editComment);
router.post('/likeComment',Comment.likeComment);
router.post('/getComment',Comment.getComment);

export default router;