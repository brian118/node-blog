'use strict';

import express from 'express'
import Project from '../controllers/project'

const router = express.Router();

router.get('/addProject',Project.addProject);
router.get('/delectProject',Project.delectProject);
router.get('/getProjects',Project.getProjects);

export default router;