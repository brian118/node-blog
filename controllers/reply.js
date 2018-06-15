'use strict'

import ArticleModel from '../models/article'
import CommentModel from '../models/comment'
import ReplyModel from '../models/reply'
import geoip from 'geoip-lite'
import BaseComponent from '../prototype/baseComponent'
import formidable from 'formidable'
import { sendMail } from '../utils/email'

class Reply extends BaseComponent{
	constructor(){
		super();
		this.putReply = this.putReply.bind(this);
	}
	async putReply(req,res,next){
		let reply = req.query;
		if(!reply.post_id || !reply.cid || !reply.from || !reply.content){
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
		reply.ip = ip || '14.215.177.38';
		reply.agent = req.headers['user-agent'] || reply.agent;

		let ip_location = geoip.lookup(reply.ip);

		if(ip_location){
			reply.city = ip_location.city,
			reply.range = ip_location.range,
			reply.country = ip_location.country
		}

		reply.likes = 0;

		try{
			//发布评论回复
			const response = await (new ReplyModel(reply)).save();

			//让原来评论数+1
			let comment = await CommentModel.findOne({_id:reply.cid});

			if(comment){
				comment.reply += 1;
				await comment.save();
			}else{
				res.send({
					status:1,
					type:'ERROR_PARAMS',
					message:'没有相对应评论'
				})
				return
			}

			this.sendMailToAdminAndTargetUser(reply);
			res.send({
				status:0,
				message:'回复评论成功'
			})


		}catch(err){
			console.log('参数异常',err);
			res.send({
				status:1,
				type:'ERROR_DATA_PARAMS',
				message:'参数异常'
			})
		}
	}

	sendMailToAdminAndTargetUser(reply){
		let srt = '626491171@qq.com';
		if(reply.to && reply.to.email){
			str += `,${reply.from.email},${reply.to.email}`
		}else{
			str += `,${reply.form.email}`
		}
		sendMail({
			to: str
			subject: '你在blog.brian有新的评论回复',
			text: `来自 ${reply.from.name} 的留言：${reply.content}`,
			html: `<p> 来自 ${reply.from.name} 的留言：${reply.content}</p><br><a href="https://www.baidu.com" target="_blank">[ 点击查看 ]</a>`
		});
	}

	async delectRelpy(req,res,next){
		let reply_id = req.query.reply_id;
		if(!reply_id){
			console.log('reply_id');
			res.send({
				status:1,
				type:'ERROR_PARAMS',
				message:'reply_id参数错误'
			})
			return
		}

		await ReplyModel.findByAndRemove(reply_id);
		res.send({
			status:0,
			message:'删除成功'
		})
	}

	//修改
	async editReply(req,res,next){
		const form = new formidable.IncomingForm();
		form.parse(req,async(err,fields,files) =>{
			if(!fields.reply_id){
				console.log('reply_id');
				res.send({
					status:1,
					type:'ERROR_PARAMS',
					message:'reply_id参数错误'
				})
				return
			}

			try{
				await ReplyModel.findOneAndUpdate({_id:fields.reply_id},{$set:fields});
				res.send({
					status:0,
					message:'修改成功'
				})
			}catch(err){
				console.log('修改失败',err);
				res.send({
					status:1,
					type:'ERROR_DATA_PARAMS',
					message:'修改失败'
				})
				return
			}
		})
	}

	//喜欢回复
	async likeReply(req,res,next){
		let reply_id = req.query.reply_id;
		if(reply_id){
			try{
				let reply = await ReplyModel.findById(reply_id);
				if(reply){
					reply.likes += 1;
					await reply.save();
					res.send({
						status:0,
						message:'关注成功'
					})
				}
			}catch(err){
				throw new Error("系统错误");
				res.send({
					status:1,
					type:'ERROR_DATA_PARAMS',
					message:'关注失败'
				})
			}
		}
	}

	//根据评论id获取评论
	async getReplyById(req,res,next){
		let { sort = -1, current_page = 1, page_size = 20, keyword = '', post_id, state } = req.query
		let result = {}
		sort = Number(sort)

		//过滤条件
		const options = {
			sort:{_id:sort},
			page:Number(current_page),
			limit:Number(page_size)
		}

		//排序字段
		if([1,-1].includes(sort)){
			options.sort = {_id:sort}
		}else if(Object.is(sort,2)){
			options.sort = {likes:-1}
		}

		let querys = {
			cid
		}

		//查询各种状态
		if(state && ['0','1','2'].includes(state)){
			querys.state = state;
		}

		if(keyword){
			const keywordReg = new RegExp(keyword);
			querys['$or'] = [
				{'content':keywordReg},
				{'to.name':keywordReg},
				{'to.email':keywordReg}
			]
		}

		try{
			const reply = await ReplyModel.paginate(querys,options);

			if(reply){
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

	//更新评论状态
	async changeReplyStatus(req,res,next){
		let _id = req.query.reply_id;
		let state = req.query.state;
		try{
			await ReplyModel.findByIdAndUpdate(_id,{state});
			res.send({
				status:0,
				message:'更新成功'
			})
		}catch(err){
			throw new Error("参数错误");
		}
	}
}

export default new Reply()