'use strict'

import UserModel from '../models/user'
import BaseComponent from '../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

/**
 * 注册,登录用户
 * @param {*} opts 
 */
/* export const register = async(opts) =>{
 	return await (new User(opts)).save()
 }*/

 class User extends BaseComponent{
 	constructor(){
 		super()
 		this.register = this.register.bind(this);
 		this.login = this.login.bind(this)
 	}
 	async login(req,res,next){
 		const form = new formidable.IncomingForm();
 		form.parse(req , async(err,fields,files) =>{
 			if(err){
 				res.send({
 					status:1,
 					type:'FORM_DATA_ERROR',
 					message:'表单信息错误'
 				})
 				return
 			}
 			const {user_name,password,status = 1} = fields;

 			try{
 				if(!user_name){
 					throw new Error('用户名参数错误')
 				}else if(!password){
 					throw new Error('密码参数错误')
 				}
 			}catch(err){
 				console.log(err.message,err);
 				res.send({
 					status:1,
 					type:'GET_ERROR_PARAM',
 					message:err.message
 				})
 				return
 			}
 			const newpassword = this.encryption(password);
 			try{
 				const user = await UserModel.findOne({user_name});
 				if(!user){
 					console.log('用户未注册');
 					res.send({
 						status:1,
 						type:'GET_ERROR_PARAM',
 						message:'用户未注册'
 					})
 					return
 				}else if(newpassword.toString() != user.password.toString()){
 					console.log('密码错误');
 					res.send({
 						status:1,
 						type:'GET_ERROR_PARAM',
 						message:'密码错误'
 					})
 					return
 				}else{
 					req.session.admin_id = user.id;
 					res.send({
 						status:0,
 						message:'登录成功'
 					})
 				}
 			}catch(err){
 				console.log('登录失败',err);
 				res.send({
 					status:1,
 					type:'LOGIN_ADMIN_FAILED',
 					message:'登录失败'
 				})
 			}

 		})
 	}
 	async register(req , res , next){
 		const form = new formidable.IncomingForm();
 		form.parse(req ,async(err , fields ,files) =>{
 			if(err){
 				res.send({
 					status:0,
 					type:'FORM_DATA_ERROR',
 					message:'表单信息有误'
 				})
 				return
 			}
 			const {user_name,password,status = 1} = fields;
 			try{
 				if(!user_name){
 					throw new Error('用户名错误')
 				}else if(!password){
 					throw new Error('密码错误')
 				}
 			}catch(err){
 				console.log(err.message,err);
 				res.send({
 					status:1,
 					type:'GET_ERROR_PARAM',
 					message:err.message
 				})
 				return
 			}
 			try{
 				const user = await UserModel.findOne({user_name});
 				if(user){
 					console.log('该用户已存在');
 					res.send({
 						status:2,
 						type:'USER_HAS_EXIST',
 						message:'该用户已存在'
 					})
 				}else{
 					const userTip = status == 1 ? '管理员' : '超级管理员';
 					const user_id = await this.getId('adm')
 					const newpassword = this.encryption(password);
 					const newAdmin = {
 						user_name,
 						password:newpassword,
 						id:user_id,
 						create_time:dtime().format('YYYY-MM-DD'),
 						admin:userTip,
 						status
 					}
 					await UserModel.create(newAdmin);
 					req.session.admin_id = user_id;
 					res.send({
 						status:0,
 						message:'注册管理员成功'
 					})
 				}
 			}catch(err){
 				console.log('注册管理员失败', err);
				res.send({
					status: 2,
					type: 'REGISTER_ADMIN_FAILED',
					message: '注册管理员失败',
				})
 			}
 		})
 	}
 	async singout(req,res,next){
 		try{
 			delete req.session.admin_id; 
 			res.send({
 				status:0,
 				message:'退出成功'
 			})
 		}catch(err){
 			console.log('退出失败',err)
 			res.send({
 				status:1,
 				message:'退出失败'
 			})
 		}
 		
 	}
 	async getAdminCount(req,res,next){
 		const count = await UserModel.count();
 		console.log('获取用户数量为'+count)
 		try{
 			res.send({
	 			status:0,
	 			count
	 		})
 		}catch(err){
 			console.log('获取管理员数量失败',err);
 			res.send({
 				status:1,
 				type:'ERROR_GET_ERROR_PARAM',
 				message:'获取管理员数量失败'
 			})
 		}
 		
 	}
 	encryption(password){
 		const newpassword = this.MD5(this.MD5(password).substr(2,7) + this.MD5(password));
 		return password;
 	}
 	MD5(password){
 		const md5 = crypto.createHash('md5');
 		return md5.update(password).digest('base64');
 	}
 }

 export default new User()