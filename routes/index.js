'use strict';
import user from './user'
import project from './project'
import article from './article'
import tag from './tag'
import comment from './comment'
import reply from './reply'

export default app =>{
	app.use('/user',user);
	app.use('/project',project);
	app.use('/article',article);
	app.use('/tag',tag);
	app.use('/comment',comment);
	app.use('/reply',reply);
}