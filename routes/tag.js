'use strict';

import express from 'express'
import Tag from '../controllers/tag'

const router = express.Router();

router.get('/putTag',Tag.putTag);
router.get('/getTags',Tag.getTags);
router.get('/editTag',Tag.editTag);
router.get('/deleteTag',Tag.deleteTag);

export default router;