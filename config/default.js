'use strict';

import {argv} from 'yargs'

module.exports = {
	port:8003,
	url:'mongodb://localhost:27017/test',
	session:{
		name:'SID',
		secret:'SID',
		cookie:{
			httpOnly:true,
			secure:false,
			maxAge:365*24*60*60*1000
		}
	},
	EMAIL:{
		account: argv.EMAIL_account || '626491171@qq.com',
		password: argv.EMAIL_password || 'bcw123'
	}
}