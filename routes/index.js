'use strict';
import user from './user'
import project from './project'
import article from './article'

export default app =>{
	app.use('/user',user);
	app.use('/project',project);
	app.use('/article',article);
}