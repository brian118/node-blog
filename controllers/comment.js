'use strict'

import ArticleModel from '../models/article'
import CommentModel from '../models/comment'
import geoip from 'geoip-lite'
import BaseComponent from '../prototype/baseComponent'
import formidable from 'formidable'
import { sendMail } from '../utils/email'


class Comment extends BaseComponent{
	constructor(){	
		super();
		this.putComment = this.putComment.bind(this)
		this.sendMailToAdminAndTargetUser = this.sendMailToAdminAndTargetUser.bind(this)
	}
	//添加评论
	async putComment(req,res,next){
		//console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
		//console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
		//console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
		//console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
		//console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些
		//console.log(this.defaultData)
		let comment = req.query;
		if(!comment.post_id || !comment.name || !comment.email || !comment.content){
			console.log('post_id');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'参数错误'
			})
			return
		}
		const ip = (
			req.headers['x-forwarded-for'] ||
			req.headers['x-real-ip'] ||
			req.connection.remoteAddress || 
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress ||
			req.ips[0]).replace('::1:','')
		
		comment.ip = ip || '14.215.177.38';
		comment.agent = req.headers['user-agent'] || comment.agent;
		//console.log(comment.ip)
		let ip_location = geoip.lookup(comment.ip);

		//console.log(ip_location);
		if(ip_location){
			comment.city = ip_location.city,
			comment.range = ip_location.range,
			comment.country = ip_location.country
		}
		try{
			const name = new RegExp(comment.name);
			const email = new RegExp(comment.email);
			comment.author = {
				name:name,
				email:email
			}
		}catch(err){
			console.log("用户名或者邮箱格式不正确");
			res.send({
				state:1,
				type:'ERROR_DATA_PARAMS',
				message:'用户名或者邮箱格式不正确'
			})
		}
		
		try{
			let article = await ArticleModel.findById({_id:comment.post_id})
			article.meta.comments += 1;
			let newComment = new CommentModel(comment);
			await newComment.save();
			await article.save();

			this.sendMailToAdminAndTargetUser(comment);
			res.send({
				status:0,
				message:'评论成功'
			})
		}catch(err){
			console.log('参数错误',err);
			res.send({
				status:1,
				type:'ERROR_DATA_PARAMS',
				message:'参数错误'
			})
		}
	}
	sendMailToAdminAndTargetUser(comment){
		sendMail({
			to: `626491171@qq.com, ${comment.author.email}`,
			subject: '博客有新的留言',
			text: `来自 ${comment.author.name} 的留言：${comment.content}`,
			html: `<p> 来自 ${comment.author.name} 的留言：${comment.content}</p><br><a href="https://www.baidu.com" target="_blank">[ 点击查看 ]</a>`
		});
	}
	async delectComment(req,res,next){
		let comment_id = req.query.comment_id;
		if(!comment_id){
			console.log('post_id');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'post_id参数错误'
			})
			return
		}

		await CommentModel.findByIdAndRemove(comment_id);
		res.send({
			status:0,
			message:'删除成功'
		})
	}
	//修改
	async editComment(req,res,next){
		const form = new formidable.IncomingForm();
		form.parse(req,async(err,fields,files) =>{
			if(!fields.comment_id){
				console.log('post_id');
				res.send({
					status:1,
					type:'ERROR_PARAMS',
					message:'post_id参数错误'
				})
				return
			}
			try{
				await CommentModel.findOneAndUpdate({_id:fields.comment_id},{$set:fields});
				res.send({
					status:0,
					message:'修改成功'
				})
			}catch(err){
				console.log("修改评论失败",err);
				res.send({
					status:1,
					type:'ERROR_DATA_PARAMS',
					message:'修改评论失败'
				})
				return
			}
		})
	}
	//喜欢
	async likeComment(req,res,next){
		let comment_id = req.query.comment_id
		if(comment_id){
			try{
				let comment = await CommentModel.findById(comment_id);
				if(comment){
					//每次请求，views都增加一次
					comment.likes += 1;
					await comment.save();
					res.send({
						status:0,
						message:'关注成功'
					})
				}
			}catch(err){
				throw new Error("系统错误");
			}
			
		}
		
	}

	//根据文章id获取评论
	async getComment(req,res,next){
		let {sort = -1,current_page = 1,page_size= 10,keyword='',post_id,state} = req.query;
		let result = {};
		sort = Number(sort);

		//过滤条件
		const options = {
			sort:{_id:sort},
			page:Number(current_page),
			limit:Number(page_size)
		}

		//排序字段
		if([1,-1].includes(sort)){
			options.sort = sort;
		}else if(Object.is(sort,2)){		//Object.is es6语法 比较2个值是否相等  等同于 ===
			options.sort = {likes:-1}
		}

		//查询参数
		let querys = {};

		//查询各种状态
		if(state && ['0','1','2'].includes(state)){
			querys.state = state;
		}

		//关键词
		if(keyword){
			const keywordReg = new RegExp(keyword);
			querys['$or'] = [
				{'content':keywordReg},
				{'author.name':keywordReg},
				{'author.email':keywordReg},
			]
		}

		//通过post_id 过滤
		if(!Object.is(post_id,undefined)){
			querys.post_id = post_id;
		}

		//请求评论
		try{
			result = await CommentModel.paginate(querys,options);

			if(result){
				res.send({
					status:0,
					message:'查询成功',
					pagination: {
						total: result.total,
						current_page: options.page,
						total_page: result.pages,
						per_page: options.limit
					},
					result: result.docs
				})
			}else{
				res.send({
					result:[],
					status:0,
					message:''
				})
				return false;
			}
		}catch(err){
			console.log('查询失败',err);
			res.send({
				status:1,
				type:'ERROR_DATA_PARAMS',
				message:'查询失败'
			})
		}
		
	}
}

export default new Comment()