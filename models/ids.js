'use strict';

import mongoose from 'mongoose'

const idsSchema = new mongoose.Schema({
	user_id:Number,
	project_id:Number
});

const Ids = mongoose.model('Ids',idsSchema);
 
Ids.findOne((err,data) =>{
	if(!data){
		const newIds = new Ids({
			user_id:0,
			project_id:0
		});
		newIds.save();
	}
})

export default Ids