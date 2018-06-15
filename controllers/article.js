'use strict'
import ArticleModel from '../models/article'
import BaseComponent from '../prototype/baseComponent'
import formidable from 'formidable'

class Article extends BaseComponent{
	constructor(){
		super()
	}
	//添加文章
	async addArticle(req,res,next){
		const form = new formidable.IncomingForm();
		let fields = req.query;
		//form.parse(req,async(err , fields , files) =>{	//方便测试 目前接口统一get请求
			console.log(Object.keys(fields).length)
			try{
				if(Object.keys(fields).length < 6){
					throw new Error('请填写必填项');
				}
			}catch(err){
				console.log(err.message,err);
				res.send({
					status:1,
					type:'ERROR_DATA',
					message:err.message
				})
				return
			}
			let {title, content, tag,editContent, keyword, descript} = fields;
			tag = tag.split(',');
			let articleObj = {
				title:title,
				content:content,
				editContent:editContent,
				keyword:keyword,
				descript:descript,
				tags:tag
			}
			let newArticle = new ArticleModel(articleObj) ;
			try{
				await newArticle.save();
				res.send({
					status:0,
					message:'添加文章成功'
				})
			}catch(err){
				console.log('保存文章失败');
				res.send({
					status:1,
					type:'ERROR_IN_SAVE_DATA',
					message:'保存文章失败'
				})
			}
		//})
	}
	//删除
	async deleteArticle(req , res , next){
		const article_id = req.query.article_id;
		if(!article_id){
			console.log('article_id参数错误');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'article_id参数错误'
			})
			return
		}

		try{
			await ArticleModel.findByIdAndRemove(article_id)
			res.send({
				status:0,
				message:'删除当前文章成功'
			})
		}catch(err){
			console.log('删除当前文章失败',err);
			res.send({
				status:1,
				type:'DELETE_ARTICLE_FAILED',
				message:'删除当前文章失败'
			})
		}
	}
	//修改
	async editeArticle(req ,res ,next){
		const form = new formidable.IncomingForm();
		form.parse(req , async(err , fields ,files) =>{
			if(err){
				console.log('获取文章信息form出错',err);
				res.send({
					status:1,
					type:'ERROR_FORM',
					message:'表单信息错误'
				})
				return
			}
			let newData = {title, tag, content, editContent, keyword, descript ,article_id} = fields;
			try{
				let article = await ArticleModel.findOneAndUpdate({_id:article_id},{$set:newData});
				res.send({
					status:0,
					message:'修改文章信息成功'
				})
			}catch(err){
				console.log(err.message,err);
				res.send({
					status:1,
					type:'ERROR_DATA',
					message:'更新文章失败'
				})
			}
		})
	}

	//分页
	async getArticles(req ,res ,next){
		let opts = req.query;
		const{
			current_page = 1,
			page_size = 10,
			keyword = '',
			state = 1,
			publish = 1,
			tag,
			type,
			date,
		} = opts;

		//过滤条件
		const options = {
			sort : {create_at:-1},
			page:Number(current_page),
			limit:Number(page_size),
			populate:['tags'],
			select:'-content'
		}

		//参数
		const querys = {};


		//关键词查询
		if(keyword){
			const keywordReg = new RegExp(keyword)
			querys['$or'] = [
				{'title' : keywordReg},
				{'content': keywordReg},
				{'description': keywordReg}
			]
		}

		//按照state长
		if(["1","2"].includes(state)){
			querys.state = state;
		}

		//按照公开成都查询
		if(['1','2'].includes(publish)){
			querys.publish = publish
		}

		//按照类型成都查询
		if(['1','2','3'].includes(type)){
			querys.type = type
		}

		//按热度排行
		if(hot){
			options.sort = {
				'meta.views' : -1,
				'meta.likes' : -1,
				'meta.comments' : -1
			}
		}

		//时间查询
		if(date){
			const getDate = new Date(date);
			if(!Object.is(getDate.toString(),'Invalid Date')){
				querys.create_at = {
					"$get": new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
					"$lt":new Date((getDate / 1000 + 60 * 60 * 16) * 1000)
				}
			}
		}

		if(tag) querys.tag = tag;

		try{
			const result = await ArticleModel.paginate(querys,options);
			if(result){
				res.send({
					status:0,
					message:'查询成功',
					result:result.docs,
					pagination:{
						total:result.total,
						current_page:result.page,
						total_page:result.pages,
						page_size:result.limit
					}
				})
			}else{
				return false;
			}
		}catch(err){
			console.log('参数错误');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'参数错误'
			});
			return;
		}
	}	

	//更新文章状态
	async changeArticleStatus(req ,res ,next){
		if(!article_id){
			console.log('article_id参数错误');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'article_id参数错误'
			})
			return
		}
		let opts = req.querys;
		let querys = {};
		let {state , publish ,article_id} = opts;

		if(state)querys.state = state

		if(publish) querys.publish = publish;

		try{
			await ArticleModel.findByIdAndUpdate(article_id,querys);
			res.send({
				status:0,
				message:'成功'
			})
		}catch(err){
			console.log("更新文章失败");
			res.send({
				status:1,
				type:'UPDATE_ARTICLE_FAILED',
				message:'更新文章失败'
			})
		}
		
	}

	//喜欢的文章
	async likeArticle(req ,res ,next){
		let article_id = req.query.article_id;
		if(article_id){
			try{
				let res = await ArticleModel.findById(article_id);
				if(res){
					//每次点赞加1
					res.meta.likes += 1;
					await res.save();
					res.send({
						status:0,
						message:'成功'
					})
				}else{
					return false;
				}
			}catch(err){
				console.log('失败',err);
			}
		}else{
			console.log('article_id参数错误');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'article_id参数错误'
			})
			return
		}
	}

	//文章归档
	async getAllArticles(req ,res ,next){
		const current_page = 1;
		const page_size = 100000;

		//过滤条件
		let options = {
			sort : {create_at:-1},
			page:Number(current_page),
			limit:Number(page_size),
			populate:['tag'],
			select:'-content'
		}

		//参数
		let query = {
			state:1,
			publish:1
		}

		let article = await ArticleModel.aggregate([
				{$match :{state :1, publish:1}},
				{
					$project:{
						year:{$year :'$create_at'},
						month:{$month:'$create_at'},
						title:1,
						create_at:1
					}
				},
				{
					$group:{
						_id:{
							year:'$year',
							month:'$month'
						},
						article:{
							$push:{
								title:'$title',
								_id :'$_id',
								create_at:'$create_at'
							}
						}
					}
				}

			])
		if(article){
			let yearList = [...new Set(article.map(item => item._id.year))].map(item =>{
				let monthList = [];
				article.forEach( n =>{
					if(n._id.year === item){
						monthList.push({ month: n._id.month, articleList: n.article.reverse() })
					}
				})
				return {year:item,monthList}
			})
			return yearList
		}else{
			return [];
		}

	}
}

export default new Article()