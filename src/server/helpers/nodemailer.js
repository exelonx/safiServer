const nodemailer = require("nodemailer");
const Parametro = require("../models/seguridad/parametro");

const crearTransporteSMTP = async() => {
	// parametros
	const puertoSMTP = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_CPUERTO'}});
	const cuentaSMTP = await Parametro.findOne({where: {PARAMETRO: 'SMTP_CORREO'}});
	const passSMTP = await Parametro.findOne({where: {PARAMETRO: 'SMTP_CONTRASENA'}})
	
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: puertoSMTP.VALOR,
		secure: true,
		auth: {
			user: cuentaSMTP.VALOR,
			pass: passSMTP.VALOR
		}
	})
}





module.exports = {
    crearTransporteSMTP
}