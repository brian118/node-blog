import Ids from '../models/ids';
import fetch from 'node-fetch';

export default class BaseComponent{
	constructor(){
		this.idList = ['user_id','project_id'];
	}
	async fetch(url ='',data ={},type='GET',resType = 'JSON'){
		type = type.toUpperCase();
		if(type === "GET"){
			let dataStr = ''; //数据凭借字符串
			Object.keys(data).forEach(key =>{
				dataStr += key + '=' + data[key] + '&';
			})

			if(dataStr !== ''){
				dataStr = dataStr.substr(0,dataStr.lastIndexOf('&'));
				url = url + '?' + dataStr;
			}
		}

		let requestConfig = {
			method:type,
			headers:{
				'Accept' : 'application/json',
				'Content-Type':'application/json'
			}
		}

		if(type === 'POST'){
			Object.defineProperty(requestConfig,'body',{
				value:JSON.stringify(data)
			})
		}

		let responseJson;
		try {
			const response = await fetch(url, requestConfig);
			if (resType === 'TEXT') {
				responseJson = await response.text();
			}else{
				responseJson = await response.json();
			}
		} catch (err) {
			console.log('获取http数据失败', err);
			throw new Error(err)
		}
		return responseJson
	}
	//获取id列表，id自增方法
	async getId(type){
		if(!this.idList.includes(type)){
			console.log('id类型错误');
			throw new Error('id类型错误');
			return
		}

		try{
			const idData = await Ids.findOne();
			idData[type] ++;
			await idData.save();
			return idData[type]
		}catch(err){
			console.log('获取ID数据失败');
			throw new Error(err);
		}
	}
}