'use strict';

import express from 'express'
import User from '../controllers/user'

const router = express.Router();

router.post('/login',User.login);
router.get('/singout',User.singout);
router.get('/getAdminCount',User.getAdminCount);
router.post('/register',User.register);

export default router;