/*	
    .*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.												
	*   ----------------------------------------SAFI---------------------------------------   *
	*  										                                                  *
	*	Desarrollado por: Dream Team						                                  *
	*	Scarleth Abigail Baquedano Padilla  - abigailb643@gmail.com	      / +504 9951-6562    *
	*	Kevin Daniel Cubas Garcia           - kevin.cubas.hn@outlook.com  / +504 3359-8469	  *
	*	Anthony Joshua Avila Laguna  	    - anthony.avila.aa2@gmail.com / +504 9506-4506    *
	*	Isaac David Luque Medina     		- isaacluque3@gmail.com	      / +504 9857-1210    *
	*	Adoniss Guillermo Ponce García      - adonisponce230016@gmail.com / +504 3257-4414	  *			                                                                                    *
	*	                                                                                      *
    *   Fecha de creación: 14/09/2022									                      *
	*	Última modificación: 16/09/2022					                                      * 
	*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*
*/

const Server = require('./server/models/server');

const fecha = new Date();
const fechaFutura = new Date(fecha.setDate(fecha.getDate() + 360))
console.log(fechaFutura)
const server = new Server();

server.listen();
