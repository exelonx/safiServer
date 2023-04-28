"use strict";(self.webpackChunksafiApp=self.webpackChunksafiApp||[]).push([[311],{2311:(z,d,a)=>{a.r(d),a.d(d,{NotificacionModule:()=>q});var s=a(6895),r=a(3060),i=a(4650),p=a(4936),m=a(7392),g=a(1572),u=a(9923);function x(n,t){if(1&n&&(i.TgZ(0,"div",11)(1,"div",5)(2,"h6",12)(3,"span",14),i._uU(4,"Empleado/a: "),i.qZA(),i._uU(5),i.ALo(6,"titlecase"),i.qZA()()()),2&n){const o=i.oxw(2);i.xp6(5),i.Oqu(i.lcZ(6,1,o.notificacion.RESPONSABLE))}}function v(n,t){if(1&n&&(i.TgZ(0,"div",11)(1,"div",5)(2,"h6",12)(3,"span",14),i._uU(4,"Insumo: "),i.qZA(),i._uU(5),i.ALo(6,"titlecase"),i.qZA()()()),2&n){const o=i.oxw(2);i.xp6(5),i.Oqu(i.lcZ(6,1,o.notificacion.INSUMO))}}function _(n,t){1&n&&(i.TgZ(0,"span",14),i._uU(1,"Motivo: "),i.qZA())}function N(n,t){1&n&&(i.TgZ(0,"span",14),i._uU(1,"Detalle: "),i.qZA())}function C(n,t){if(1&n){const o=i.EpF();i.TgZ(0,"div")(1,"div",1)(2,"div",2)(3,"button",3),i.NdJ("click",function(){i.CHM(o);const c=i.oxw();return i.KtG(c.cerrarNotificacion())}),i.qZA()(),i.TgZ(4,"mat-icon",4),i._uU(5),i.qZA(),i.TgZ(6,"div",5)(7,"h6",6),i._uU(8),i.qZA(),i.TgZ(9,"h6",7),i.ALo(10,"async"),i.ALo(11,"calcularTiempo"),i._UZ(12,"mat-spinner",8),i.qZA(),i.TgZ(13,"h6",9),i.ALo(14,"async"),i.ALo(15,"calcularTiempo"),i._uU(16),i.ALo(17,"async"),i.ALo(18,"calcularTiempo"),i.ALo(19,"date"),i.qZA()()(),i.YNc(20,x,7,3,"div",10),i.YNc(21,v,7,3,"div",10),i.TgZ(22,"div",11)(23,"div",5)(24,"h6",12),i.YNc(25,_,2,0,"span",13),i.YNc(26,N,2,0,"span",13),i._uU(27),i.qZA()()()()}if(2&n){const o=i.oxw();i.xp6(5),i.hij(" ","INVENTARIO"===o.notificacion.TIPO_NOTIFICACION?"inventory":"restaurant",""),i.xp6(3),i.Oqu(o.notificacion.ACCION),i.xp6(1),i.Q6J("ngClass",i.lcZ(10,11,i.lcZ(11,13,o.notificacion.TIEMPO_TRANSCURRIDO))?"visually-hidden":""),i.xp6(4),i.Q6J("ngClass",i.lcZ(14,15,i.lcZ(15,17,o.notificacion.TIEMPO_TRANSCURRIDO))?"":"visually-hidden"),i.xp6(3),i.AsE("",i.lcZ(17,19,i.lcZ(18,21,o.notificacion.TIEMPO_TRANSCURRIDO))," (",i.xi3(19,23,o.notificacion.TIEMPO_TRANSCURRIDO,"d/MMM/yy, h:mm a"),")"),i.xp6(4),i.Q6J("ngIf","PEDIDO"===o.notificacion.TIPO_NOTIFICACION),i.xp6(1),i.Q6J("ngIf","INVENTARIO"===o.notificacion.TIPO_NOTIFICACION),i.xp6(4),i.Q6J("ngIf","PEDIDO"===o.notificacion.TIPO_NOTIFICACION),i.xp6(1),i.Q6J("ngIf","INVENTARIO"===o.notificacion.TIPO_NOTIFICACION),i.xp6(1),i.Oqu(o.notificacion.DETALLE)}}let I=(()=>{class n{constructor(o,e,c){this.notificacionService=o,this.router=e,this.activatedRouter=c}ngOnInit(){this.cargarNotificacion()}cargarNotificacion(){let o="";this.routerSubs=this.activatedRouter.params.subscribe(e=>{o=e.notificacion,this.notificacionSubs=this.notificacionService.verNotificacion(o).subscribe(c=>{!0===c.ok?this.notificacion=c.notificacion:this.cerrarNotificacion()})})}cerrarNotificacion(){this.router.navigateByUrl("/main/notificaciones")}ngOnDestroy(){this.notificacionSubs&&this.notificacionSubs.unsubscribe(),this.routerSubs&&this.routerSubs.unsubscribe()}}return n.\u0275fac=function(o){return new(o||n)(i.Y36(p.A),i.Y36(r.F0),i.Y36(r.gz))},n.\u0275cmp=i.Xpm({type:n,selectors:[["app-notificacion"]],decls:1,vars:1,consts:[[4,"ngIf"],[1,"mb-2","pt-2"],[1,"position-relative"],["type","button","aria-label","Close",1,"btn-close","position-absolute","top-0","end-0","p-2","me-3","mt-3","rounded-5",2,"background-color","#d12609",3,"click"],["color","warn",1,"mt-2","iconoItemNotificacion",2,"font-size","45px"],[1,"mt-3","border-bottom"],[1,"text-break","fw-bold",2,"font-size","large"],[1,"text-break","col-2",2,"font-size","small",3,"ngClass"],["diameter","15.5"],[1,"text-break","text-secondary",2,"font-size","small",3,"ngClass"],["class","mb-2 mt-2",4,"ngIf"],[1,"mb-2","mt-2"],[1,"text-break","pb-1",2,"font-size","large"],["class","fw-semibold","style","color:#d12609 ;",4,"ngIf"],[1,"fw-semibold",2,"color","#d12609"]],template:function(o,e){1&o&&i.YNc(0,C,28,26,"div",0),2&o&&i.Q6J("ngIf",e.notificacion)},dependencies:[s.mk,s.O5,m.Hw,g.Ou,s.Ov,s.rS,s.uU,u.A],styles:[".btn-close[_ngcontent-%COMP%]{color:#fff;text-shadow:0 1px 0 #fff}"]}),n})();var T=a(4006),b=a(6518),O=a(4859),h=a(7296);function A(n,t){1&n&&(i.TgZ(0,"span"),i._uU(1,"Generando... "),i.qZA())}function Z(n,t){if(1&n&&(i.TgZ(0,"span",18),i._UZ(1,"mat-spinner",19),i.YNc(2,A,2,0,"span",20),i.qZA()),2&n){const o=i.oxw();i.xp6(1),i.Q6J("diameter",30),i.xp6(1),i.Q6J("ngIf",o.generando)}}function y(n,t){1&n&&i._UZ(0,"img",21)}function M(n,t){1&n&&(i.TgZ(0,"span",22),i._uU(1,"Generar reporte"),i.qZA())}function k(n,t){if(1&n&&(i.TgZ(0,"div",32)(1,"div",25)(2,"div",26),i._UZ(3,"mat-icon",33),i.qZA(),i.TgZ(4,"div",28)(5,"div",34),i._UZ(6,"h6",35)(7,"h6",36)(8,"h6",37),i.qZA()()()()),2&n){const o=i.oxw().$implicit;i.Gre("rounded my-1 ",o.VISTO?"visto":"noVisto","")}}function R(n,t){if(1&n){const o=i.EpF();i.ynx(0),i.YNc(1,k,9,3,"div",23),i.ALo(2,"async"),i.ALo(3,"calcularTiempo"),i.TgZ(4,"div",24),i.NdJ("click",function(){const l=i.CHM(o).index,f=i.oxw();return i.KtG(f.seleccionar(l))}),i.ALo(5,"async"),i.ALo(6,"calcularTiempo"),i.TgZ(7,"div",25)(8,"div",26)(9,"mat-icon",27),i._uU(10),i.qZA()(),i.TgZ(11,"div",28)(12,"div",29)(13,"h6",30),i._uU(14),i.qZA(),i.TgZ(15,"h6",31),i._uU(16),i.ALo(17,"async"),i.ALo(18,"calcularTiempo"),i.qZA()()()()(),i.BQk()}if(2&n){const o=t.$implicit;i.xp6(1),i.Q6J("ngIf",!i.lcZ(2,9,i.lcZ(3,11,o.TIEMPO_TRANSCURRIDO))),i.xp6(3),i.Gre("rounded my-1 itemNotificacion ",o.VISTO?"visto":"noVisto",""),i.s9C("routerLink",o.ID),i.Q6J("ngClass",i.lcZ(5,13,i.lcZ(6,15,o.TIEMPO_TRANSCURRIDO))?"":"visually-hidden"),i.xp6(6),i.hij(" ","INVENTARIO"===o.TIPO_NOTIFICACION?"inventory":"restaurant",""),i.xp6(4),i.hij(" ",o.ACCION,""),i.xp6(2),i.hij(" ",i.lcZ(17,17,i.lcZ(18,19,o.TIEMPO_TRANSCURRIDO))," ")}}function S(n,t){1&n&&(i.TgZ(0,"div",38)(1,"mat-icon",39),i._uU(2,"info_outline"),i.qZA(),i.TgZ(3,"strong",40),i._uU(4,"No tienes notificaciones"),i.qZA()())}function w(n,t){1&n&&(i.ynx(0),i.TgZ(1,"div",41),i._UZ(2,"router-outlet")(3,"img",42),i.qZA(),i.BQk())}function P(n,t){1&n&&(i.TgZ(0,"div",41)(1,"div",43)(2,"h4"),i._uU(3,"Seleccione una notificaci\xf3n de la lista para ver m\xe1s detalles"),i.qZA()(),i._UZ(4,"img",42),i.qZA())}const U=[{path:"",component:(()=>{class n{constructor(o,e,c,l){this.notificacionService=o,this.fb=e,this.router=c,this.authServices=l,this.notificacionCargada=!1,this.generando=!1,c.events.subscribe(f=>{f instanceof r.m2&&(this.notificacionCargada=f.url.includes("notificaciones/"))})}get notificaciones(){return this.notificacionService.notificaciones}nueva(){new Date}ngOnInit(){}ngOnDestroy(){this.lazyLoad&&this.lazyLoad.unsubscribe()}notificacionesLazyLoading(){this.lazyLoad=this.notificacionService.lazyLoadNotificaciones(this.notificaciones.length).subscribe()}seleccionar(o){this.notificaciones[o].VISTO||(this.notificaciones[o].VISTO=!0)}generarReporte(){this.generando||(this.generando=!0,this.notificacionService.getReporte(this.authServices.usuario.id_usuario).subscribe(e=>{let c=new Blob([e],{type:"application/pdf"}),l=window.URL.createObjectURL(c);document.createElement("a").href=l,window.open(l,"_blank"),this.generando=!1}))}}return n.\u0275fac=function(o){return new(o||n)(i.Y36(p.A),i.Y36(T.qu),i.Y36(r.F0),i.Y36(b.e))},n.\u0275cmp=i.Xpm({type:n,selectors:[["app-notificaciones"]],decls:21,vars:10,consts:[[1,""],["id","titulo"],[1,"container-md","px-0","pb-5"],[1,"card","text-bg-dark","border-light","border-0","rounded-4","shadow"],[1,"card-header","bg-transparent"],[1,"d-flex","flex-wrap","justify-content-between","align-items-center"],["mat-flat-button","","type","button",1,"me-3","btn-p","mb-2",3,"ngClass","click"],["class","d-flex  align-items-center justify-content-center",4,"ngIf"],["src","/assets/icons/pdf.png ","width","30px","height","30px","class","me-3",4,"ngIf"],["id","generarReporte",4,"ngIf"],[1,"card-body","my-0","py-0",2,"padding-left","11px","padding-right","11px"],[1,"row"],["infiniteScroll","",1,"rounded-4","col-xxl-2","col-xl-3","col-lg-4","col-md-5","col-12","panel-noti-responsive","overflow-auto","px-1",3,"infiniteScrollDistance","scrollWindow","scrolled"],[4,"ngFor","ngForOf"],["class","d-flex flex-column align-items-center justify-content-center text-bg-dark rounded-4","style","height: 100%;",4,"ngIf"],["id","cargarNoti",1,"col-xxl-10","col-xl-9","col-lg-8","col-md-7","col-12",2,"background-color","#e7e7e7","color","black","border-bottom-right-radius","13px"],[4,"ngIf","ngIfElse"],["noCargada",""],[1,"d-flex","align-items-center","justify-content-center"],[1,"me-3","uploader-status",3,"diameter"],[4,"ngIf"],["src","/assets/icons/pdf.png ","width","30px","height","30px",1,"me-3"],["id","generarReporte"],["id","listaNoti",3,"class",4,"ngIf"],["routerLinkActive","itemSeleccionado",3,"ngClass","routerLink","click"],[1,"row","pt-2","mx-0"],[1,"col-2"],["color","warn","routerLinkActive","itemSeleccionado",1,"mt-2","iconoItemNotificacion"],[1,"col"],[1,"d-flex","flex-column"],["routerLinkActive","itemSeleccionado",1,"fw-semibold","text-break","textItemNotificacion",2,"font-size","small","color","black"],["routerLinkActive","itemSeleccionado",1,"fw-semibold","text-break","textItemNotificacion",2,"font-size","x-small","color","#d12609"],["id","listaNoti"],["color","warn",1,"mt-2","placeholder"],[1,"d-flex","flex-column","placeholder-glow"],[1,"fw-semibold","text-break","placeholder","col-11",2,"font-size","small","color","black"],[1,"fw-semibold","text-break","placeholder","col-6",2,"font-size","small","color","black"],[1,"fw-semibold","text-break","placeholder","col-4",2,"font-size","x-small","color","#d12609"],[1,"d-flex","flex-column","align-items-center","justify-content-center","text-bg-dark","rounded-4",2,"height","100%"],["id","iconBlock"],[1,"fw-normal","text-light","ms-2"],[1,"position-relative","h-100"],["src","./../../../../../assets/img/DrBurgerCBGW.svg","width","45%","alt","",1,"noselect","position-absolute","top-50","start-50","translate-middle","hidden-767",2,"opacity","0.05","pointer-events","none"],[1,"d-flex","justify-content-center"]],template:function(o,e){if(1&o&&(i.TgZ(0,"div",0)(1,"h3",1),i._uU(2,"Centro de Notificaciones"),i.qZA(),i.TgZ(3,"div",2)(4,"div",3)(5,"div",4)(6,"div",5)(7,"button",6),i.NdJ("click",function(){return e.generarReporte()}),i.YNc(8,Z,3,2,"span",7),i.YNc(9,y,1,0,"img",8),i.YNc(10,M,2,0,"span",9),i.qZA()()(),i.TgZ(11,"div",10)(12,"div",11)(13,"div",12),i.NdJ("scrolled",function(){return e.notificacionesLazyLoading()}),i.TgZ(14,"div",0),i.YNc(15,R,19,21,"ng-container",13),i.qZA(),i.YNc(16,S,5,0,"div",14),i.qZA(),i.TgZ(17,"div",15),i.YNc(18,w,4,0,"ng-container",16),i.YNc(19,P,5,0,"ng-template",null,17,i.W1O),i.qZA()()()()()()),2&o){const c=i.MAs(20);i.xp6(7),i.Q6J("ngClass",e.generando?"d-flex align-items-center":""),i.xp6(1),i.Q6J("ngIf",e.generando),i.xp6(1),i.Q6J("ngIf",!e.generando),i.xp6(1),i.Q6J("ngIf",!e.generando),i.xp6(3),i.Q6J("infiniteScrollDistance",0)("scrollWindow",!1),i.xp6(2),i.Q6J("ngForOf",e.notificaciones),i.xp6(1),i.Q6J("ngIf",0===e.notificaciones.length),i.xp6(2),i.Q6J("ngIf",e.notificacionCargada)("ngIfElse",c)}},dependencies:[s.mk,s.sg,s.O5,r.lC,r.rH,r.Od,O.lW,m.Hw,g.Ou,h.Ry,s.Ov,u.A],styles:['@import"https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined";html[_ngcontent-%COMP%]{background-color:red}@media (max-width:500px){.panel-noti-responsive[_ngcontent-%COMP%]{max-height:200px!important}}.panel-noti-responsive[_ngcontent-%COMP%]{height:500px}.noselect[_ngcontent-%COMP%]{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.btn-p[_ngcontent-%COMP%]{border-radius:10px;background-color:#d12609!important;font-size:1rem;font-weight:400;min-height:3.125rem;border:none;cursor:pointer;transition:.3s ease all}.btn-p[_ngcontent-%COMP%]:hover{background-color:#ff2600!important;border:0}#contenedor[_ngcontent-%COMP%]{background-color:#212529}h3[_ngcontent-%COMP%]{text-align:center;padding:15px;font-weight:400;font-family:Lobster Two,cursive;font-size:45px;margin-bottom:0%}@media (max-width:767px){.panel-noti-responsive[_ngcontent-%COMP%]{max-height:300px}.hidden-767[_ngcontent-%COMP%]{display:none}}.itemNotificacion[_ngcontent-%COMP%]:hover   .iconoItemNotificacion[_ngcontent-%COMP%], .itemNotificacion[_ngcontent-%COMP%]:hover   .textItemNotificacion[_ngcontent-%COMP%], .itemNotificacion[_ngcontent-%COMP%]:hover{background-color:#ff2600!important;color:#fff!important}.itemSeleccionado[_ngcontent-%COMP%]{background-color:#d12609!important;color:#fff!important}.noVisto[_ngcontent-%COMP%]{background-color:#fff}.visto[_ngcontent-%COMP%]{background-color:#ccc}[_nghost-%COMP%]     .mat-progress-spinner circle, .mat-spinner[_ngcontent-%COMP%]   circle[_ngcontent-%COMP%]{stroke:#fff}']}),n})(),children:[{path:":notificacion",component:I}]}];let L=(()=>{class n{}return n.\u0275fac=function(o){return new(o||n)},n.\u0275mod=i.oAB({type:n}),n.\u0275inj=i.cJS({imports:[r.Bz.forChild(U),r.Bz]}),n})();var E=a(5011),J=a(6368);let q=(()=>{class n{}return n.\u0275fac=function(o){return new(o||n)},n.\u0275mod=i.oAB({type:n}),n.\u0275inj=i.cJS({imports:[s.ez,L,E.i,J.D,h.Rq]}),n})()}}]);