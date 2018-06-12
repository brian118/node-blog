'use strict'

/*
*
* 添加文章数据模型
*
*/
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

const projectShema = new mongoose.Schema({
	id:{type:Number},

	//文章标题
	title:{type:String,required:true},

	//描述
	descript:{type:String,required:true},

	//项目链接
	hrefUrl:{type:String,required:true},

	//icon图
	icon:String,
	view:String,
	github:String,

	//发布日期
	create_at:{type:Date,default:Date.now},

	//最后修改日期
	update_at:{type:Date,default:Date.now}
})

//翻页配置
projectShema.plugin(mongoosePaginate)

//时间更新
projectShema.pre('findOneAndUpdate',function(next){
	this.findOneAndUpdate({},{update_at:Date.now()})
	next()
})

projectShema.index({id:1});

//模型
const Project = mongoose.model('Project',projectShema)

export default Project