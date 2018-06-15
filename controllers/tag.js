'use strict'

import TagModel from '../models/tag'
import ArticleModel from '../models/article'
import BaseComponent from '../prototype/baseComponent'
import formidable from 'formidable'


class Tag extends BaseComponent{
	constructor(){
		super()
	}
	//添加标签
	async putTag(req,res,next){
		let {name,descript =""} = req.query;
		console.log(name)
		if(name){
			let response = await TagModel.find({name})
			if(response && response.length !== 0){
				res.send({
					status:1,
					type:'ERROR_TAG_REPEAT',
					message:'标签名已存在'
				})
				return
			}else{
				let tag = new TagModel({name:name});
				await tag.save();
				res.send({
					status:0,
					message:'添加成功'
				})
			}
		}else{
			res.send({
				status:1,
				type:'ERROR_TAG_REPEAT',
				message:'参数错误'
			})
			throw new Error('参数错误')
		}
	}

	//标签获取
	async getTags(req,res,next){
		let {current_page = 1,page_size=50,keyword=''} = req.query;
		let querys = {};
		let options = {
			sort:{sort:1},
			page:Number(current_page),
			limit:Number(page_size)
		}

		if(keyword){
			querys.name = new RegExp(keyword) 
		}

		let result = [];
		let tag = await TagModel.paginate(querys,options);

		if(tag){
			let tagClone = JSON.parse(JSON.stringify(tag))

			//查找文章中标签聚合
			let $match = {};
			try{
				const article = new ArticleModel.aggregate([
					{$match},
					{$unwind:"$tag"},
					{$group:{
						_id:"$tag",
						num_tutorual:{$sum : 1}
					}}
				])

				if(article){
					tagClone.docs.forEach(t =>{
						const finded = article.find(c => String(c.id) === String(t.id));
						t.count = finded ? finded.num_tutorual : 0;
					})
					res.send({
						status:0,
						pagination:{
							total:tagClone.total,
							current_page:tagClone.page,
							total_page:tagClone.pages,
							page_size:tagClone.limit
						},
						result:tagClone.docs,
						message:'成功'
					})
				}
			}catch(err){
				console.log('参数错误');
				res.send({
					status:1,
					type:'ERROR_TAG_PARAM',
					message:'参数错误'
				})
			}
		}
	}

	//修改标签
	async editTag(req,res,next){
		const newData = {tag_id,name,descript=''} = req.query;
		try{
			let article = await TagModel.findOneAndUpdate({_id:tag_id},{$set:newData});
			res.send({
				status:0,
				message:'修改标签信息成功'
			})
		}catch(err){
			console.log(err.message,err);
			res.send({
				status:1,
				type:'ERROR_DATA',
				message:'修改标签信息成功'
			})
		}
	}

	//删除标签
	async deleteTag(req,res,next){
		const tag_id = req.query.tag_id;
		if(!tag_id){
			console.log('article_id参数错误');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'article_id参数错误'
			})
			return
		}

		try{
			await TagModel.findByIdAndRemove(tag_id);
			res.send({
				status:0,
				message:'删除当前标签成功'
			})
		}catch(err){
			console.log('删除当前标签失败',err);
			res.send({
				status:1,
				type:'DELETE_ARTICLE_FAILED',
				message:'删除当前标签失败'
			})
		}
	}
}

export default new Tag()