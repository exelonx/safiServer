"use strict";(self.webpackChunksafiApp=self.webpackChunksafiApp||[]).push([[592],{7166:(U,R,a)=>{a.d(R,{n:()=>P});var i=a(8505),p=a(262),c=a(9646),h=a(2340),_=a(4650),m=a(529);let P=(()=>{class u{constructor(o){this.http=o,this.categorias=[],this.categoria={ID:0,NOMBRE:"",CREADO_POR:"",FECHA_CREACION:new Date,MODIFICADO_POR:"",FECHA_MODIFICACION:new Date},this.baseURL=h.N.baseURL}getCategorias(o,r,t,e){return r||(r=""),this.http.get(`${this.baseURL}/catalogo-venta/?buscar=${r}&quienBusco=${o}&limite=${t||""}&desde=${e||""}`).pipe((0,i.b)(n=>{this.categorias=n.catalogos}),(0,p.K)(n=>(0,c.of)(n.error.msg)))}actualizarCatalogo(o,r,t){return this.http.put(`${this.baseURL}/catalogo-venta/editar-catalogo/${o}`,{nombre_catalogo:r,id_usuario:t}).pipe((0,p.K)(n=>(0,c.of)(n.error.msg)))}getUnaCategoria(o){return this.http.get(`${this.baseURL}/catalogo-venta/${o}`).pipe((0,i.b)(t=>{this.categoria=t.catalogo}),(0,p.K)(t=>(0,c.of)(t.error)))}crearCategoria(o,r){return this.http.post(`${this.baseURL}/catalogo-venta/`,{nombre_catalogo:o,id_usuario:r}).pipe((0,p.K)(s=>(0,c.of)(s.error)))}eliminarCategoria(o,r){return this.http.delete(`${this.baseURL}/catalogo-venta/${o}?quienElimina=${r}`).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}getReporte(o=""){return this.http.post(`${this.baseURL}/catalogo-venta/reporteria/catalogo-venta`,{buscar:o},{responseType:"blob"}).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}}return u.\u0275fac=function(o){return new(o||u)(_.LFG(m.eN))},u.\u0275prov=_.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},2710:(U,R,a)=>{a.d(R,{U:()=>P});var i=a(262),p=a(9646),c=a(8505),h=a(2340),_=a(4650),m=a(529);let P=(()=>{class u{constructor(o){this.http=o,this.producto={ID:0,ID_IMPUESTO:0,PORCENTAJE:0,ID_TIPO_PRODUCTO:0,NOMBRE:"",PRECIO:0,EXENTA:!1,DESCRIPCION:"",FECHA_INICIO:new Date,FECHA_FINAL:new Date,ESTADO:!1,SIN_ESTADO:!1,BEBIDA:!1,IMAGEN:new Blob,CREADO_POR:"",FECHA_CREACION:new Date,MODIFICACION_POR:"",FECHA_MODIFICACION:new Date},this.catalogoProducto=[],this.insumoProducto=[],this.comboProducto=[],this.promoProducto=[],this.productos=[],this.baseURL=h.N.baseURL}getTipoProducto(){return this.http.get(`${this.baseURL}/tipo-producto/`).pipe((0,i.K)(r=>(0,p.of)(r.error.msg)))}getProductos(o,r,t,e,s){return t||(t=""),this.http.get(`${this.baseURL}/producto/?buscar=${t}&quienBusco=${r}&limite=${e||""}&desde=${s||""}&idTipoProducto=${o||""}`).pipe((0,c.b)(d=>{this.productos=d.productos}),(0,i.K)(d=>(0,p.of)(d.error.msg)))}getProducto(o){return this.http.get(`${this.baseURL}/producto/${o}`).pipe((0,c.b)(t=>{this.producto=t.producto}),(0,i.K)(t=>(0,p.of)(t.error)))}postProducto(o,r,t,e,s,n,d,l,E,O){return this.http.post(`${this.baseURL}/producto/`,{id_usuario:o,nombre:r,precio:t,impuesto:e,descripcion:s,exenta:n,esBebida:d,sinEstado:l,arregloInsumo:E,arregloCategoria:O}).pipe((0,i.K)($=>(0,p.of)($.error)))}postCombo(o,r,t,e,s,n,d,l){return this.http.post(`${this.baseURL}/producto/combo/`,{id_usuario:o,nombre:r,precio:t,impuesto:e,descripcion:s,sinEstado:n,arregloProductos:d,arregloCategoria:l}).pipe((0,i.K)(I=>(0,p.of)(I.error)))}postPromocion(o,r,t,e,s,n,d,l,E,O){return this.http.post(`${this.baseURL}/producto/promocion/`,{id_usuario:o,nombre:r,precio:t,impuesto:e,descripcion:s,sinEstado:n,fecha_inicio:d,fecha_final:l,arregloProductos:E,arregloCategoria:O}).pipe((0,i.K)($=>(0,p.of)($.error)))}deleteProducto(o,r){return this.http.delete(`${this.baseURL}/producto/${o}?quienElimina=${r}`).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}putProducto(o,r,t,e,s,n,d,l,E,O,I,b,$,g,C,L){return this.http.put(`${this.baseURL}/producto/actualizarProducto/${o}`,{id_usuario:L,id_impuesto:r,porcentaje:e,id_tipo_producto:t,nombre:s,precio:n,exenta:d,descripcion:l,fecha_inicio:E,fecha_final:O,sin_estado:I,bebida:b,imagen:$,creado_por:g,fecha_creacion:C}).pipe((0,i.K)(f=>(0,p.of)(f.error.msg)))}getReporteProducto(o=""){return this.http.post(`${this.baseURL}/producto/reporteria/producto`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}getReporteCombo(o=""){return this.http.post(`${this.baseURL}/producto/reporteria/combo`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}getReportePromocion(o=""){return this.http.post(`${this.baseURL}/producto/reporteria/promocion`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}getComboProducto(o=""){return this.http.post(`${this.baseURL}/producto/reporteria/combo`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}getInsumoProducto(o){return this.http.get(`${this.baseURL}/insumo-producto/insumos/${o}`).pipe((0,c.b)(t=>{this.insumoProducto=t.insumoProducto}),(0,i.K)(t=>(0,p.of)(t.error.msg)))}getCatalogoProducto(o){return this.http.get(`${this.baseURL}/producto/catalogo/${o}`).pipe((0,c.b)(t=>{this.catalogoProducto=t.catalogoProducto}),(0,i.K)(t=>(0,p.of)(t.error.msg)))}getComboProductoLista(o){return this.http.get(`${this.baseURL}/producto/combo/${o}`).pipe((0,c.b)(t=>{this.comboProducto=t.comboProducto}),(0,i.K)(t=>(0,p.of)(t.error.msg)))}getPromoProductoLista(o){return this.http.get(`${this.baseURL}/producto/promo/${o}`).pipe((0,c.b)(t=>{this.promoProducto=t.promocionProducto}),(0,i.K)(t=>(0,p.of)(t.error.msg)))}getPromocionProducto(o=""){return this.http.post(`${this.baseURL}/producto/reporteria/promocion`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}putInfoProducto(o,r,t,e,s,n,d,l,E,O,I){return this.http.put(`${this.baseURL}/producto/${r}`,{nombre:t,precio:e,id_impuesto:s,descripcion:n,estado:d,bebida:l,exento:E,fecha_final:I,fecha_inicio:O,id_usuario:o}).pipe((0,i.K)(g=>(0,p.of)(g.error)))}putInsumoProducto(o,r,t,e){return this.http.put(`${this.baseURL}/producto/insumo-producto/${r}`,{nuevo_insumo:t,nueva_cantidad:e,id_usuario:o}).pipe((0,i.K)(d=>(0,p.of)(d.error)))}putComboProducto(o,r,t,e){return this.http.put(`${this.baseURL}/producto/combo-producto/${r}`,{nuevo_producto:t,nueva_cantidad:e,id_usuario:o}).pipe((0,i.K)(d=>(0,p.of)(d.error)))}putPromoProducto(o,r,t,e){return this.http.put(`${this.baseURL}/producto/promo-producto/${r}`,{nuevo_producto:t,nueva_cantidad:e,id_usuario:o}).pipe((0,i.K)(d=>(0,p.of)(d.error)))}putCategoriaProducto(o,r,t){return this.http.put(`${this.baseURL}/producto/categoria-producto/${r}`,{nueva_categoria:t,id_usuario:o}).pipe((0,i.K)(n=>(0,p.of)(n.error)))}putMasCategoriaProducto(o,r,t){return this.http.post(`${this.baseURL}/producto/categoria-producto/add/${r}`,{arregloCatalogo:t,id_usuario:o}).pipe((0,i.K)(n=>(0,p.of)(n.error)))}putMasInsumoProducto(o,r,t){return this.http.post(`${this.baseURL}/producto/insumo-producto/add/${r}`,{arregloInsumo:t,id_usuario:o}).pipe((0,i.K)(n=>(0,p.of)(n.error)))}putMasComboProducto(o,r,t){return this.http.post(`${this.baseURL}/producto/combo-producto/add/${r}`,{arregloProducto:t,id_usuario:o}).pipe((0,i.K)(n=>(0,p.of)(n.error)))}putMasPromoProducto(o,r,t){return this.http.post(`${this.baseURL}/producto/promo-producto/add/${r}`,{arregloProducto:t,id_usuario:o}).pipe((0,i.K)(n=>(0,p.of)(n.error)))}deleteInsumoProducto(o,r){return this.http.put(`${this.baseURL}/producto/insumo-producto/delete/${r}`,{id_usuario:o}).pipe((0,i.K)(s=>(0,p.of)(s.error)))}deleteComboProducto(o,r){return this.http.put(`${this.baseURL}/producto/combo-producto/delete/${r}`,{id_usuario:o}).pipe((0,i.K)(s=>(0,p.of)(s.error)))}deletePromoProducto(o,r){return this.http.put(`${this.baseURL}/producto/promo-producto/delete/${r}`,{id_usuario:o}).pipe((0,i.K)(s=>(0,p.of)(s.error)))}deleteCategoriaProducto(o,r){return this.http.put(`${this.baseURL}/producto/categoria-producto/delete/${r}`,{id_usuario:o}).pipe((0,i.K)(s=>(0,p.of)(s.error)))}}return u.\u0275fac=function(o){return new(o||u)(_.LFG(m.eN))},u.\u0275prov=_.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},9078:(U,R,a)=>{a.d(R,{K:()=>P});var i=a(529),p=a(8505),c=a(262),h=a(9646),_=a(2340),m=a(4650);let P=(()=>{class u{constructor(o){this.http=o,this.compra={ID:0,ID_PROVEEDOR:0,PROVEEDOR:"",TOTAL_PAGADO:0,FECHA:new Date,CREADO_POR:"",FECHA_CREACION:new Date,MODIFICADO_POR:"",FECHA_MODIFICACION:new Date,detalle:[]},this.detalleCompra=[],this.compras=[],this.baseURL=_.N.baseURL}getCompras(o,r,t,e){return r||(r=""),this.http.get(`${this.baseURL}/compra/?buscar=${r}&id_usuario=${o}&limite=${t||""}&desde=${e||""}`).pipe((0,p.b)(n=>{this.compras=n.compras}),(0,c.K)(n=>(0,h.of)(n.error.msg)))}getUnaCompra(o){return this.http.get(`${this.baseURL}/compra/${o}`).pipe((0,p.b)(t=>{this.compra=t.compra,this.detalleCompra=t.detalleCompra}),(0,c.K)(t=>(0,h.of)(t.error)))}postCompra(o,r,t,e){return this.http.post(`${this.baseURL}/compra/ingreso/insumos/`,{id_usuario:o,id_proveedor:r,arregloDetalle:t,total:e}).pipe((0,c.K)(d=>(0,h.of)(d.error)))}putMasInsumosEnDetalle(o,r,t){const e=(new i.WM).set("x-token",localStorage.getItem("token")||"");return this.http.post(`${this.baseURL}/compra/editar/ingreso/${t}`,{arregloDetalle:o,total:r},{headers:e}).pipe((0,c.K)(d=>(0,h.of)(d.error)))}putDetalle(o,r,t,e){const s=(new i.WM).set("x-token",localStorage.getItem("token")||"");return this.http.put(`${this.baseURL}/compra/editar/detalle/${o}`,{nuevo_insumo:r,nueva_cantidad:t,nuevo_precio:e},{headers:s}).pipe((0,c.K)(l=>(0,h.of)(l.error)))}deleteItemDetalle(o){const r=(new i.WM).set("x-token",localStorage.getItem("token")||"");return this.http.delete(`${this.baseURL}/compra/editar/detalle/${o}`,{headers:r}).pipe((0,c.K)(e=>(0,h.of)(e.error)))}putNombreProveedor(o,r,t){return this.http.put(`${this.baseURL}/compra/editar/proveedor/${r}`,{id_proveedor:o,uid:t}).pipe((0,c.K)(n=>(0,h.of)(n.error)))}anularCompra(o,r){return this.http.put(`${this.baseURL}/compra/anular/${o}`,{id_usuario:r}).pipe((0,c.K)(s=>(0,h.of)(s.error)))}getReporte(o=""){return this.http.post(`${this.baseURL}/compra/reporteria/compraInsumo`,{buscar:o},{responseType:"blob"}).pipe((0,c.K)(e=>(0,h.of)(e.error.msg)))}}return u.\u0275fac=function(o){return new(o||u)(m.LFG(i.eN))},u.\u0275prov=m.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},9962:(U,R,a)=>{a.d(R,{A:()=>P});var i=a(8505),p=a(262),c=a(9646),h=a(2340),_=a(4650),m=a(529);let P=(()=>{class u{constructor(o){this.http=o,this.insumo={ID:0,NOMBRE:"",ID_UNIDAD:0,UNIDAD_MEDIDA:"",CANTIDAD_MAXIMA:0,CANTIDAD_MINIMA:0,EXISTENCIA:0,ID_CREADO_POR:0,CREADO_POR:"",FECHA_CREACION:new Date,MODIFICACION_POR:"",FECHA_MODIFICACION:new Date},this.insumos=[],this.baseURL=h.N.baseURL}getInsumos(o,r,t,e){return r||(r=""),this.http.get(`${this.baseURL}/insumo/?buscar=${r}&quienBusco=${o}&limite=${t||""}&desde=${e||""}`).pipe((0,i.b)(n=>{this.insumos=n.insumos}),(0,p.K)(n=>(0,c.of)(n.error.msg)))}getInsumo(o){return this.http.get(`${this.baseURL}/insumo/${o}`).pipe((0,i.b)(t=>{this.insumo=t.insumo}),(0,p.K)(t=>(0,c.of)(t.error)))}postInsumo(o,r,t,e,s){return this.http.post(`${this.baseURL}/insumo/`,{nombre:o,id_unidad:r,cantidad_maxima:t,cantidad_minima:e,creado_por:s}).pipe((0,p.K)(l=>(0,c.of)(l.error)))}putInsumo(o,r,t,e,s,n){return this.http.put(`${this.baseURL}/insumo/${o}`,{nombre:t,id_unidad:e,cantidad_maxima:s,cantidad_minima:n,quienModifico:r}).pipe((0,p.K)(E=>(0,c.of)(E.error.msg)))}deleteInsumo(o,r){return this.http.delete(`${this.baseURL}/insumo/${o}?quienElimina=${r}`).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}getReporte(o=""){return this.http.post(`${this.baseURL}/insumo/reporteria/insumo`,{buscar:o},{responseType:"blob"}).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}}return u.\u0275fac=function(o){return new(o||u)(_.LFG(m.eN))},u.\u0275prov=_.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},8287:(U,R,a)=>{a.d(R,{z:()=>P});var i=a(262),p=a(9646),c=a(2340),h=a(8505),_=a(4650),m=a(529);let P=(()=>{class u{constructor(o){this.http=o,this.proveedores=[],this.proveedor={ID:0,NOMBRE:"",ID_DIRECCION:0,DETALLE:"",ID_MUNICIPIO:0,MUNICIPIO:"",ID_DEPARTAMENTO:0,DEPARTAMENTO:"",TELEFONO:"",CREADO_POR:"",FECHA_CREACION:new Date,MODIFICACION_POR:"",FECHA_MODIFICACION:new Date},this.baseURL=c.N.baseURL}getProveedores(o,r,t,e){return r||(r=""),this.http.get(`${this.baseURL}/proveedor/?buscar=${r}&quienBusco=${o}&limite=${t||""}&desde=${e||""}`).pipe((0,h.b)(n=>{this.proveedores=n.proveedores}),(0,i.K)(n=>(0,p.of)(n.error.msg)))}actualizarProveedor(o,r,t,e,s,n,d,l){return this.http.put(`${this.baseURL}/proveedor/actualizar-proveedor/${o}?id_usuario=${l}`,{nombre:r,direccion:t,id_direccion:e,id_departamento:s,id_municipio:n,telefono:d}).pipe((0,i.K)(I=>(0,p.of)(I.error.msg)))}crearProveedor(o,r,t,e,s){return this.http.post(`${this.baseURL}/proveedor/`,{nombre:o,id_municipio:r,detalle:t,telefono:e,id_usuario:s}).pipe((0,i.K)(l=>(0,p.of)(l.error.msg)))}eliminarRol(o,r){return this.http.delete(`${this.baseURL}/proveedor/${o}?quienElimina=${r}`).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}getUnProveedor(o){return this.http.get(`${this.baseURL}/proveedor/${o}`).pipe((0,h.b)(t=>{this.proveedor=t.proveedor}),(0,i.K)(t=>(0,p.of)(t.error)))}getReporte(o=""){return this.http.post(`${this.baseURL}/proveedor/reporteria/proveedor`,{buscar:o},{responseType:"blob"}).pipe((0,i.K)(e=>(0,p.of)(e.error.msg)))}}return u.\u0275fac=function(o){return new(o||u)(_.LFG(m.eN))},u.\u0275prov=_.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()},3387:(U,R,a)=>{a.d(R,{R:()=>P});var i=a(8505),p=a(262),c=a(9646),h=a(2340),_=a(4650),m=a(529);let P=(()=>{class u{constructor(o){this.http=o,this.unidad={ID:0,UNIDAD_MEDIDA:"",NOMBRE:""},this.unidades=[],this.baseURL=h.N.baseURL}getUnidades(o,r,t,e){return r||(r=""),this.http.get(`${this.baseURL}/unidad/?buscar=${r}&quienBusco=${o}&limite=${t||""}&desde=${e||""}`).pipe((0,i.b)(n=>{this.unidades=n.unidades}),(0,p.K)(n=>(0,c.of)(n.error.msg)))}getUnidad(o){return this.http.get(`${this.baseURL}/unidad/${o}`).pipe((0,i.b)(t=>{this.unidad=t.unidad}),(0,p.K)(t=>(0,c.of)(t.error)))}postUnidad(o,r,t){return this.http.post(`${this.baseURL}/unidad/`,{id_usuario:t,unidad_medida:o,nombre:r}).pipe((0,p.K)(n=>(0,c.of)(n.error)))}putUnidad(o,r,t,e){return this.http.put(`${this.baseURL}/unidad/actualizar-unidad/${o}`,{id_usuario:e,unidad_medida:r,nombre:t}).pipe((0,p.K)(d=>(0,c.of)(d.error.msg)))}deleteUnidad(o,r){return this.http.delete(`${this.baseURL}/unidad/${o}?quienElimina=${r}`).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}getReporte(o=""){return this.http.post(`${this.baseURL}/unidad/reporteria/unidad`,{buscar:o},{responseType:"blob"}).pipe((0,p.K)(e=>(0,c.of)(e.error.msg)))}}return u.\u0275fac=function(o){return new(o||u)(_.LFG(m.eN))},u.\u0275prov=_.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()}}]);