const nodemailer = require("nodemailer");
const Parametro = require("../models/seguridad/parametro");

// parametros
const crearTransporteSMTP = async() => {
	const puertoSMTP = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_CPUERTO'}})
	
	return nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: puertoSMTP,
		secure: true,
		auth: {
			user: 'drburger.safi.mailer@gmail.com',
			pass: 'vcpwvgqcltpwgrfy'
		}
	})
}





module.exports = {
    crearTransporteSMTP
}