'use strict'

import config from 'config-lite';
import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'

let clientIsValid = false;
const transporter = nodemailer.createTransport(

	smtpTransport({
		host: "smtp.qq.com",
		secure: true,
		secureConnection: true, // use SSL
		port: 465,
		auth: {
			user: config.EMAIL.account,
			pass: config.EMAIL.password
		}
	})
)

const verifyClient = () => {
	transporter.verify((error, success) => {
		if (error) {
			clientIsValid = false;
			console.warn("邮件客户端初始化连接失败，将在一小时后重试");
			setTimeout(verifyClient, 1000 * 60 * 60);
		} else {
			clientIsValid = true;
			console.log("邮件客户端初始化连接成功，随时可发送邮件");
		}
	})
}

verifyClient()

const sendMail = mailOptions => {

	if (!clientIsValid) {
		console.warn("由于未初始化成功，邮件客户端发送被拒绝")
		return false;
	}

	mailOptions.from = '"柏程炜" <626491171@qq.com>'

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) return console.warn("邮件发送失败", error)
		console.log("邮件发送成功", info.messageId, info.response)
	})
}

exports.sendMail = sendMail
exports.nodemailer = nodemailer
exports.transporter = transporter