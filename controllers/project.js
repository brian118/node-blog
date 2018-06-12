'use strict'
import ProjectModel from '../models/project'
import BaseComponent from '../prototype/baseComponent'
import formidable from 'formidable'

/**
 * 添加项目
 * @param {*} opts 
 */

 class Project extends BaseComponent{
 	constructor(){
 		super();
 		this.addProject = this.addProject.bind(this)
 	}
 	//添加项目
 	async addProject(req,res,next){
 		const form  = new formidable.IncomingForm();
 		//form.parse(req, async(err, fields,files) =>{
 			let fields = req.query;

 			console.log(fields)
 			try{
 				if(!fields.title){
 					throw new Error('必须填写项目标题');
 				}else if(!fields.descript){
 					throw new Error('必须填写项目描述');
 				}else if(!fields.hrefUrl){
 					throw new Error('必须填写项目链接');
 				}
 			}catch(err){
 				console.log(err.message,err);
 				res.send({
 					status:1,
 					type:'ERROR_PARAMS',
 					message:err.message
 				})
 				return
 			}
 			let project_id;
 			try{
 				project_id = await this.getId('project_id');
 			}catch(err){
 				console.log('获取project_id失败');
 				res.send({
 					type:'ERROR_DATA',
 					message:'获取project_id失败'
 				})
 				return
 			}
 			const projectObj = {
 				title:fields.title,
 				descript:fields.descript,
 				hrefUrl:fields.hrefUrl,
 				id:project_id
 			}

 			const newProject = new ProjectModel(projectObj);
 			try{
 				await newProject.save();
 				res.send({
 					status:0,
 					message:'添加项目成功'
 				})
 			}catch(err){
 				console.log('保存数据失败');
 				res.send({
 					status:1,
 					type:'ERROR_IN_SAVE_DATA',
 					message:'保存数据失败'
 				})
 			}
 		//})
 	}
 	//删除项目
 	async delectProject(req,res,next){
 		const project_id = req.query.project_id;
 		if(!project_id || !Number(project_id)){
 			console.log('project_id参数错误');
 			res.send({
 				status:1,
 				type:'ERROR_PARAMS',
 				message:'project_id参数错误'
 			})
 			return
 		}

 		try{
 			const project = await ProjectModel.findOne({id:project_id});
 			await project.remove();
 			res.send({
 				status:0,
 				message:'删除当前项目成功'
 			})
 		}catch(err){
 			console.log('删除项目失败',err);
 			res.send({
 				status:1,
 				type:'DELETE_PROJECT_FAILED',
 				message:'删除项目失败'
 			})
 		}
 	}
 	//分页数据获取
 	async getProjects(req,res,next){
 		let opts = req.query;
 		const {
 			current_page = 1,
 			page_size = 50 
 		} = opts;

 		//过滤条件
 		const option = {
 			sort : {create_at:-1},
 			page:Number(current_page),
 			limit:Number(page_size)
 		}

 		//参数
 		const querys = {};

 		try{
 			const result = await ProjectModel.paginate(querys,option);
	 		if(result){
	 			res.send({
	 				status:0,
	 				message:'查询成功',
	 				result:result.docs,
	 				pagination:{
	 					total: result.total,
						current_page: result.page,
						total_page: result.pages,
						page_size: result.limit
	 				}
	 			})
	 		}
 		}catch(err){
 			console("参数错误");
 			res.send({
 				status:1,
 				type:'ERROR_DATA',
 				message:'参数错误'
 			})
 			return;
 		}
 	}
 }

 export default new Project();

