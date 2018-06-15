'use strict'

/*
*
* 文章数据模型
*
*/

import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

const articleShema = new mongoose.Schema({

	//文章标题
	title:{ type:String , required: true},

	//关键字
	keyword:{type:String ,required:true},

	//描述
	descript:{type: String ,required:true},

	//标签
	tags:[
		{type:mongoose.Schema.Types.ObjectId,ref:'Tag'}
	],

	//内容
	content:{type:String,required:true},

	//编辑内容
	editContent:{type:String,required:true},

	//状态1 发布2 草稿
	state:{type:Number , default: 1},

	//文章公开状态 1 公开  2私密
	publish:{type:Number,default:1},

	//缩略图
	thumb:String,

	//文章分类  1code 2think 3民谣
	type:{type:Number ,default : 1},

	//发布日期
	create_at:{type:Date,default:Date.now},

	//最好修改日期
	updata_at:{type:Date,default:Date.now},

	//其他元素
	meta:{
		views:{type:Number,default:0},
		likes:{type:Number,default:0},
		comments:{type:Number,default:0}
	}
})


//翻页插件配置
articleShema.plugin(mongoosePaginate)

//时间更新
articleShema.pre('findOneAndUpdate',function(next){
	this.findOneAndUpdate({},{updata_at:Date.now()})
	next()
})

//模型
const Article = mongoose.model('Article',articleShema)

export default Article