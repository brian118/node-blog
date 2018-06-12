'use strict';
/*
*
* 标签数据模型
*
*/

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const tagSchema = new mongoose.Schema({
	//标签名
	name:{type:String,required:true,validate:/\S+/},

	//标签描述
	descript:String,

	//发布日期
	create_at:{type:Date,default:Date.now},

	//最后修改日期
	update_at:{type:Date},

	//排序
	sort:{type:Number,default:0}
})

//标签模型
const Tag = mongoose.model('Tag',tagSchema)

export default Tag