-- Inserta los apuntes de Jaivaná directamente en PostgreSQL.
-- Ejecutar con la app arrancada al menos una vez (para que exista la tabla jaivana_notas), por ejemplo:
--   psql -U postgres -d boveda_jira -f insertar_jaivana.sql
BEGIN;

INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'https://facturacionelectronica.jaivana.co/#/LoginSuperAdmin', $q$https://facturacionelectronica.jaivana.co/#/LoginSuperAdmin
APUNTES JAIVANA-SOPORTE$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Notas Jaivana', $q$Notas Jaivana$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ese número de la dev lo va a buscar en la tabla dfacturac con el campo…', $q$ese número de la dev lo va a buscar en la tabla dfacturac con el campo numero y se busca el campo pedido y con ese número se va y lo busca en la tabla de items con el campo numero y buscar el codigo del articulo que reportan esta repetido en la tabla de itemfc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Consultar factura sin codigo qr y que no se ha enviado a la dian factu…', $q$Consultar factura sin codigo qr y que no se ha enviado a la dian facturac$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Query redondeos, cuando ', $q$Query redondeos, cuando $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ENVIAR FACTURAS A LA DIAN ', $q$ENVIAR FACTURAS A LA DIAN $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '* update itemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where …', $q$* update itemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where numero in ('178421') and codigo_sucursal ='0101';
update facturac set iva= (select sum(total_iva) from itemfc where numero in ('178421') and codigo_sucursal ='0101') where numero='178421' and codigo_sucursal ='0101';
update factura set iva= round(iva, 2) where numero in ('178421') and codigo_sucursal ='0101';
update facturac set valor=round((iva+basee+baseg)-valor_rete_iva) where numero in ('178421') and codigo_sucursal ='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update itemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where nu…', $q$update itemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where numero= 'AF-485945' and codigo_sucursal ='0101'  and  fecha='2021-08-31';
update facturac set iva= (select sum(total_iva) from itemfc where numero='AF-485945' and codigo_sucursal ='0101' ) where numero='AF-485945' and codigo_sucursal ='0101'  and  fecha='2021-08-31';
update facturac set iva= round(iva, 2) where numero='AF-485945' and codigo_sucursal ='0101'  and  fecha='2021-08-31';
update facturac set valor=round(iva+basee+baseg) where numero='AF-485945' and codigo_sucursal ='0101'  and  fecha='2021-08-31';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update facturac set iva= (select sum(total_iva) from itemfc where nume…', $q$update facturac set iva= (select sum(total_iva) from itemfc where numero='CR-806868' and codigo_sucursal ='0101') where numero='CR-806868' and codigo_sucursal ='0101';
update facturac set iva= round(iva, 2) where numero='CR-806868' and codigo_sucursal ='0101';
update facturac set retencion= round((select ((sum(total_sin_iva)) * (retencion/100)) from itemfc where numero='CR-806868' and codigo_sucursal ='0101' group by retencion),0) where numero='CR-806868' and codigo_sucursal ='0101';
update facturac set valor_rete_iva=(iva * (tarifa_rete_iva/100)) where numero='CR-806868' and codigo_sucursal ='0101'
update facturac set valor=round((iva+basee+baseg+impoconsumo)-(valor_rete_iva)-(retencion)) where numero='CR-806868' and codigo_sucursal ='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PARA FACTURAS QUE NO TENGAN RETENCION ', $q$PARA FACTURAS QUE NO TENGAN RETENCION $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'response_consulta', $q$response_consulta	
Regla: FAS02, Rechazo: (R) Valor total de un tributo no corresponde a la suma de todas las informaciones correspondientes a cada una de las tarifas informadas en este documento para este tributoRegla: RUT01, Notificación: La validación del estado del RUT próximamente estará disponible.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update itemfc set total_iva = (total_sin_iva *(tarifa_iva / 100)) wher…', $q$update itemfc
set total_iva = (total_sin_iva *(tarifa_iva / 100))
where numero in ('FEP-11377')
    and codigo_sucursal = '0001';
update facturac
set iva = (
        select sum(total_iva)
        from itemfcwras
        where numero in ('FEP-11377')
            and codigo_sucursal = '0001'
    )
where numero = 'FEP-11377'
    and codigo_sucursal = '0001';
update facturac
set iva = round(iva, 2)
where numero in ('FEP-11377')
    and codigo_sucursal = '0001';
update facturac
set valor = round((iva + basee + baseg) - valor_rete_iva)
where numero in ('FEP-11377')
    and codigo_sucursal = '0001';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'DEVOLCIONES QUE NO APARECEN EL EL RUT', $q$DEVOLCIONES QUE NO APARECEN EL EL RUT$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where n…', $q$update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where numero in ('18728') and codigo_sucursal ='0101';
update dfacturac set iva= (select sum(total_iva) from itemfc where numero in ('18728') and codigo_sucursal ='0101') where numero='18728' and codigo_sucursal ='0101';
update dfacturac set iva= round(iva, 1) where numero in ('18728') and codigo_sucursal ='0101';
update dfacturac set valor=round((iva+basee+baseg)-valor_rete_iva) where numero in ('18728') and codigo_sucursal ='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where n…', $q$update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where numero='281' and codigo_sucursal='0101';
update dfacturac set iva= (select sum(total_iva) from ditemfc where numero='281' and codigo_sucursal='0101')
where numero='281' and codigo_sucursal='0101';
update dfacturac set iva= round(iva) where numero='281' and codigo_sucursal='0101';
update dfacturac set valor=round(iva+basee+baseg) where numero='281' and codigo_sucursal='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where n…', $q$update ditemfc set total_iva= (total_sin_iva*(tarifa_iva/100)) where numero='18728' and codigo_sucursal='0101';
update dfacturac set iva= (select sum(total_iva) from ditemfc where numero='18728' and codigo_sucursal='0101')
where numero='18728' and codigo_sucursal='0101';
update dfacturac set iva= round(iva) where numero='18728' and codigo_sucursal='0101';
update dfacturac set valor=round(iva+basee+baseg) where numero='18728' and codigo_sucursal='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select * from nitsx_sedes where nit=''86007336''  update nitsx_sedes set…', $q$select * from nitsx_sedes where nit='86007336' 
update nitsx_sedes set verifica ='4'
where nit='86007336' $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CAMBIO DE CUENTA DE PROVEEDOR', $q$CAMBIO DE CUENTA DE PROVEEDOR
Buenos días,
Solicito de tu colaboración que al momento de crear un nuevo tercero, la cuenta de manejo de proveedores sea “22050100”
Porque todas se están yendo a la cuenta de proveedores del exterior.
select * from  nitsx_sedes where nit='1053845489' and contablep='22050100'
update nitsx_sedes set contablep='22050100'
where nit='1053845489'
MODIFICAR SI SE ENVIA FACTURA ELECTRONICA 
Para solucionar este ticket se debe validar lo siguiente en la tabla nitsx_sedes campo maneja factura electrónica si esta en N se debe poner en S de los terceros que nos enviaron.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select nit,recibe_factura_electronica,nombre from  nitsx_sedes where n…', $q$select nit,recibe_factura_electronica,nombre from  nitsx_sedes where nit='800146425' 
or nit='901077701'or nit='900380791'or nit='800243145'or nit='1114887015'or nit='810005564'
or nit='810000132'or nit='890101138'or nit='810003317'or nit='900034170'or nit='890101138'
or nit='810004266'or nit='4543816'or nit='900309493'or nit='900467677'or nit='800042725'
or nit='900263330'or nit='810002601'or nit='901613800'or nit='900327889'or nit='10277236'
or nit='890101676'or nit='4543816'or nit='1017250003'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update  nitsx_sedes set recibe_factura_electronica=''S'' where nit=''8001…', $q$update  nitsx_sedes set recibe_factura_electronica='S'
where nit='800146425' 
or nit='901077701'or nit='900380791'or nit='800243145'or nit='1114887015'or nit='810005564'
or nit='810000132'or nit='890101138'or nit='810003317'or nit='900034170'or nit='890101138'
or nit='810004266'or nit='4543816'or nit='900309493'or nit='900467677'or nit='800042725'
or nit='900263330'or nit='810002601'or nit='901613800'or nit='900327889'or nit='10277236'
or nit='890101676'or nit='4543816'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'or nit=''1017250003''', $q$or nit='1017250003'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'Muy buenas tardes', $q$Muy buenas tardes
Se solicita que los Items (Artículos) de Jaivaná todos sean configurados como servicios y no manejen saldos.
Muchas gracias
en la tabla articulo es cambiar el campo manejacantidad que debe estar en S pasarlo a N y deja $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'Buenos dias,', $q$Buenos dias,
La factura FE198 a nombre de Doralba Lopez con cc 25213030, no registra en pagos pero si registra en contabilidad, agradecemos su revisión para sacarlo del sistema
para este es revisar ese documento en ,la tabla de movimiento2023 y mirar el campo documento_fuente y con ese numero ir a la tabla de cartera_proveedores y buscarlo en caso de que no este debe agregarlo $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select * from cartera_proveedores where nit=''25213030'' and numero in (…', $q$select * from cartera_proveedores where nit='25213030' and numero in ('FE198','FE109')
update cartera_proveedores set contable='23354001'
where numero='FE198'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'CLONACION PARA LOS USUARIOS', $q$CLONACION PARA LOS USUARIOS
para la creacion de usuarios 1)  pantallas aut 3) usuarios roles 4) si es vendedor verificar en la tablavendedoresx$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'CLONACION PARA LOS USUARIOS', $q$CLONACION PARA LOS USUARIOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Insert into  usuarios(codigo,nombre,estado,alias,psw,psw2,supervisor,v…', $q$Insert into 
usuarios(codigo,nombre,estado,alias,psw,psw2,supervisor,vendedor,cvendedor,cautorizacion,ver_margen,codigo_facturacion,		
codigo_sucursal,cheque_devuelto,nivel_autorizacion,bodega,role,fecha_cambio_clave,dias_avisar_cambio_clave,email,sucursal_configuracion,origen)
(SELECT 'wmm','WILLIAM MOSQUERA','A',alias,'4567','4567',supervisor,vendedor,cvendedor,cautorizacion,ver_margen,codigo_facturacion,
codigo_sucursal,cheque_devuelto,nivel_autorizacion,bodega,role,fecha_cambio_clave,dias_avisar_cambio_clave,'externocali6@sumatec.co',sucursal_configuracion,origen from usuarios WHERE CODIGO='apg')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CLONAR VENDEDOR', $q$CLONAR VENDEDOR
INSERT INTO VENDEDORESX (codigo_vendedor,nombre,estado,codigo_sucursal,codigo_bodega,codigo_facturacion,sucursal_origen
sucursal_cartera,cedula,tipo,sucursal)
(select 'MAPR','MARTIN ALBERTO PINZON ROBLES',estado,codigo_sucursal,codigo_bodega,codigo_facturacion,sucursal_origen
sucursal_cartera,'8-298-747',tipo,sucursal from VENDEDORESX WHERE CODIGO_VENDEDOR='AODR')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'AUTORIZACION DE PANTALLAS', $q$AUTORIZACION DE PANTALLAS
select * from usuarios where codigo in ('osa','ysfa')
select * from pantallas_autorizadas where codigou='ysfa'
select * from usuarios_roles where usuario_id in('3239')
select * from usuario_pmv si es costarica$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'POR SI SON CAJERAS ', $q$POR SI SON CAJERAS $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', '     insert into impresoras_usuarios (usuario,nombre_recurso) values (…', $q$     insert into impresoras_usuarios (usuario,nombre_recurso) values ('mptl','caja_laser')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'usuarios_codigos_facturacion (usuario_id,codigo_facturacion) values (''…', $q$usuarios_codigos_facturacion (usuario_id,codigo_facturacion) values ('198','0001')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'CLONAR PERMISOS ESCRITORIO', $q$CLONAR PERMISOS ESCRITORIO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'insert into pantallas_autorizadas(codigop,codigou)(select distinct cod…', $q$insert into pantallas_autorizadas(codigop,codigou)(select distinct codigop, 'nuevo'
from pantallas_autorizadas where codigou='clonar' and codigop not in (select codigop from pantallas_autorizadas where codigou='nuevo'))$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'CLONAR PERMISOS_JAIVANA WEB', $q$CLONAR PERMISOS_JAIVANA WEB$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'insert into usuarios_roles (usuario_id, roles_permisos_id) select dist…', $q$insert into usuarios_roles (usuario_id, roles_permisos_id)
select distinct
(select id from usuarios where codigo = nuevo),ur.roles_permisos_id
from usuarios_roles ur where ur.usuario_id in (select id from usuarios where codigo = clonar)
and ur.roles_permisos_id not in (select roles_permisos_id from usuarios_roles where usuario_id in (
select id from usuarios  where codigo = nuevo));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'CLONAR SI ES DE CONTABILIDAD', $q$CLONAR SI ES DE CONTABILIDAD
insert into campos_modificables_usuario (codigo_usuario,nombre_campo)(select distinct 'nuevo',nombre_campo
from campos_modificables_usuario  where codigo_usuario='clonar' 
and nombre_campo not in (select nombre_campo from campos_modificables_usuario where codigo_usuario='nuevo'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'todo depende si es asesor int o ext 0 es creditos, si es facturador no…', $q$todo depende si es asesor int o ext 0 es creditos, si es facturador no olvidar agregar el id y codigo de facturación en usuarios permisos facturación , usuarios aut descuento$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'DROP TABLE tmp_pantallas; select * into  tmp_pantallas    from  pantal…', $q$DROP TABLE tmp_pantallas;
select * into  tmp_pantallas    from  pantallas_autorizadas  where  codigou='pahh' ;
update tmp_pantallas set codigou='yamc';
--select *  from  tmp_pantallas
insert into pantallas_autorizadas (select *  from  tmp_pantallas); $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CAJA O FACTURAR', $q$CAJA O FACTURAR
select * from usuarios_codigos_facturacion where usuario_id in(3106)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '-! HABILITAR UNA BODEGA PARA FACTURAR', $q$-! HABILITAR UNA BODEGA PARA FACTURAR$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--? Se busca la bodega para extraer el código si no lo mandaron select…', $q$--? Se busca la bodega para extraer el código si no lo mandaron
select * from bodegas where nombre ilike '%EXHIBICION%'
--? Se ingresa la bodega en los siguientes campos
select * from facturaciones where codigo_sucursal='0112' --* bodegas_mostrar <- Para mostrarlas cuando se va a realizar pedidos
                                                         --* bodegas_autorizadas <- Para autorizarla para facturar
--? Se coloca en "S" el siguiente campo
select * from bodegas where codigo_bodega='80' --* transito='S' <- Para que ellos la puedan ver al momento de facturar
--? Se ingresa la bodega en los siguientes campos
select * from configuracion_xml where sucursal='0112' and categoria ilike '%pedidos%' --* bodegas_autorizadas_picking
--* Para verificar que haya quedado, ingresamos a Jaivaná a montar un pedidos y cuando vamos a
--* ingresar los items cambiamos el código de la bodega para verificar que si pueda seleccionarse$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'DEVOLUCIONES QUE NO APARECIAN LOS NUMERO', $q$ DEVOLUCIONES QUE NO APARECIAN LOS NUMERO
seguir mañana
SELECT * FROM public.dfacturac
WHERE fecha='2023-07-10'  
    AND codigo_sucursal = '0112'
ORDER BY hora ASC 
se deben validar los numeros que estan en null y anexar el numero a dfactrac e ditemc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from dfacturac where nit=''900612501'' and numero=''15578'' selec…', $q$select * from dfacturac where nit='900612501' and numero='15578'
select * from dfacturac where nit='900612501' and numero='15578'
select * from dfacturac where nit='800103090' and numero='15579'
select * from dfacturac where nit='900246196' and numero='15580'
select * from dfacturac where nit='900273253' and numero='15581'
select * from dfacturac where nit='830113630' and numero='15582'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update dfacturac set numero=''15582'' where nit=''830113630'' or pedido=''A…', $q$update dfacturac set numero='15582'
where nit='830113630' or pedido='AN-486894'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from ditemfc where numero=''15578'' and nit=''900612501'' select …', $q$select * from ditemfc where numero='15578' and nit='900612501'
select * from ditemfc where numero='15579' and nit='800103090'
select * from ditemfc where numero='15580' and nit='900246196'
select * from ditemfc where numero='15581' and nit='900273253'
select * from ditemfc where numero='15582' and nit='830113630' $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update ditemfc set numero=''15582'' where nit=''830113630'' and valor_item…', $q$update ditemfc set numero='15582'
where nit='830113630' and valor_item='618800' or valor_item='1297695'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ACUSE', $q$ACUSE 
se deben validar las tablas de documentos_recibidos y documentos pendientes si no se encuentra la solucion se debe mirar en funciones xml y depues y borrar los numeros del id y siempre se debe guardar el cufe para despues descargarlos de jaivana$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--select * from documentos_recibidos  update documentos_recibidos set …', $q$--select * from documentos_recibidos 
update documentos_recibidos set estado_acuse_dian='.' and estado_acuse_dian
where numero_documento in (‘'FCCP59252' ,'FEV146503','FEV146653,'FEV146849','FEV146850',
  'FEV146677', '518912', '19781', 'FCCP59404', 'FVE6272', 'FEP11391', '518960', 'BFCR61701',
  'DRG228654', 'IEN16001', 'T0Y33786','DRG228471','D1836','2732','DRG228465', 'BFCR61424',
   'BFCR61735', 'EJ715', 'CD164740', 'SN310454', 'SN310637', 'BFCR61814', 'ENV264136', 'CD165166',
   'NCV4445', 'CDNE14141')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--select * from documentos_pendientes where numero_documento ''FCCP5925…', $q$--select * from documentos_pendientes where numero_documento 'FCCP59252'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--select * from documentos_recibidos  update documentos_recibidos set …', $q$--select * from documentos_recibidos 
update documentos_recibidos set estado_enviada='.'
where numero_documento in ('FCCP59252','FEV146503', 'FEV146653','FEV146849','FEV146850',
  'FEV146677', '518912', '19781', 'FCCP59404', 'FVE6272', 'FEP11391', '518960', 'BFCR61701'
  'DRG228654','IEN16001','T0Y33786','DRG228471','D1836','2732','DRG228465','BFCR61424',
  'BFCR61735', 'EJ715', 'CD164740', 'SN310454', 'SN310637', 'BFCR61814', 'ENV264136', 'CD165166',
  'NCV4445', 'CDNE14141', 'FEV147367')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'VALIDAR ACUSE DIAN', $q$VALIDAR ACUSE DIAN$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select validar_xml_recibido()', $q$select validar_xml_recibido()$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select *from  documentos_pendientes where numero_documento=''56390''', $q$select *from  documentos_pendientes where numero_documento='56390'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update dfacturac set cufe=''.'', qr=''.''  where   numero  in (''56390'') an…', $q$update dfacturac set cufe='.', qr='.' 
where   numero  in ('56390') and nit='901552942' and  fecha='2023-07-11'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'ACTUALIZACION DE DATOS DESDE EXCEL', $q$ACTUALIZACION DE DATOS DESDE EXCEL 
update cartera_clientes set contable='28050501' where numero='A-47173' and nit='10283204' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-47995' and nit='901258022' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-49253' and nit='2515474' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-47429' and nit='901359696' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-49309' and nit='1098661171' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48818' and nit='901381905' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-45306' and nit='900700393' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48558' and nit='901382079' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-45097' and nit='900410030' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-47363' and nit='830011167' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48242' and nit='901127309' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48978' and nit='891304849' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48155' and nit='900205979' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-46378' and nit='900667421' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='1' and nit='901079370' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-46914' and nit='901178584' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-46922' and nit='900496988' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-47514' and nit='890903475' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-49260' and nit='860059441' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-48228' and nit='900033279' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='A-49095' and nit='900421604' and contable='13050501';
update cartera_clientes set contable='28050501' where numero='NCC-4347' and nit='860001899' and contable='13050501';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select * from cartera_clientes where contable=''28050501''', $q$select * from cartera_clientes where contable='28050501'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT * FROM producto INNER JOIN origen ON producto.id_producto = ori…', $q$SELECT * FROM producto INNER JOIN origen ON producto.id_producto = origen.id_producto;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT * FROM producto LEFT JOIN origen ON producto.id_producto = orig…', $q$SELECT * FROM producto LEFT JOIN origen ON producto.id_producto = origen.id_producto;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT * FROM producto RIGHT JOIN origen ON producto.id_producto = ori…', $q$SELECT * FROM producto RIGHT JOIN origen ON producto.id_producto = origen.id_producto;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'CAMBIAR CUENTAS DE COSTOS', $q$CAMBIAR CUENTAS DE COSTOS 
Solicito de tu colaboración cambiando la cuenta de las ventas de contado que suben del centro de costo 1124 porque se está cargando a la cuenta 11100508 banco de occidente y deben ingresar a la cuenta 11100503 banco BBVA.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'solucion', $q$solucion 
ellos le estan pidiendo es q configure la cuenta
cuando suba la interface
usted q va hacer va revisar la tabla que se llama tipo_producto_configuracion
ahi busca por el campo cuenta1
la cuenta que le estan diciendo mijo
la mala y si existe la cambia por la buena y ya
pero no movemos nada en contabilidad$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select * from tipos_productos_configuracion where cuenta_1=''11100503'' …', $q$select * from tipos_productos_configuracion where cuenta_1='11100503' and sucursal='1124'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'update tipos_productos_configuracion set cuenta_1=''11100503'' where cue…', $q$update tipos_productos_configuracion set cuenta_1='11100503'
where cuenta_1='11100508' and sucursal='1124' $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'eliminar pedidos primero se elimina de pedidos el numero  se elimina a…', $q$eliminar pedidos primero se elimina de pedidos el numero  se elimina actualizando, estado y estado real
depues de modificar esos campos, se debe de ir a items pedido y eliminar estado real $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from items_pedidos where numero=''119654''', $q$select * from items_pedidos where numero='119654'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update items_pedidos set estado_real=''00'' where numero=''119654''', $q$update items_pedidos set estado_real='00'
where numero='119654'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'facturas que se saltan el consecutivo se revisa en facturac, items, y en cartera_Cliente', $q$facturas que se saltan el consecutivo se revisa en facturac, items, y en cartera_Cliente
y siempre se agrega en cero$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac where numero in (''FECC-24379'') select * from it…', $q$select * from facturac where numero in ('FECC-24379')
select * from itemfc where numero in ('FECC-24379')
select * from cartera_clientes where numero in ('FECC-24379')
select * from movimiento2023 where numero_documento in ('FECC-24379')
select * from log_costos where numero_documento in ('FECC-24379')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SOLUCION', $q$SOLUCION$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into facturac (fecha,nit,sede,vence,valor,baseg,basee,iva,descu…', $q$insert into facturac (fecha,nit,sede,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,desc1,desc2,desc3,fecha1,fecha2,fecha3,pedido,bodega,estado,
    hora,numero,aproxima,imp01,imp02,tipo,contable,vendedor,peso,ruta,ciudad,costo,costo1,telefonico,nproveedor,desc4,trasmite,observa,codigo_facturacion,codigo_sucursal,
    h_sistema,sucursal_origen,sucursal_cartera,usuario,fecha_sistema,factor,imp04,impoconsumo,valor_rete_iva,tarifa_rete_iva,ciudad_entrega,direccion_entrega,dateresponse,
    cufe,qr,enviada,fecha_envio,respuesta,bolsas,tarifa_bolsas,aviso_de_recibo,orden_de_compra,tipo_moneda,facturacion_contingencia,resolucion_dian,respuesta_servidor_propio,
    response_enviada,response_consulta,consulta,costo_promedio,zip_key,factura_json_envio,factura_json_respuesta,cliente_requiere_factura_electronica,dian_nit,dian_documento,
	dian_valor_sin_iva,nempresa,valor_atencion)
   (select 
    fecha, nit, sede, vence,'0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, fletepor, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, 
    fecha1, fecha2, fecha3, '0', bodega, estado, hora,regexp_replace(numero, '[0-9]', '', 'g') || ((regexp_replace(numero, '[^0-9]', '', 'g'))::integer + 1)::text,
    '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, tipo, '*', vendedor, '0.00'::numeric, ruta, ciudad, '0.00'::numeric, '0.00'::numeric, telefonico, nproveedor, '0.00'::numeric, 
    trasmite, 'consecutivo se deja en ceros porque se saltó', codigo_facturacion, codigo_sucursal, h_sistema, sucursal_origen, sucursal_cartera, usuario, fecha_sistema, factor, 
    '0.00'::numeric, '0.00'::numeric, '0.00'::numeric, '0', ciudad_entrega, direccion_entrega, '.', '.', '0', enviada, fecha_envio, respuesta, bolsas, tarifa_bolsas, aviso_de_recibo, 
    orden_de_compra, tipo_moneda, facturacion_contingencia, '0', respuesta_servidor_propio, '.', '.', '.', costo_promedio, zip_key, factura_json_envio, factura_json_respuesta, 
    cliente_requiere_factura_electronica, dian_nit, '.', '0', nempresa, valor_atencion
from facturac  where  numero in ('AE-431140','AE-431143','AE-431310','AI-652621','AIC-37485','AJ-360863','AJ-360896',
 'AN-542798','AN-543863','AN-544880','AV-123274','AV-123511'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'INSERTAR CABECERA EINHELL  insert into facturac (fecha,nit,sede,vence,…', $q$INSERTAR CABECERA EINHELL
 insert into facturac (fecha,nit,sede,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,desc1,desc2,desc3,fecha1,fecha2,fecha3,pedido,bodega,estado,
    hora,numero,aproxima,imp01,imp02,tipo,contable,vendedor,peso,ruta,ciudad,costo,costo1,telefonico,nproveedor,desc4,trasmite,observa,codigo_facturacion,codigo_sucursal,
    h_sistema,sucursal_origen,sucursal_cartera,usuario,fecha_sistema,factor,imp04,impoconsumo,valor_rete_iva,tarifa_rete_iva,ciudad_entrega,direccion_entrega,dateresponse,
    cufe,qr,enviada,fecha_envio,respuesta,bolsas,tarifa_bolsas,aviso_de_recibo,orden_de_compra,tipo_moneda,facturacion_contingencia,resolucion_dian,respuesta_servidor_propio,
    response_enviada,response_consulta,consulta,costo_promedio,zip_key,factura_json_envio,factura_json_respuesta,cliente_requiere_factura_electronica,dian_nit,dian_documento,dian_valor_sin_iva)
    (select i.fecha,i.nit,i.sede,i.fecha,
	(select sum(total_sin_iva+total_iva) from itemfc where numero='FE-21834'),'0.00',
	(select sum(total_sin_iva) from itemfc where numero='FE-21834'),
	(select sum(total_iva) from itemfc where numero='FE-21834'),'0.00','0.00',f.fletepor,'0.00','0.00','0.00','0.00','0.00',f.fecha1,f.fecha2,f.fecha3,'0',i.bodega,f.estado,
    f.hora,i.numero,'0.00','0.00','0.00',f.tipo,'*','CP','0.00',f.ruta,f.ciudad,'0.00','0.00',f.telefonico,f.nproveedor,'0.00',f.trasmite,'obsevarcion',f.codigo_facturacion,f.codigo_sucursal,
    f.h_sistema,f.sucursal_origen,f.sucursal_cartera,f.usuario,f.fecha_sistema,f.factor,'0.00','0.00','0.00','0',f.ciudad_entrega,f.direccion_entrega,'.',
    'e5b9a2c685f46cfd2233327955367bee8768e55a0bf6071313e9fee936c6c06796b09352dc84c3d595e52a1d81db8a23','0',f.enviada,f.fecha_envio,f.respuesta,f.bolsas,f.tarifa_bolsas,f.aviso_de_recibo,f.orden_de_compra,f.tipo_moneda,f.facturacion_contingencia,'0',f.respuesta_servidor_propio,
    '.','.','.',f.costo_promedio,f.zip_key,f.factura_json_envio,f.factura_json_respuesta,f.cliente_requiere_factura_electronica,f.dian_nit,'.','0' from facturac f
	 inner join itemfc i on i.nit=f.nit and i.numero='FE-21834' and i.codigo='4007333'
	 where f.numero='FE-15928');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CUANDO SE SALTA EL CONSECUTIVO EN DOCUMENTO SOPORTES', $q$CUANDO SE SALTA EL CONSECUTIVO EN DOCUMENTO SOPORTES
insert into facturac_compras(fecha,nit,sede,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,desc1,desc2,desc3,
	fecha1,fecha2,fecha3,pedido,bodega,estado,hora,numero,aproxima,imp01,imp02,contable,imp03,nproveedor,factor,
	trasmite,codigo_sucursal,usuario,fecha_sistema,detalle,fecha_recibido,h_sistema,fecha_emision,documento_equivalente_id,
	numero_documento_soporte,estado_docsoporte)
	(select fecha,nit,sede,vence,0,0,0,0,0,0,fletepor,0,0,0,0,0,
	fecha1,fecha2,fecha3,0,bodega,estado,hora,'DS15173',0,0,0,'*',0,nproveedor,factor,
	trasmite,codigo_sucursal,'wras',fecha_sistema,'Consecutivo Doc Soporte saltado, se deja en cero',fecha_recibido,h_sistema,fecha_emision,documento_equivalente_id,
	'DS15173',estado_docsoporte from facturac_compras where numero in('DS15172'))$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into docsoporte(codigo_sucursal,nit,sede,numero,fecha,hora,venc…', $q$insert into docsoporte(codigo_sucursal,nit,sede,numero,fecha,hora,vence,medio_pago,tipo_pago,tipo_documento,observaciones,moneda,
factor,fecha_entrega,resolucion,fecha_inicial,fecha_final,prefijo,rango_minimo,rango_maximo,llave_tecnica,
codigo_usuario,fecha_creacion,estado,documento_equivalente_id,cuenta_pagar_id)
(select codigo_sucursal,nit,sede,'DSEM769',fecha,hora,vence,medio_pago,tipo_pago,tipo_documento,observaciones,moneda,
factor,fecha_entrega,resolucion,fecha_inicial,fecha_final,prefijo,rango_minimo,rango_maximo,llave_tecnica,
codigo_usuario,fecha_creacion,estado,documento_equivalente_id,cuenta_pagar_id from docsoporte where numero='DSEM767');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'insert into docsoporte_items(codigo_sucursal,centro_costos,departament…', $q$insert into docsoporte_items(codigo_sucursal,centro_costos,departamento_interno,numero,fecha,
item,codigo,nombre,cantidad,nota,valor_bruto,precio,valor_iva,tarifa_iva,valor_rete_iva,
tarifa_rete_iva,valor_rete_fuente,tarifa_rete_fuente,valor_rete_ica,tarifa_rete_ica,tipo_impuesto,
nombre_impuesto,valor_impoconsumo,porcentaje_descuento,valor_base_descuento,valor_descuento)
(select codigo_sucursal,centro_costos,departamento_interno,'DSEM769',fecha,
item,'SALTO','SE DEJA EN CERO SALTO EL CONSECUTIVO',0,nota,0,0,valor_iva,tarifa_iva,valor_rete_iva,
tarifa_rete_iva,valor_rete_fuente,tarifa_rete_fuente,valor_rete_ica,tarifa_rete_ica,tipo_impuesto,
nombre_impuesto,valor_impoconsumo,porcentaje_descuento,0,valor_descuento
 from docsoporte_items where numero='DSEM767');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SALTO EL CONSECUTIVO DEVOLUCIONES', $q$SALTO EL CONSECUTIVO DEVOLUCIONES
insert into dfacturac(fecha,nit,sede,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,desc1,desc2,desc3,fecha1,fecha2,fecha3,pedido,bodega,estado,hora,numero,
					  aproxima,imp01,imp02,tipo,contable,vendedor,peso,nproveedor,concepto,detalle,codigo_sucursal,usuario,fecha_sistema,imp04,impoconsumo,codigo_facturacion,valor_rete_iva,trasmite,
					  qr,cufe,dateresponse,enviada,fecha_envio,respuesta,concepto_nota,tarifa_iva,response_enviada,consulta,response_consulta,respuesta_servidor_propio,factor,zip_key,factura_json_envio,
					  factura_json_respuesta,dian_nit,dian_documento,dian_valor_sin_iva,referencia_fe,nempresa)  
(select fecha,nit,sede,vence,'0.00','0.00','0.00','0.00','0.00','0.00',fletepor,'0.00','0.00','0.00','0.00','0.00',fecha1,fecha2,fecha3,pedido,bodega,estado,
hora,'9632','0.00','0.00','0.00',tipo,'*',vendedor,'0.00',nproveedor,concepto,'consecutivo se deja en ceros porque se saltó',codigo_sucursal,usuario,fecha_sistema,imp04,impoconsumo,codigo_facturacion,valor_rete_iva,trasmite,
qr,cufe,dateresponse,enviada,fecha_envio,respuesta,concepto_nota,tarifa_iva,response_enviada,consulta,response_consulta,respuesta_servidor_propio,factor,zip_key,factura_json_envio,
factura_json_respuesta,dian_nit,dian_documento,dian_valor_sin_iva,referencia_fe,nempresa from dfacturac where numero='9631')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'PASAR DE CARTERA_CLIENTE A CARTERA_PROVEEDORES', $q$PASAR DE CARTERA_CLIENTE A CARTERA_PROVEEDORES$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into cartera_proveedores (codigo_sucursal,numero,fecha,vence,va…', $q$insert into cartera_proveedores (codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,
sede,usuario,valor1,valor2,valor3,contable,sucursal_origen,
sucursal_facturacion,retencion,reteiva,reteica)
(select codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,valor1,valor2,valor3,
contable,sucursal_origen,sucursal_facturacion,retencion,'0','0'
from cartera_clientes where numero in
('FE 42318','9536529645-76','FEM-1283','FVE2098','FVE2105','753-619451','MEMO 1206',
'BPUP370591','FEMS406','FE 771','FEGM4241','BPUP372040','DSEM501',
'DSEM499','DSEM503','DSEM504','DSEM500','DSEM502') and contable='23359501')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'CAMBIAR CUENTA', $q$CAMBIAR CUENTA 
favor cambiar la cuenta 13050503 por la cuenta 13050501 de las siguientes facturas
 FEVV-11082-FEVV-11146-FEVV-11142  
Proceso
por favor cambiar en la tabla de cartera_clientes campo contable por la cuenta que nos indica el usuario. 
select * from cartera_clientes where numero='FEVV-11082' and contable='13050501'
or numero='FEVV-11146'
or numero='FEVV-11142'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'update cartera_clientes set contable=''13050501'' where contable=''130505…', $q$update cartera_clientes set contable='13050501'
where contable='13050501' and id in(32130,32194,32190)
or numero='FEVV-11082' 
or numero='FEVV-11146'
or numero='FEVV-11142'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ELIMINAR PEDIDOS', $q$ELIMINAR PEDIDOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select estado,estado_real,* from pedidos where numero=''5240209'' update…', $q$select estado,estado_real,* from pedidos where numero='5240209'
update pedidos set estado='E',estado_real='00' where numero='5612492'
select estado_real,* from items_pedidos where numero='5240209'
update items_pedidos set estado_real='00' where numero='5240209' 
sucursal 0111 bodega 25 sucursal 0211 bodega a1,
no se pueden eliminar si estan en estado 00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'VALIDACION DE DESCUENTO PARA LOS USUARIOS', $q$VALIDACION DE DESCUENTO PARA LOS USUARIOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios_permisos_descuentos where codigo_usuario=''cqr'' …', $q$select * from usuarios_permisos_descuentos where codigo_usuario='cqr' and  usuario_id in (2897)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo=''cqr''', $q$select * from usuarios where codigo='cqr'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'DAR ACCESO A LAS CONSULTAS PARA LOS USUARIOS', $q$DAR ACCESO A LAS CONSULTAS PARA LOS USUARIOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from consultas where titulo ilike ''%RELACIONES PENDIENTES POR…', $q$select * from consultas where titulo ilike '%RELACIONES PENDIENTES POR FACTURAR LPGG 20190201%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '--! PARA HACER AUTORIZACIONES EN LAS BODEGAS', $q$--! PARA HACER AUTORIZACIONES EN LAS BODEGAS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '--? Se verifica que esté activa y permita traslados. Columnas=(traslad…', $q$--? Se verifica que esté activa y permita traslados. Columnas=(traslados) y (estado)
select * from bodegas where codigo_bodega in ('24','25')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '--? Ingresamos a (configuracion_xml) y referenciamos la fila que se ne…', $q$--? Ingresamos a (configuracion_xml) y referenciamos la fila que se necesite utilizar
select * from configuracion_xml where sucursal='0101' and propiedad ilike '%traslados%'
--? Tomamos todo el campo (valor) y agregamos la (bodega) solicitada.
--? Después volvemos a ingresar el campo (valor) tomando la columna (propiedad) correctamente como aparece en la tabla
--update configuracion_xml set valor='1,2,3,4,22,23,5,11,6,19,12,24,25'
where sucursal='0101' and propiedad='bodegas_destino_traslados' and id='3835'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'BOTONES JAIVANA ESCRITORIO', $q$BOTONES JAIVANA ESCRITORIO
Contabilidad - Compras Varias - Documento Soporte - Grabar Documento Soporte (GRABA_SOPORT)
        Contabilidad - Compras Varias - Documento Soporte - Grabar Documento Soporte -> Campo "Centro de Costos" (DOC_SOPORMCC)
    Contabilidad - Compras Varias - Documento Soporte - Configurar Documentos (CONF_SOPORT)
    Contabilidad - Compras Varias - Documento Soporte - Crear Productos (CREA_PRODSER)
    Contabilidad - Compras Varias - Documento Soporte - Consultar Documento Soporte 
(CONS_SOPORT)
        Contabilidad - Compras Varias - Documento Soporte - Consultar Documento Soporte -> Botón "Anular Doc.Electrónico"(ANULA_DOCSOP)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'autorizar fecha en los documentos soportes', $q$autorizar fecha en los documentos soportes
FACT_SERVI_MF$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Facturación-Factura-Consultar- boton -> VerIFactura (RE_FELEC)', $q$Facturación-Factura-Consultar- boton -> VerIFactura (RE_FELEC)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Listar Pedidos - Listar pedidos (F0002)', $q$JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Listar Pedidos - Listar pedidos (F0002)
    JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Listar Pedidos - Listar pedidos - Botones Ver, Eliminar X, Modificar Fechas
        Boton Ver (COTIZVER)
        Boton Eliminar x (COTIZELI) -> F0001_1 (se deben habilitar los dos permisos ya que el primero es el boton y el segundo es el permiso)
        Boton Modificar Fechas (COTIZMODF)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '- Facturación/Pedido/Trazabilidad/En picking (TRAZ003)', $q$- Facturación/Pedido/Trazabilidad/En picking (TRAZ003)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> Digitar (TRAZCANTPT)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> cerrar (TRCERRARP)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> RePicking (TRAZCANTPP)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> Cerrar Uno(TRAZCERUNO)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> Reimprimir (TRAZREIMP)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> Items (TRAZITEMS)
        -- Facturación/Pedido/Trazabilidad/En picking/Botón -> Novedad (TRAZNOVEDAD)
-Facturacion/pedidos/Trazabildad/contados/Boton->Recontar(TRAZRECONTAR)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'PANTALLAS CODIGOS', $q$PANTALLAS CODIGOS
Facturación/Pedido/Trazabilidad/Pendientes Cartera (TRAZ001)
Facturación/Pedido/Trazabilidad/Autorizados Cartera (TRAZ002)
Facturación/Pedido/Trazabilidad/En picking (TRAZ003)
Facturación/Pedido/Trazabilidad/Contados (TRAZ004)
JAIVANA ESCRITORIO - Módulo Facturación - Factura - Consultar factura electrónica Propia (FE-001)
    JAIVANA ESCRITORIO - Módulo Facturación - Factura - Consultar factura electrónica Propia - Enviadas Aceptadas - Botón Ver - Botón Reenviar correo IFactura (FE-007)
    JAIVANA ESCRITORIO - Módulo Facturación - Factura - Consultar factura electrónica Propia - Sin enviar y/o Rechazadas - Botón Ver - Botón Enviar EFactura (FE-002)
JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Listar Pedidos - Listar pedidos (F0002)
    JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Listar Pedidos - Listar pedidos - Botones Ver, Eliminar X, Modificar Fechas
        Boton Ver (COTIZVER)
        Boton Eliminar x (COTIZELI) -> F0001_1 (se deben habilitar los dos permisos ya que el primero es el boton y el segundo es el permiso)
        Boton Modificar Fechas (COTIZMODF)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Boton Presentacion (COTIZVERP)', $q$Boton Presentacion (COTIZVERP)
Boton Autorizar(TRAUTO)
Boton Actualizar proveedor (ED_PROV)
11:29
JAIVANA ESCRITORIO - Módulo Facturación - Pedido - Mantenimiento Pedidos - Botones Ver, Presentación, Modificar, Eliminar X, Modificar Fechas
        Boton Ver (COTIZVER)
        Boton Presentacion (COTIZVERP)
        Boton Modificar (COTIZMOD)
        Boton Eliminar x (COTIZELI) (F0001_1)
        Boton Modificar Fechas (COTIZMODF)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Facturación/Pedido/Trazabilidad/Autorizados Cartera/Botón -> Pendiente (TRAZDEVOL)', $q$Facturación/Pedido/Trazabilidad/Autorizados Cartera/Botón -> Pendiente (TRAZDEVOL)
Facturación-Pedidos-Mantenimiento Pedidos (F0059)
11:17
Facturación-Pedidos-Desbloquear Pedidos (F0006)
11:17
Facturación-Pedidos-Trazabilidad (F0057)
11:17
Facturación-Factura-Consultar (F0007)
FAtarurar remisiones(F0060_3)
Modulo FACTURACION, opción pedidos, consultar remisiones y ASIGNAR AVISO DE RECIBO
REM_AVRECIBO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'autorizar cambio de precio en modificar articulo', $q$autorizar cambio de precio en modificar articulo 
codigop='I0018'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Buenos días,', $q$Buenos días,
Cordial Saludo, de la manera mas atenta solicitamos su ayuda habilitando en el módulo de facturación la sucursal 0901 a los siguientes usuarios.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from configuracion_xml where sucursal=''0000'' and valor ilike''…', $q$select * from configuracion_xml where sucursal='0000' and valor ilike'%0071%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturaciones where codigo_sucursal=''0901''', $q$select * from facturaciones where codigo_sucursal='0901'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'habilitar mostrador', $q$habilitar mostrador 
159$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'AGREGAR CODIGOS EXTENSIONES HACIENDA', $q$ AGREGAR CODIGOS EXTENSIONES HACIENDA
 RUTA:
MAESTROS- CONTABILIDAD-ADMINISTRACION EXTENCION DE IVA
se busca el nit del cliente, luego se busca el que no este vencido y en numero extension se copia en el archivo que envia el cliente, luego vamos a la bases de datos del cliente al que esta pidiendo el ingreso $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', '--*se clona las pantallas autorizadas del usuarios ejemplo pero solo l…', $q$--*se clona las pantallas autorizadas del usuarios ejemplo pero solo las q hacen falta discriminando las existentes
insert into pantallas_autorizadas(codigop,codigou)(select distinct codigop, 'codigo_usuario_a_recibir'
from pantallas_autorizadas where codigou='codigo_usuario_copia' and codigop not in (select codigop from pantallas_autorizadas where codigou='codigo_usuario_a_recibir'))$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Por favor me pueden colaborar revisando la factura PAM-515314 de la se…', $q$Por favor me pueden colaborar revisando la factura PAM-515314 de la sede marsella, no me la permite ver para imprimir, me sale el valor en blanco, pero si me la suma en las ventas diarias. 
solucion
por favor verificar la carpeta tmp_aplicacion debe existir ya sea en la unidad C o D $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ajustes inventarios', $q$ajustes inventarios$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where nombre ilike''%jose ignacio guzman%''', $q$select * from usuarios where nombre ilike'%jose ignacio guzman%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from configuracion_xml where propiedad ilike''%bodegas_autoriz…', $q$select * from configuracion_xml where propiedad ilike'%bodegas_autorizadas_ajustes%' and sucursal in ('6000')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'update configuracion_xml set valor=concat(valor,'',40'') where propiedad…', $q$update configuracion_xml set valor=concat(valor,',40')
where propiedad ilike'%bodegas_autorizadas_ajustes%' and sucursal in ('6000')
 aut conceptos de ajustes$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ferricentro wms los pedidos se están perdiendo', $q$ferricentro wms los pedidos se están perdiendo 
los pedidos no son visualizados en wms,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pedidos_items_wms where numero_pedido=''205243'' (se deja …', $q$select * from pedidos_items_wms where numero_pedido='205243' (se deja en estado lectura en( . ) o se elimina y se envía de nuevo)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'usuarios para caja cambiar caja de usuario a usario', $q$usuarios para caja cambiar caja de usuario a usario$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select id,* from usuarios where codigo in (''djpq'',''ydr'')', $q$select id,* from usuarios where codigo in ('djpq','ydr')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios_roles where usuario_id in (3099,3277)', $q$select * from usuarios_roles where usuario_id in (3099,3277)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from usuarios_codigos_facturacion where usuario_id in (3099,3…', $q$select * from usuarios_codigos_facturacion where usuario_id in (3099,3277)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturaciones where codigo_sucursal in (''2107'') mirar co…', $q$select * from facturaciones where codigo_sucursal in ('2107') mirar codigos de facturacion$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'FALLO_CORREO', $q$FALLO_CORREO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from documentos_pendientes where  fecha_documento between ''20…', $q$select * from documentos_pendientes where  fecha_documento between '2024-05-30' and '2024-05-30' and envio_correo='N' and dian_nit='222222222222'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update documentos_pendientes set envio_correo=''S'' where  fecha_documen…', $q$update documentos_pendientes set envio_correo='S'
where  fecha_documento between '2024-05-30' and '2024-05-30' and envio_correo='N' and dian_nit='222222222222'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Proceso que se realiza cuando las remisiones que se hacen en la sucurs…', $q$Proceso que se realiza cuando las remisiones que se hacen en la sucursal 0211 bodega a1 (saldoa1) quedan en 0 (este proceso solo pasa con códigos especiales en este momento está con el tercero DRUMMOND)
primero verificar que la remisión este en 0 select * from facturac_remision where numero='918'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from wms_items_pedidos_reservados_a1 where pedido in (''559458…', $q$select * from wms_items_pedidos_reservados_a1 where pedido in ('5594587')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'mira que sea la cantidad que solicitan (cantidad)', $q$mira que sea la cantidad que solicitan (cantidad)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'estado (R) debe quedar en estado R', $q$estado (R) debe quedar en estado R$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from items_pedidos where numero=''5525041''', $q$select * from items_pedidos where numero='5525041'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'verifica el articulo (codigo), cantidad,auxiliar,reservado y reservado…', $q$verifica el articulo (codigo), cantidad,auxiliar,reservado y reservado_conteo (deben ser iguales)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select saldoa1,codigo from articulo where codigo=''830001402''', $q$select saldoa1,codigo from articulo where codigo='830001402'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'verficar que si tenga saldo y se pueda pasar a la ubicación en caso qu…', $q$verficar que si tenga saldo y se pueda pasar a la ubicación en caso que no tenga en ella$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from wms_nuevo_ubicaciones_cantidades where codigo=''830001402…', $q$select * from wms_nuevo_ubicaciones_cantidades where codigo='830001402' and ubicacion_codigo='wms-0211-a1-1-1-1'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'tener la misma o mayor cantidad del ítems pedidos (campo cantidad), o …', $q$tener la misma o mayor cantidad del ítems pedidos (campo cantidad), o se pasa la cantidad que requieran si tiene saldo en la bodega (saldoa1).$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pedidos where numero=''5594587''', $q$select * from pedidos where numero='5594587'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'verfica el estado del pedido y se cambia a estado A.', $q$verfica el estado del pedido y se cambia a estado A.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'pedidos set estado=''A'' where numero=''5594587''', $q$pedidos set estado='A' where numero='5594587'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'con esto se le informa al usaurio para que proceda a realizar la remis…', $q$con esto se le informa al usaurio para que proceda a realizar la remision o lo re misionamos si lo solicitan.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update wms_items_pedidos_reservados_a1 set estado=''R'' where pedido in …', $q$update wms_items_pedidos_reservados_a1
set estado='R'
where pedido in ('6208183') and id='280513';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'update wms_nuevo_ubicaciones_cantidades set cantidad=(select saldoa1 f…', $q$update wms_nuevo_ubicaciones_cantidades
set cantidad=(select saldoa1 from articulo where codigo='839000207')
where codigo='839000207' and ubicacion_codigo='wms-0211-a1-1-1-1';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update pedidos set estado=''A'' where numero=''6208183'' and id=''7392624'';', $q$update pedidos
set estado='A'
where numero='6208183' and id='7392624';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'SELECT wnuc.id,wnuc.ubicacion_codigo,wnuc.codigo_id,wnuc.codigo,wnuc.b…', $q$SELECT wnuc.id,wnuc.ubicacion_codigo,wnuc.codigo_id,wnuc.codigo,wnuc.bodega,wnuc.codigo_sucursal,
wnuc.cantidad,wnuc.pedidos,wnuc.vencimiento,wnuc.fecha_operacion,wnuc.usuario_operacion,wnuc.ip_operacion,
wnuc.clase as tipo_ubicacion,wnuc.nivel as numero_nivel,wnuc.wms_nuevo_racks_columnas_id,wnrc.columna_numero,
wnrc.wms_nuevo_rack_id,wnr.wms_zona_id,wnr.numero as numero_rack,wnz.descripcion as nombre_zona,
sum(COALESCE(wipr.cantidad,0.0) ) as reservado
FROM wms_nuevo_ubicaciones_cantidades wnuc  LEFT JOIN  wms_nuevo_racks_columnas wnrc ON wnuc.wms_nuevo_racks_columnas_id=wnrc.id
LEFT JOIN  wms_nuevo_racks wnr ON wnrc.wms_nuevo_rack_id=wnr.id  LEFT JOIN  wms_nuevo_zonas wnz ON wnr.wms_zona_id=wnz.id
LEFT JOIN wms_items_pedidos_reservados_a1 wipr  ON wipr.estado='R' and wipr.codigo_articulo=wnuc.codigo
and wipr.wms_nuevo_ubicaciones_cantidades_id=wnuc.id WHERE wnuc.codigo='104000010' and wnuc.bodega='a1'
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20  ORDER BY wnuc.ubicacion_codigo,wnuc.codigo
11:23
Carlos Ocampo
select sum (cantidad) from wms_items_pedidos_reservados_a1 where codigo_articulo='104000010' and estado='R'
11:23
Carlos Ocampo
listo
11:23
Carlos Ocampo
se debe dejar en 0 la cantidad
11:23
Carlos Ocampo
SELECT wnuc.id,wnuc.ubicacion_codigo,wnuc.codigo_id,wnuc.codigo,wnuc.bodega,wnuc.codigo_sucursal,
wnuc.cantidad,wnuc.pedidos,wnuc.vencimiento,wnuc.fecha_operacion,wnuc.usuario_operacion,wnuc.ip_operacion,
wnuc.clase as tipo_ubicacion,wnuc.nivel as numero_nivel,wnuc.wms_nuevo_racks_columnas_id,wnrc.columna_numero,
wnrc.wms_nuevo_rack_id,wnr.wms_zona_id,wnr.numero as numero_rack,wnz.descripcion as nombre_zona,
sum(COALESCE(wipr.cantidad,0.0) ) as reservado
FROM wms_nuevo_ubicaciones_cantidades wnuc  LEFT JOIN  wms_nuevo_racks_columnas wnrc ON wnuc.wms_nuevo_racks_columnas_id=wnrc.id
LEFT JOIN  wms_nuevo_racks wnr ON wnrc.wms_nuevo_rack_id=wnr.id  LEFT JOIN  wms_nuevo_zonas wnz ON wnr.wms_zona_id=wnz.id
LEFT JOIN wms_items_pedidos_reservados_a1 wipr  ON wipr.estado='R' and wipr.codigo_articulo=wnuc.codigo
and wipr.wms_nuevo_ubicaciones_cantidades_id=wnuc.id WHERE wnuc.codigo='104000010' and wnuc.bodega='a1'
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20  ORDER BY wnuc.ubicacion_codigo,wnuc.codigo$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'COMPRAR SALDOSWMS', $q$COMPRAR SALDOSWMS
select wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,a.saldo25,ubi.cantidad as cantidad_ubicacion, 
sum(wms.cantidad) as cantidad_reservada,a.saldo25-ubi.cantidad as dife
from wms_items_pedidos_reservados_25 wms
join wms_nuevo_ubicaciones_cantidades ubi on wms.codigo_articulo=ubi.codigo and wms.codigo_ubicacion=ubi.ubicacion_codigo
join articulo a on a.id=ubi.codigo_id
where wms.codigo_ubicacion='wms-0111-25-1-1-1' and wms.estado='R' 
and wms.codigo_articulo in ('007080200','003260216','003310124','003280308','003312116','003342200','024050016','012080016',
'024050400','003342216','003404029','009040100','027040020','027040040','027050040','027060030','009060020','009080300',
'009100216','024050100','024060020','024060116','024060216','007080024','007080108','007080300','003404080','003404044',
'003404202','003404100','007100216','007140300','009060012','024080108','027040015','027040025','027040035','027040030',
'027040045','027050050')
group by wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,ubi.ubicacion_codigo,ubi.codigo,ubi.cantidad,a.saldo25$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ACTIVAR SUCURSAL', $q$ACTIVAR SUCURSAL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'USUARIOS - USUARIO_CONFIGURACION Y CODIGOS DE FACTURACION, SUCURSALES …', $q$USUARIOS - USUARIO_CONFIGURACION Y CODIGOS DE FACTURACION, SUCURSALES CONFIGURACION$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo=''jcaa''', $q$select * from usuarios where codigo='jcaa'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from sucursales where codigo_sucursal in(''0114'',''0115'') "0042…', $q$select * from sucursales where codigo_sucursal in('0114','0115') "0042" "0044" 
para buscar el codigo de facturacion $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'dejar saldo en 0 del una dv ', $q$dejar saldo en 0 del una dv $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Buenas tardes', $q$Buenas tardes
De su colaboración con el retirodel saldode la carteradel cliente con NIT 900206662/SITTCA CIONSTRUCCIONES SA, ya que se genero la devolución de $2'174'.523 al cliente según pantallazo adjunto y aun aparece cargada en la cuenta y se cruzo con la nota 11688.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', '''', $q$'
select * from cartera_clientes where nit='900206662'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update cartera_clientes set saldo=''0'' where nit=''900206662'' and numero…', $q$update cartera_clientes set saldo='0'
where nit='900206662' and numero in('01CR-611477') and saldo='-2174523.00' $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Buenas tardes.', $q$Buenas tardes.
Solicito su colaboración para que por favor el Egreso No. 801 de Junio a nombre de LUIS SOTO Y CIA SAS quede en cero tanto contablemente como en el Estado de cuenta ,el cual esta cruzando con la factura FE 24757.
Necesitamos que esta factura quede pendiente de pago.
Agradezco su colaboración a mi solicitud.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pagos_compras where nit in(''860000743'')', $q$select * from pagos_compras where nit in('860000743')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select * from movimiento2023 where nit in(''860000743'') and numero_docu…', $q$select * from movimiento2023 where nit in('860000743') and numero_documento in('801')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select * from cartera_proveedores where nit in (''860000743'') and numer…', $q$select * from cartera_proveedores where nit in ('860000743') and numero in ('FE 24757')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update cartera_proveedores set saldo=''0'' where nit in (''860000743'') an…', $q$update cartera_proveedores set saldo='0'
where nit in ('860000743') and numero in ('FE 24757') $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select * from nitsx_sedes where nombre ilike''%luis soto%''', $q$select * from nitsx_sedes where nombre ilike'%luis soto%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ERROR EN LA FECHA- ACTUALIZAR RESOLUCION', $q$ERROR EN LA FECHA- ACTUALIZAR RESOLUCION$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'PROBLEMAS EN ARTICULOS', $q$PROBLEMAS EN ARTICULOS
 insert into configuracion_xml (sucursal, categoria, propiedad, valor,fecha_modificacion) values
        ('0107', 'facturacion_0108', 'activar_detalle_item', 'N', current_timestamp),
        ('0107', 'facturacion_0108', 'elcodigofactura', '0108', current_timestamp),
        ('0107', 'facturacion_0108', 'fecha_entrega', 'N', current_timestamp),
        ('0107', 'facturacion_0108', 'items_posibles', '-1', current_timestamp),
        ('0107', 'facturacion_0108', 'redondear', 'S', current_timestamp),
        ('0107', 'facturacion_0108', 'redondear_decimales', '0', current_timestamp);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'DEVOLUCIONES PROBLEMAS HACIENDA', $q$DEVOLUCIONES PROBLEMAS HACIENDA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac where numero in  (''71473'') 2023-07-14  3196   s…', $q$select * from facturac where numero in  ('71473') 2023-07-14
 3196  
select * from itemfc where numero in  ('71473')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from dfacturac where numero in  (''3282'') 2023-07-20 ''3282''),''…', $q$select * from dfacturac where numero in  ('3282') 2023-07-20 '3282'),'3243','3245', $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '-- pedido=''77839'' select * from pedidos_exenciones where pedido=''11832…', $q$-- pedido='77839'
select * from pedidos_exenciones where pedido='118326' 118326
-- numero_exencion "AL-00010860-22"
select * from articulo_exenciones_iva_items where numero='AL-00037339-22' and producto_jaivana='662031904'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select codigo, codigo_linea, id from articulo where codigo in(''6620319…', $q$select codigo, codigo_linea, id from articulo where codigo in('662031904') -- Se toma el id de cada articulo para buscarlo en la tabla articulo_codigos_hacienda
SELECT * FROM articulo_codigos_hacienda WHERE articulo_id in('224649')
09:21
-- Se identifica que en uno de los articulos, el codigo de hacienda le faltaba un cero.
id      articulo_id     codigo_hacienda
57139	224649		"2825002000200"$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'SELECT * FROM articulo_codigos_hacienda WHERE codigo_hacienda in(''2825…', $q$SELECT * FROM articulo_codigos_hacienda WHERE
codigo_hacienda in('2825002000200')
and articulo_id in('224649')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '-------------------------- paso 2-------------------------------------…', $q$-------------------------- paso 2----------------------------------------------------
select * from pedidos where numero='77839' -- codigo_sucursal='6000'	codigo_facturacion='0001'
-- pedido='77839'
select * from pedidos_exenciones where pedido='77839'
-- numero_exencion "AL-00010860-22"
select i.numero,i.nit,i.sede,a.tercero_id,n.nit,n.sede,i.codigo,a.numero from
nitsx_sedes n, articulo_exenciones_iva a, itemfc i
left join articulo_exenciones_iva_items ai on i.codigo = ai.producto_jaivana
where a.tercero_id = n.id and i.nit = n.nit and i.sede = n.sede
and i.numero = '47045' and a.numero = ai.numero
select * from articulo_exenciones_iva where numero='AL-00010860-22'
select * from articulo_exenciones_iva_items where
producto_jaivana in('FJ12-12FJ45T','FJ12-12FJ90T','FJ10-10FJ','FK08-08SP','618000476')
and numero='AL-00010860-22'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '----------------------------------------------------------------------…', $q$----------------------------------------------------------------------------------------$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select nit, id from nitsx_sedes where sede=''1'' and nit in(''3101108784''…', $q$select nit, id from nitsx_sedes where sede='1' and nit in('3101108784') -- se toma el id para buscar en la tabla articulo_exenciones_iva
    nit             id
    "3101108784"    252239$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'SELECT * FROM articulo_exenciones_iva WHERE tercero_id in(''252239'') te…', $q$SELECT * FROM articulo_exenciones_iva WHERE tercero_id in('252239')
tercero_id  fecha_terminacion   fecha_inicio    tipo_de_exencion    valor
252450      "2022-05-11"        "2021-12-20"    "V"                 1.00
252167      "2023-01-18"        "2021-12-09"    "V"                 1.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '155	252239	"2023-07-15"	"2022-06-27"	"V"	0.00	"AL-00037339-22"', $q$155	252239	"2023-07-15"	"2022-06-27"	"V"	0.00	"AL-00037339-22"
271	252239	"2024-07-15"	"2023-04-12"	"V"	0.00	"AL-00040811-23"$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PARA ENVIAR DOCUMENTOS QUE ESTAN QUEDANDO FALLO/ENVIO', $q$PARA ENVIAR DOCUMENTOS QUE ESTAN QUEDANDO FALLO/ENVIO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update documentos_pendientes set envio_correo=''S'' where fecha_document…', $q$update documentos_pendientes set envio_correo='S'
where fecha_documento between '2023-07-01' and '2023-08-30' and envio_correo='N'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR RESOLUCION DESDE LA BASE DE DATOS', $q$CAMBIAR RESOLUCION DESDE LA BASE DE DATOS 
se cambia la resolucion, se cambia fechainicio, fechafinal, numeroinicio.numerofina, $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'tambien se puede hacer desde jaivana escritorio', $q$tambien se puede hacer desde jaivana escritorio$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT numero_resolucion,prefijo_documento,finicio,ffinal,ninicio,nfin…', $q$SELECT numero_resolucion,prefijo_documento,finicio,ffinal,ninicio,nfinal FROM DOCUMENTOS_EQUIVALENTES 
los documentos equivalentes no llevan llave tecnica$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR RESOLUCION DE FACTURAS QUE NO SON ELECTRONICAS', $q$CAMBIAR RESOLUCION DE FACTURAS QUE NO SON ELECTRONICAS
NOTA: las facturas que no son electronicas no llevan llave tecnica, pero se le debe dejar la que tiene ya que no hay problema$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select numero_factura,prefijo_factura,resolucion,numero_resolucion,fin…', $q$select numero_factura,prefijo_factura,resolucion,numero_resolucion,finicio,ffinal,ninicio,nfinal,llave_tecnica,* from consecutivo_facturas 
where prefijo_factura ilike'%CGCR-%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select * from cartera_proveedores where numero in(''SUM-2493'', ''SUM-249…', $q$select * from cartera_proveedores where numero in('SUM-2493',
'SUM-2493-1','SUM2503-1','SUM-2487','SUM-2487-1','SUM-2487-2',  'SUM-2487-3',
'SUM-2487-4','SUM-2362','SUM-2431-2A','SUM-2431-2','SUM-2410-2','SUM-2401-2',
'SUM-2410-1','SUM-2401','SUM-2403-1A','SUM-2409','SUM-2385','SUM-2341-2','SUM-2341-1',
'SUM-2446','SUM-2325-2','SUM-2302') $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'SELECT * FROM CARTERA_PROVEEDORES WHERE NUMERO IN(''SUM-2493'',''SUM-2493…', $q$SELECT * FROM CARTERA_PROVEEDORES WHERE NUMERO IN('SUM-2493','SUM-2493-1','SUM 2503-1','SUM-2487','SUM-2487-1',
'SUM-2487-2','SUM-2487-3','SUM-2487-4','SUM-2362','SUM-2431-2A','SUM-2431-2','SUM-2410-2',
'SUM-2401-2','SUM-2410-1','SUM-2401','SUM-2403-1A','SUM-2409','SUM-2385','SUM-2341-2','SUM-2341-1',
'SUM-2446','SUM-2325-2','SUM-2302') AND CONTABLE='22050100'  and saldo >'0' ORDER BY NUMERO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update cartera_proveedores set saldo=''0'' where  numero in(''SUM2503-1'',…', $q$update cartera_proveedores set saldo='0'
where  numero in('SUM2503-1','SUM-2487','SUM-2487-1','SUM-2487-2',  'SUM-2487-3','SUM-2487-4',
'SUM-2362','SUM-2431-2A','SUM-2431-2','SUM-2410-2','SUM-2401-2','SUM-2410-1','SUM-2401',
'SUM-2403-1A','SUM-2409','SUM-2385','SUM-2341-2','SUM-2341-1','SUM-2446','SUM-2325-2','SUM-2302')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'and saldo in (''-47314429.25'',''-168003352.59'',''-261610821.23'',''-1279514…', $q$and saldo in ('-47314429.25','-168003352.59','-261610821.23','-127951410.26','-91805726.34',
'-139664039.95','-520310937.04','-127858061.87','-215400437.07','-127635721.01','-391243116.38',
'-124332180.26','-196862020.15','-195982545.85','-248519623.83','-147922244.85','
-56045679.95','-24972987.29','-101624690.97','-394744633.50')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR EL TIPO C a I', $q$CAMBIAR EL TIPO C a I$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'select codigo_negocio,* from nitsx_sedes where codigo_negocio=''I'' and …', $q$select codigo_negocio,* from nitsx_sedes where codigo_negocio='I' and nit in ('603820504','206820355')
update nitsx_sedes set codigo_negocio='I' where  nit in(select cedula from vendedoresx where codigo_vendedor in('ARB','RAND'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'select * from vendedoresx where tipo=''I'' and codigo_vendedor in(''ARB'',…', $q$select * from vendedoresx where tipo='I' and codigo_vendedor in('ARB','RAND');
update vendedoresx set tipo='I' where codigo_vendedor in('ARB','RAND');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'DAR PERMISOS EN JAIVANA WEB', $q$DAR PERMISOS EN JAIVANA WEB$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Cordial Saludo, solicitamos de su acostumbrada ayuda habilitando la op…', $q$Cordial Saludo, solicitamos de su acostumbrada ayuda habilitando la opción "remplazo de factura" al usuario jaivana web (pamu - nombre: PAULA ANDREA MEJIA UTIMA) el cual es necesario para realizar las devoluciones por concepto de cambio de fecha, tal cual como el siguiente pantallazo.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo in (''pamu'') select * from roles_pe…', $q$select * from usuarios where codigo in ('pamu')
select * from roles_permisos where nombre ilike'%factura%'
select * from usuarios_roles where usuario_id in ('3106')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR DE ESTADOS PEDIDOS', $q$CAMBIAR DE ESTADOS PEDIDOS 
select estado,estado_real,* from pedidos where numero in ('247537','247291',
'247771','248351','248435','246580','246613','246637','246617')and estado='A'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update pedidos set estado_real=''01'' where numero in (''247537'',''247291''…', $q$update pedidos set estado_real='01'
where numero in ('247537','247291','247771','248351','248435',
'246580','246613','246637','246617')
and estado='A' and estado_real in('02','00','03')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select estado_real,* from items_pedidos where numero in (''247537'', ''24…', $q$select estado_real,* from items_pedidos where numero in ('247537',
'247291','247771','248351','248435','246580','246613','246637','246617') $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update items_pedidos set estado_real=''01'' where numero in (''247537'',''2…', $q$update items_pedidos set estado_real='01'
where numero in ('247537','247291','247771','248351','248435',
'246580','246613','246637','246617')and estado_real in('02','00','03')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAPACITACIÓN', $q$CAPACITACIÓN$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ingresar una factura para genera devolucion', $q$ingresar una factura para genera devolucion
se toma el archivo que el cliente nos envía para subir los datos a jaivana, se deben subir los saldos en cero(items) porque afectaría log costos se deben validar bien antes de insertarlo$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', ' paso 1) se ingresan los items de la factura, los saldos deben subirse…', $q$ paso 1) se ingresan los items de la factura, los saldos deben subirse en cero ya que afectará el inventario y log costos de la empresa en la que se va hacer el proceso,  despues de haberse ingresado los items se ingresa la cabecera$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'si los items no insertan se mira en articulos para verificar si maneja…', $q$si los items no insertan se mira en articulos para verificar si manejan cantidades o no $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'después de haberse ingresado las cabeceras se dirije hacia log costos …', $q$después de haberse ingresado las cabeceras se dirije hacia log costos y se elimina de ahi ya que no es necesario tenerlo en esa tabla$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'depues se actualizan los items con la cantidades pedidas ya que se deb…', $q$depues se actualizan los items con la cantidades pedidas ya que se debe hacer la dv y para eso se necesitan los saldos para generar la dv$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', ' cuando se ingresan los saldos verificamos que hayan subido correctame…', $q$ cuando se ingresan los saldos verificamos que hayan subido correctamente $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'depues de haber actualizado los saldos, ya se sube la cabecera ya que …', $q$depues de haber actualizado los saldos, ya se sube la cabecera ya que es el ultimo paso a seguir $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'INSERTAR DATOS EN MOVIMIENTO2023 QUE NO PUEDEN SER NULOS', $q$INSERTAR DATOS EN MOVIMIENTO2023 QUE NO PUEDEN SER NULOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2023(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2023(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,nit,						sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,llave,base,tarifa,valor,codigo_origen,item, codigo_usuario)
 values('0101','2023-05-29','FE','23357001','79','0101','900199057','1','900199057','1','0001','Conta.FC79 Conta.2305006','79','P','0','0','0','595328','CONTA','1','ff')		$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INNER JOIN FACTURAS E ITEMS', $q$INNER JOIN FACTURAS E ITEMS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select f.nit,f.iva,f.nproveedor,i.codigo,i.cantidad  from facturac f i…', $q$select f.nit,f.iva,f.nproveedor,i.codigo,i.cantidad 
from facturac f inner join itemfc i  on f.numero=i.numero 
where f.fecha>='2023-08-18'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CONSULTAS', $q$CONSULTAS
select f.numero as numero_factura,f.nit,f.sede,f.nproveedor, f.observa detalle, f.fecha as fecha_factura,
i.codigo codigo_articulo,a.nombre nom_articulo, i.cantidad, i.subtotal1, i.valor_iva, i.valor_item ,i.detalle detalle_item,
f.pedido, p.fecha as fecha_pedido
from facturac f
inner join itemfc i on (f.numero,f.nit, f.fecha)=(i.numero,i.nit, i.fecha) -- (f.numero,f.nit,f.fecha)=(i.numero,i.nit,i.fecha)
inner join articulo a on i.codigo=a.codigo
left join pedidos p on f.pedido=p.numero
where f.fecha>='2023-01-18' -- and f.fecha=i.fecha and f.nit=i.nit
order by numero_factura$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select n.codigo_ciudad as ciudadsx,n.nit as nitsx, n.nombre as nombres…', $q$select n.codigo_ciudad as ciudadsx,n.nit as nitsx, n.nombre as nombresx, f.numero as numerofactura, f.ciudad as ciudadfactura, f.nit as nitfactura
from  nitsx_sedes n  inner join  facturac f on (n.codigo_ciudad,n.nit)=(f.ciudad,f.nit) where  n.nit in('19255350','41434942','3987301','19479221','901213787')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'ciudades con el nombre de las persona', $q$ciudades con el nombre de las persona
select c.codigo_ciudad as ciudad1, c.nombre as nombreCiudad,c.codigo_departamento_geografico 
as codigociudadepar, d.nombre as nombredepar, d.codigo_departamento_geografico as codigodepa,
n.nit as nitsx,n.nombre as nombresx
from ciudades1 c
inner join departamentos_geograficos d on (c.codigo_departamento_geografico=d.codigo_departamento_geografico)
inner join nitsx_sedes n on(n.codigo_ciudad=c.codigo_ciudad) order by c.codigo_ciudad  a$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select c.codigo_ciudad as ciudad1, c.nombre as nombreCiudad,c.codigo_d…', $q$select c.codigo_ciudad as ciudad1, c.nombre as nombreCiudad,c.codigo_departamento_geografico 
as codigociudadepar, d.nombre as nombredepar, d.codigo_departamento_geografico as codigodepa,
n.nit as nitsx,n.nombre as nombresx, f.numero as numerofact,f.ciudad as ciudad
from ciudades1 c
inner join departamentos_geograficos d on (c.codigo_departamento_geografico=d.codigo_departamento_geografico)
inner join nitsx_sedes n on(n.codigo_ciudad=c.codigo_ciudad) 
inner join facturac f on (f.ciudad=n.codigo_ciudad) where f.fecha between '2023-01-01' and '2023-01-31' order by c.codigo_ciudad  asc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ANALIZAR LA DIFERENCIA ENTRE LA FACTURA Y EL PEDIDO POR ITEMS', $q$ANALIZAR LA DIFERENCIA ENTRE LA FACTURA Y EL PEDIDO POR ITEMS
select p.numero as numeropedido,p.cantidad as cantidadp,p.codigo as codigop,p.precio_base as basep,p.valor_iva as ivap, p.precio_total as preciop,
i.numero as numerofactura, i.total_iva as ivafac, i.total_sin_iva as base, sum(i.total_iva+i.total_sin_iva) as valorfactura,i.codigo as codigofactura
from items_pedidos p inner join itemfc i on (p.codigo)=(i.codigo)
where p.numero in('262814') and i.numero in('01CR-645486')
GROUP BY
p.numero, p.cantidad, p.codigo, p.precio_base, p.valor_iva, p.precio_total, i.numero, i.total_iva, i.total_sin_iva, i.codigo;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ANALIZAR LA DIFERENCIA ENTRE LA FACTURA Y EL REMISION POR ITEMS', $q$ANALIZAR LA DIFERENCIA ENTRE LA FACTURA Y EL REMISION POR ITEMS
 Remisión 115984 por valor de $1.306.206, sin embargo al momento de generar la factura el valor de la factura quedó en $1.221.340, factura 01CR-646012$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select r.numero as numeroremision,r.cantidad as cantidadp,r.codigo as …', $q$select r.numero as numeroremision,r.cantidad as cantidadp,r.codigo as codigop,r.total_iva as iva,r.total_sin_iva as baseg, r.tarifa_iva as tarifaremision,
sum(r.total_sin_iva+r.total_iva) as precioremision,
f.tarifa_iva as tarifaivafac, f.numero as numerofactura, f.total_iva as ivafac, f.total_sin_iva as base, sum(f.total_iva+f.total_sin_iva) as valorfactura,f.codigo as codigofactura
from itemfc_remision r inner join itemfc f on (r.codigo)=(f.codigo)
where r.numero in('172523') and f.numero in('01CR-646012')
GROUP BY
r.numero,r.cantidad,r.codigo,r.total_iva,r.total_sin_iva,r.tarifa_iva,f.tarifa_iva,f.numero,f.total_iva,f.total
_sin_iva,f.codigo;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CONSULTA FACTURA, CARTERA,MOVIMIENTO', $q$CONSULTA FACTURA, CARTERA,MOVIMIENTO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select f.nproveedor as nombre, f.nit as nit_factura, f.valor as valor,…', $q$select f.nproveedor as nombre, f.nit as nit_factura, f.valor as valor, f.fecha as fecha,(cast(now() as date)-c.vence) as dias, c.nit as nit_cliente,
m.codigo_sucursal as sucursal, m.codigo_centro_costo as centros_costos, m.codigo_documento as documento,m.numero_documento as factura,
m.codigo_cuenta as cuenta, m.detalle as detalle from facturac f 
inner join cartera_clientes c on(f.nit)=(c.nit)
inner join movimiento2023 m on(f.numero)=(m.numero_documento)
where f.fecha between '2023-01-01' and '2023-01-02'
group by f.nproveedor,f.nit,f.valor,f.fecha,c.vence,c.nit,m.codigo_sucursal,m.codigo_centro_costo,m.codigo_documento,m.numero_documento,m.codigo_cuenta,m.detalle$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'NUEVA FACTURACIÓN  CON LA RESOLUCIÓN ADJUNTA ', $q$NUEVA FACTURACIÓN  CON LA RESOLUCIÓN ADJUNTA $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '---INSERTA EN FACTURACIONES insert into facturaciones (codigo_facturac…', $q$---INSERTA EN FACTURACIONES
insert into facturaciones (codigo_facturacion,elcodigofactura,bodega,tipo_venta,elprefijo,detalle,bodegas_mostrar,bodegas_autorizadas,
items_factura,imprimir_pedido,incluye_iva,impresora,modifica_precio,longitud_articulo,barras_relacionadas,
maneja_negativos,tarifa_iva_fletes,maneja_devuelta,maneja_puntos,abrir_cajon,corte,cambia_vendedor,codigo_sucursal,
maneja_dolares,factura_directo,papel)
(select  '0017','0017',bodega,tipo_venta,'DPCO-','FACTURA DE CONTINGENCIA DPCO',bodegas_mostrar,bodegas_autorizadas,
items_factura,imprimir_pedido,incluye_iva,impresora,modifica_precio,longitud_articulo,barras_relacionadas,
maneja_negativos,tarifa_iva_fletes,maneja_devuelta,maneja_puntos,abrir_cajon,corte,cambia_vendedor,codigo_sucursal,
maneja_dolares,factura_directo,papel from facturaciones where codigo_facturacion='0014' and id=14);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '---------INSERTA EN CONSCUTIVOS', $q$---------INSERTA EN CONSCUTIVOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into consecutivo_facturas (codigo_facturacion,numero_factura,pr…', $q$insert into consecutivo_facturas (codigo_facturacion,numero_factura,prefijo_factura,resolucion,rete_ica,tipo_formato,archivo_formato,
finicio,ffinal,ninicio,nfinal,minimo,estado,email,resolucion_otros,resolucion_credito,contingencia,resolucion_otros_facturacion,estadoactivo_id,
resolucion_devolucion,resolucion_devolucion_fe,numero_resolucion,llave_tecnica,punto_de_venta)
(select '0017',0,'DPCO-','No 18764091141389 del 2025-03-27 DEL DPCO-1 AL DPCO-5000 HABILITA Vig 12 m ',rete_ica,tipo_formato,archivo_formato,
'2025-03-27','2026-03-27',1,5000,minimo,estado,email,resolucion_otros,resolucion_credito,'S',resolucion_otros_facturacion,estadoactivo_id,
resolucion_devolucion,resolucion_devolucion_fe,'18764091141389','.',punto_de_venta
from consecutivo_facturas where codigo_facturacion='0014' and id=11);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '---INSERTAR EN CONFIGURACION_XML PARA LA SUCURSAL 0002', $q$---INSERTAR EN CONFIGURACION_XML PARA LA SUCURSAL 0002$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into configuracion_xml (sucursal, categoria, propiedad, valor,f…', $q$insert into configuracion_xml (sucursal, categoria, propiedad, valor,fecha_modificacion)
(select sucursal, 'facturacion_0017', propiedad, valor,current_timestamp 
 from configuracion_xml where categoria='facturacion_0014' and sucursal='0002');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update configuracion_xml set valor=''CONTADO'' where sucursal=''0002'' and…', $q$update configuracion_xml
set valor='CONTADO'
where sucursal='0002' and propiedad='detalle' and valor='CREDITO' and categoria='facturacion_0017';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update configuracion_xml  set valor=''0017''  where categoria=''facturaci…', $q$update configuracion_xml 
set valor='0017' 
where categoria='facturacion_0017' and propiedad='elcodigofactura' and sucursal='0002' and valor='0014';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update configuracion_xml  set valor=''CO''  where categoria=''facturacion…', $q$update configuracion_xml 
set valor='CO' 
where categoria='facturacion_0017' and propiedad='tipo_venta' and sucursal='0002' and valor='CR';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update configuracion_xml  set valor=''DPCO-''  where categoria=''facturac…', $q$update configuracion_xml 
set valor='DPCO-' 
where categoria='facturacion_0017' and propiedad='elprefijo' and sucursal='0002' and valor='CRC1-';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from configuracion_xml where propiedad=''facturaciones_autoriz…', $q$select * from configuracion_xml where propiedad='facturaciones_autorizadas' and sucursal='0002'
update configuracion_xml 
set valor=concat(valor,',0017') 
where propiedad='facturaciones_autorizadas' and sucursal='0002' and id=1152;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'HABILITAR BODEGA DE DATOS', $q$HABILITAR BODEGA DE DATOS
insert into configuracion_xml (sucursal,categoria,propiedad,valor) values   ('.', 'ventas','bodega_de_datos', 'S');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Modificar nombre de la siguiente línea: 0003 TORNILLOS INOXIDABLES Y A…', $q$Modificar nombre de la siguiente línea: 0003 TORNILLOS INOXIDABLES Y ALLEN
Dejar nombre solo como TORNILLOS INOXIDABLES
Crear nueva línea:
 TORNILLOS ALLEN
Quedamos atentos a los comentarios
 
Esta solicitud es generada por Cristiam Camilo Arias Martínez (Director Abastecimiento)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PROBLEMAS CON LA TIPOLOGIA EN LA INTEGRIDAD SEQUOIA', $q$PROBLEMAS CON LA TIPOLOGIA EN LA INTEGRIDAD SEQUOIA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Accede a la página de terceros en la dirección http://201.236.231.226:…', $q$Accede a la página de terceros en la dirección http://201.236.231.226:9300/login#no-back. Utiliza el usuario 'admin' y la clave '13102016' para iniciar sesión.
Navega a la ruta /herramientas/tablas/terceros/consultar-crear-editar/ y verifica la tipología asociada al tercero en cuestión.
Después de completar la primera auditoría, accede a la plataforma https://www.sequoia.com.co:8443/ServidorAdminIntegridad/#!/config/config utilizando el usuario 'SIS0002' y la clave '13102016'.
Consulta la ruta /herramientas/clientes en la plataforma mencionada. Utiliza el número de identificación tributaria (NIT) en el campo de búsqueda.
En el campo "tipo", verifica que coincida con la tipología del tercero que verificaste en la primera plataforma.
Si al realizar ediciones en la primera plataforma, los cambios no se actualizan en la segunda plataforma, registra esta información y toma evidencia de la discrepancia.
Posteriormente, presenta una solicitud de requerimiento al área de desarrollo con William. Indica claramente la discrepancia y proporciona la evidencia recopilada.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'El informe de ventas del día 19 de agosto en la caja 5 presenta una di…', $q$El informe de ventas del día 19 de agosto en la caja 5 presenta una diferencia de 3.900$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Utilizando la consulta llamada ''auditoria_cajas'', se debe ejecutar un …', $q$Utilizando la consulta llamada 'auditoria_cajas', se debe ejecutar un proceso de auditoría en una fecha y caja específica.
En el primer registro obtenido por esta consulta, se registrará el número del documento que presenta discrepancias en los valores.
A continuación, es necesario verificar los elementos individuales (llamados "items") de la factura correspondiente y compararlos con la información de la cabecera de dicha factura.
En la mayoría de los casos, se encontrará uno o más elementos duplicados en la factura.
Para abordar este problema, se debe revisar la tabla 'cajaxkardex' para verificar si los elementos duplicados tuvieron algún tipo de movimiento registrado.
Si se confirma que hay movimiento relacionado con el o los elementos duplicados en el 'kardex', se debe identificar dichos elementos y reportar este hallazgo al cliente.
Además, se deberá reconstruir la cabecera de la factura utilizando el query denominado 'Encabezado_factura'.
En caso de que no haya movimiento registrado en el 'kardex' para los elementos duplicados, se procederá a eliminar esos elementos de la factura.
Finalmente, si se eliminaron elementos, se llevará a cabo la tarea de restaurar las cabeceras afectadas.
El usuario habilitado para realizar validaciones en todos los módulos, plataformas y aplicaciones de Integridad por Jaivana, a excepción de la página de Sequoia, es el siguiente:
- Usuario: admin
- Contraseña: 13102016
Para acceder a la página de Sequoia, se debe utilizar el siguiente conjunto de credenciales:
- Usuario: SIS0002
- Contraseña: 13102016
En los próximos días, iniciaré la capacitación en los procesos de la plataforma Sequoia. Esta plataforma se destaca por su complejidad y su papel fundamental en la prestación de soporte, siendo una de las plataformas más prominentes en ese contexto.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'https://www.sequoia.com.co:8443/Manuales/admin/index.htm?usuario=SIS00…', $q$https://www.sequoia.com.co:8443/Manuales/admin/index.htm?usuario=SIS0002&token=36a2dcc80cc18198ec159c8a1fabecf9926e922d$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'tenemos diferencia de 9350 en a caja 4 de la 13', $q$tenemos diferencia de 9350 en a caja 4 de la 13$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'drop TABLE t1;DROP TABLE t2; CREATE temp TABLE t2 AS ( SELECT  numero …', $q$drop TABLE t1;DROP TABLE t2;
CREATE temp TABLE t2 AS (
SELECT  numero
       ,SUM(cantidad*precio_sin_iva) AS valor_sin_iva
FROM caja4itemf
WHERE fecha>='2023-09-19'
AND fecha<='2023-09-26'
GROUP BY  numero ORDER BY numero);
CREATE temp TABLE t1 AS (
SELECT  numero           AS numero1
       ,SUM(basee+baseg) AS valor_sin_iva1
FROM caja4factura
WHERE fecha>='2023-09-19'
AND fecha<='2023-09-26'
GROUP BY  numero ORDER BY numero);
SELECT  t1.numero1
       ,t1.valor_sin_iva1-t2.valor_sin_iva
FROM t1, t2
WHERE t2.numero=t1.numero1
ORDER BY t1.valor_sin_iva1-t2.valor_sin_iva$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '---------///----------///------------------------ select * from caja4f…', $q$---------///----------///------------------------
select * from caja4factura where numero in('275143') ---9078.569200+120$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update caja4factura set detalle=''NIT: 999999, DIRECCION: ., TELEFONO: …', $q$update caja4factura set detalle='NIT: 999999, DIRECCION: ., TELEFONO: 0',usuario='206'
where numero in('275143') and valor='40904.00' and detalle='.' and efectivo='40904.00'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from caja4itemf where numero in(''275143'') --and codigo in(''30…', $q$select * from caja4itemf where numero in('275143') --and codigo in('302419','307928')
order by codigo
asc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select codigo,count(codigo) as repetidos from caja4kardex where numero…', $q$select codigo,count(codigo) as repetidos from caja4kardex where numero_factura='275143'
GROUP BY codigo
having count(codigo)>1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select sum(precio_base+precio_sin_iva) from caja4itemf where numero in…', $q$select sum(precio_base+precio_sin_iva) from caja4itemf where numero in('275143')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'insert into caja4factura (prefijo,numero,fecha,sucursal,valor,basee,ba…', $q$insert into caja4factura (prefijo,numero,fecha,sucursal,valor,basee,baseg,valor_iva,cliente,ncliente,detalle,
efectivo,credito,otros,hora_inicio,hora_fin,valor_descuento,sede,usuario,turno,impuesto,estado,valor_atencion,valor_descuento_acumulable,
valor_ajuste_precio,cantidad_bolsa,valor_inc_bolsa)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select ''BMP4'',''275143'',''2023-09-23'',''0002'',sum(valor_item),0, 0, sum(v…', $q$select 'BMP4','275143','2023-09-23','0002',sum(valor_item),0, 0,
sum(valor_iva * cantidad),'999999','GENERICO','.',
sum(valor_item), 0, 0, '16:38:07', '16:38:18', 0, 1, '201','0','0.00','.','0.00','160.00','0.00','2.00','60.00'
from caja4itemf where fecha = '2023-09-23'and numero in ('275143')
group by numero,fecha;
update caja4factura set basee = t.basee
from ( select numero, fecha,
sum(precio_sin_iva * cantidad) as basee
from caja4itemf where fecha = '2023-09-23' and tarifa_iva = 0 and numero in ('275143')
group by numero,fecha) t
where caja4factura.fecha = '2023-09-23'and caja4factura.numero = t.numero and caja4factura.fecha = t.fecha;
update caja4factura set baseg = t.baseg from (select numero,fecha,sum(precio_sin_iva * cantidad) as baseg
from caja4itemf where fecha = '2023-09-23' and tarifa_iva <> 0 and numero in ('275143')
group by numero,fecha) t
where caja4factura.fecha = '2023-09-23'and caja4factura.numero = t.numero and caja4factura.fecha = t.fecha;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'BORRAR FRAME TEXTOS DUPLICADOS', $q$BORRAR FRAME TEXTOS DUPLICADOS
---se revisa la duplicidad
select * from framestextos where codigo='BODEGAS' and orden in (20,21,22,23,24,25)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '-- se crea una temporal para insertar los datos que son iguales select…', $q$-- se crea una temporal para insertar los datos que son iguales
select distinct * into framestextos_tmp_james from framestextos where codigo='BODEGAS' and orden in (20,21,22,23,24,25)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--se valida la insercion en la temporal select * from framestextos_tmp…', $q$--se valida la insercion en la temporal
select * from framestextos_tmp_james$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '--se borran de la tabla todos los duplicados delete  from framestextos…', $q$--se borran de la tabla todos los duplicados
delete  from framestextos where codigo='BODEGAS' and orden in (20,21,22,23,24,25)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--se insertan en la tabla principal de la temporal  insert into frames…', $q$--se insertan en la tabla principal de la temporal 
insert into framestextos(select * from framestextos_tmp_james)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '-- se borra la temporal drop table framestextos_tmp_james', $q$-- se borra la temporal
drop table framestextos_tmp_james$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '---se valida la insercion  select * from framestextos where codigo=''BO…', $q$---se valida la insercion 
select * from framestextos where codigo='BODEGAS' and orden in (20,21,22,23,24,25)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'LA INTEGRIDAD', $q$LA INTEGRIDAD
HD-40818$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Por favor revisar en el sistema, ya que hay una factura pos duplicada …', $q$Por favor revisar en el sistema, ya que hay una factura pos duplicada del día 18/09/2023 de la caja 5 por valor de $55.889,75 con numero de factura MYA5-191386 en la 38$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '.Introducción:', $q$.Introducción:
Este informe técnico tiene como objetivo proporcionar un conjunto completo de instrucciones y consultas SQL para abordar la duplicidad en una factura pos y actualizar los registros correspondientes en la base de datos. El proceso implica verificar la duplicidad de la factura, validar y corregir los valores reportados por el usuario, y garantizar la consistencia en otros campos relacionados.
Instrucciones Detalladas:
Paso 1: Verificar la Duplicidad de la Factura
Instrucción Técnica:
"Primero, realizaremos una consulta SQL para verificar la existencia de la factura con el número '191386' en la tabla 'caja5factura'. Esto nos ayudará a establecer la veracidad de los hechos."
Consulta SQL:
---- PASO1 VERIFICAR SI LAS FACTURAS ESTAN DUPLICADAS
SELECT oid, * FROM public.caja5factura
WHERE numero = '191386';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '-- Verificar duplicados de items SELECT oid, * FROM public.caja5itemf …', $q$-- Verificar duplicados de items
SELECT oid, * FROM public.caja5itemf
WHERE numero = '191386';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '-- Obtener la suma de valores de items SELECT SUM(valor_item) FROM pub…', $q$-- Obtener la suma de valores de items
SELECT SUM(valor_item) FROM public.caja5itemf --esta ducplicada 111779.50
WHERE numero = '191386';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--verificar el movimiento kardex SELECT oid, * FROM public.caja5kardex…', $q$--verificar el movimiento kardex
SELECT oid, * FROM public.caja5kardex 
WHERE numero_factura = '191386' 
ORDER BY oid;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '----- solucion final de la factura ducplicada insert into caja5factura…', $q$----- solucion final de la factura ducplicada
insert into caja5factura (prefijo,numero,fecha,sucursal,valor,basee,baseg,valor_iva,cliente,ncliente,
detalle,efectivo,credito,otros,hora_inicio,hora_fin,valor_descuento,sede,usuario,turno)
select 'MYA5', numero, fecha,'0004',sum(valor_item),0,0,sum(valor_iva * cantidad),'999999','GENERICO',
'.', sum(valor_item), 0,0,'12:00','12:00',0,1,'admin','1'
from caja5itemf where fecha = '2023-09-18'and numero in ('191386')
group by numero,fecha;
update caja5factura set basee = t.basee from (select numero,fecha,sum(precio_sin_iva * cantidad) as basee
from caja5itemf where fecha = '2023-09-18' and tarifa_iva = 0 and numero in ('191386')
group by numero,fecha) t where caja5factura.fecha = '2023-09-18'
and caja5factura.numero = t.numero
and caja5factura.fecha = t.fecha;
update caja5factura set baseg = t.baseg from (select numero,fecha,sum(precio_sin_iva * cantidad) as baseg
from caja5itemf where fecha = '2023-09-18'and tarifa_iva <> 0 and numero in ('191386')
group by numero,fecha) t where caja5factura.fecha = '2023-09-18'and caja5factura.numero = t.numero and caja5factura.fecha = t.fecha;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INTEGRIDAD CONTABILIDAD', $q$INTEGRIDAD CONTABILIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Por favor revisar en el sistema, ya que hay una factura electrónica de…', $q$Por favor revisar en el sistema, ya que hay una factura electrónica de la 10 que se duplico en el modulo de contabilidad por $76.900,28 de la caja 8 del día 18/09/2023$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 1: Verificar duplicados en contabilidad', $q$Paso 1: Verificar duplicados en contabilidad$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Ejecuta la siguiente consulta SQL para identificar registros duplicado…', $q$Ejecuta la siguiente consulta SQL para identificar registros duplicados en la tabla movimiento2023 con el número de documento 'SPFE4921':$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'SELECT oid, * FROM public.movimiento2023 WHERE numero_documento = ''SPF…', $q$SELECT oid, * FROM public.movimiento2023
WHERE numero_documento = 'SPFE4921';
Si encuentras duplicados en movimiento2023, procede al Paso 2.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 2: Verificar duplicados en factura', $q$Paso 2: Verificar duplicados en factura$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Ejecuta la siguiente consulta SQL para buscar duplicados en la tabla f…', $q$Ejecuta la siguiente consulta SQL para buscar duplicados en la tabla facturac con el número 'SPFE4921':$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SELECT oid, * FROM public.facturac WHERE numero = ''SPFE4921''; Si encue…', $q$SELECT oid, * FROM public.facturac
WHERE numero = 'SPFE4921';
Si encuentras duplicados en facturac, procede al Paso 3.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 3: Verificar duplicados en items', $q$Paso 3: Verificar duplicados en items$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Ejecuta la siguiente consulta SQL para buscar duplicados en la tabla i…', $q$Ejecuta la siguiente consulta SQL para buscar duplicados en la tabla itemfc con el número 'SPFE4921':$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SELECT oid, * FROM public.itemfc WHERE numero = ''SPFE4921''; Si encuent…', $q$SELECT oid, * FROM public.itemfc
WHERE numero = 'SPFE4921';
Si encuentras duplicados en itemfc, procede al Paso 4.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 4: Verificar duplicados en la sede de origen y kardex', $q$Paso 4: Verificar duplicados en la sede de origen y kardex$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Verifica si hay duplicados en la sede de origen y kardex según tus nec…', $q$Verifica si hay duplicados en la sede de origen y kardex según tus necesidades específicas. Ejecuta las consultas adecuadas para esta verificación.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 5: Protocolos de reconstrucción de facturas', $q$Paso 5: Protocolos de reconstrucción de facturas$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Sigue los protocolos de reconstrucción de facturas según tus procedimi…', $q$Sigue los protocolos de reconstrucción de facturas según tus procedimientos establecidos. Asegúrate de realizar todas las acciones necesarias para resolver la duplicación de registros.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Paso 6: Solucionar duplicados en movimiento2023', $q$Paso 6: Solucionar duplicados en movimiento2023$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Si se encontraron duplicados en movimiento2023, identifica los duplica…', $q$Si se encontraron duplicados en movimiento2023, identifica los duplicados por oid y elimina la duplicidad.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '(esto seria de manera manual) si no sigue los siguientes pasos ', $q$(esto seria de manera manual) si no sigue los siguientes pasos $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Paso 7: Eliminar registro de factura en movimiento2023', $q$Paso 7: Eliminar registro de factura en movimiento2023$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'Si se requiere eliminar completamente el registro de la factura de mov…', $q$Si se requiere eliminar completamente el registro de la factura de movimiento2023, excepto el dato costeo, realiza la eliminación.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Paso 8: Marcar campo contable en facturac', $q$Paso 8: Marcar campo contable en facturac$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'En la tabla facturac, actualiza el campo contable reemplazando ''*'' por…', $q$En la tabla facturac, actualiza el campo contable reemplazando '*' por un punto '.'.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Paso 9: Realizar interfaz con módulo de Jaivana', $q$Paso 9: Realizar interfaz con módulo de Jaivana$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Realiza la interfaz necesaria con el módulo de Jaivana, asegurando que…', $q$Realiza la interfaz necesaria con el módulo de Jaivana, asegurando que se incluyan la fecha y la sucursal adecuadas en la transferencia de datos.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Estas instrucciones deben ayudarte a validar y resolver duplicados en …', $q$Estas instrucciones deben ayudarte a validar y resolver duplicados en los registros de contabilidad según tu requerimiento. $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INTEGRIDAD', $q$INTEGRIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Cordial saludo, solicito su colaboración con la inactivación o elimina…', $q$Cordial saludo, solicito su colaboración con la inactivación o eliminación de un ajuste al precio de los productos de código 301208-323350-302345 de la sede Super la 10, ya que estos al tener ajuste al precio activo no permiten hacer una nota de descuento. Anexo evidencia.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'Conforme a la solicitud, se identifican los artículos con números 3012…', $q$Conforme a la solicitud, se identifican los artículos con números 301208, 323350 y 302345 pertenecientes a la sede Super la 10. Estos artículos presentan un ajuste en el precio activo que impide la creación de una nota de descuento.
Los ajustes de precio registrados son los siguientes:
Ajuste al precio número 269.
Ajuste al precio número 1091.
Ajuste al precio número 2064.
Para abordar esta situación, se procederá a acceder a la base de datos local de la sede mencionada. Se realizarán las siguientes consultas:
Consulta 1:
SELECT
*
FROM
public
.
notas_proveedor_descuento
WHERE
numero
=
'269'
En esta consulta, se verificará la integridad de los datos y se analizará el estado de la cabecera de la nota donde se aplicó el ajuste. Se llevará a cabo una revisión para asegurarse de que los datos sean precisos.
Posteriormente, se realizará la siguiente consulta:
Consulta 2:
SELECT
*
FROM
public
.
notas_proveedor_descuento_lineas
WHERE
numero
=
'269'
En esta segunda consulta, se examinarán los elementos de la nota de ajuste para confirmar que los elementos coincidan con lo reportado y se mantenga la integridad de los datos.
Es importante recordar que las consultas deben ser modificadas según las necesidades específicas del cliente.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Una vez completada esta revisión, se tomará la siguiente acción para s…', $q$Una vez completada esta revisión, se tomará la siguiente acción para solucionar el problema.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'Si en la cabecera de la nota el campo "estado" está marcado como ''C'' (…', $q$Si en la cabecera de la nota el campo "estado" está marcado como 'C' (cerrado), se actualizará este mismo estado en el campo "estado" de la tabla "notas_proveedor_descuento_lineas". Esto se hace debido a la posibilidad de que la nota no se haya cerrado correctamente, y el estado deberá permanecer como 'A' (abierto). Las notas deberán estar en estado 'C' una vez que se haya completado este procedimiento.
Finalmente, se procederá a comunicarse con el cliente para informarle que puede continuar con sus procesos de manera normal, verificando que los problemas hayan sido resueltos satisfactoriamente.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'calcular retencion', $q$calcular retencion
update facturac set retencion= round((select ((sum(total_sin_iva)) * (retencion/100)) from itemfc
where numero='198301' and codigo_sucursal ='0101' group by retencion),0) where numero='198301' and codigo_sucursal ='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'calcular reteiva', $q$calcular reteiva
update facturac set valor=round((iva+basee+baseg+impoconsumo)-(valor_rete_iva)-(retencion)) 
where numero='198301' and codigo_sucursal ='0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SABER SI SE SALTA EL CONSECUTIVO', $q$SABER SI SE SALTA EL CONSECUTIVO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SELECT concat(''AL-'',(SUBSTRING(numero,(POSITION(''-'' IN numero)+1))::nu…', $q$SELECT concat('AL-',(SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric +1)) as numero FROM facturac
	where (SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric +1) not in (SELECT SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric FROM facturac where fecha between '2023-08-01' and '2023-08-28'  and numero ilike'AL-%')
	and (SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric +1) > (SELECT min(SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric) FROM facturac where fecha between '2023-08-01' and '2023-08-28' and numero ilike'AL-%')
	and (SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric +1) < (SELECT max(SUBSTRING(numero,(POSITION('-' IN numero)+1))::numeric) FROM facturac where fecha  between '2023-08-01' and '2023-08-28'  and numero ilike'AL-%')
	and fecha between '2023-08-01' and '2023-08-28' and numero ilike'AL-%' -- order by numero$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'AGREGAR SI NO SE SALTA EL CONSECUTIVO', $q$AGREGAR SI NO SE SALTA EL CONSECUTIVO
select * from consecutivo_facturas where prefijo_factura ilike'AL-%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update consecutivo_facturas set numero_factura=numero_factura + 1 wher…', $q$update consecutivo_facturas set numero_factura=numero_factura + 1
where prefijo_factura ilike'AL-%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select id,* from cartera_clientes where numero in(''FEVV-12756'')', $q$select id,* from cartera_clientes where numero in('FEVV-12756')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update configuracion_xml set codigo_sucursal=''0101'' where numero in(''F…', $q$update configuracion_xml set codigo_sucursal='0101'
where numero in('FEVV-12756') and id in (33804)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from configuracion_xml where valor ilike ''%0111%''', $q$select * from configuracion_xml where valor ilike '%0111%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from cartera_clientes where codigo_sucursal=''0111''', $q$select * from cartera_clientes where codigo_sucursal='0111'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac where numero=''FEVV-12673''', $q$select * from facturac where numero='FEVV-12673'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo=''VM''', $q$select * from usuarios where codigo='VM'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'select * from vendedoresx where codigo_vendedor=''023''', $q$select * from vendedoresx where codigo_vendedor='023'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Select id,* from pedidos where sucursal_cartera=''0111'' and estado=''A''', $q$Select id,* from pedidos where sucursal_cartera='0111' and estado='A'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update pedidos set sucursal_cartera=''0101''', $q$update pedidos set sucursal_cartera='0101'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from configuracion_xml where valor ilike ''%0111%''', $q$select * from configuracion_xml where valor ilike '%0111%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select id,* from cartera_clientes where codigo_sucursal=''0101''', $q$select id,* from cartera_clientes where codigo_sucursal='0101'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update cartera_clientes set codigo_sucursal=''0101'' where id in(33721,3…', $q$update cartera_clientes set codigo_sucursal='0101'
where id in(33721,33732,33796,33833,33918,33931,34003,34027,
34034,34037,34065,34074,34088,34089) $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac where numero=''FEVV-12673''', $q$select * from facturac where numero='FEVV-12673'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo=''VM''', $q$select * from usuarios where codigo='VM'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'select * from vendedoresx where codigo_vendedor=''023''', $q$select * from vendedoresx where codigo_vendedor='023'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Select id,* from pedidos where sucursal_cartera=''0111'' and estado=''A''', $q$Select id,* from pedidos where sucursal_cartera='0111' and estado='A'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAPACITACION 2023/09/01', $q$CAPACITACION 2023/09/01$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'inventario', $q$inventario 
inventario fisico 
se selecciona la bodega que se necesita $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Actualmente, cualquier ajuste se realiza', $q$Actualmente, cualquier ajuste se realiza 
SKU por SKU, proceso que es dispendioso en la medida que se puedan generar muchos ítems por ajustar en cantidad.  $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'se envia usuarios de Genny leandra y John erick Maestre para que le ha…', $q$se envia usuarios de Genny leandra y John erick Maestre para que le habiliten los permisos, quedo a la espera para recibir la capacitacion sobre el proceso y luego transmitirla$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'jemd', $q$jemd$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'glmh', $q$glmh$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios_autorizados_invf select * from configuracion_xm…', $q$select * from usuarios_autorizados_invf
select * from configuracion_xml where categoria ilike'%inventario_fisico%' and propiedad ilike'%acumula%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update configuracion_xml set valor=''S'' where categoria ilike''%inventar…', $q$update configuracion_xml set valor='S'
where categoria ilike'%inventario_fisico%' and propiedad ilike'%acumula%' and sucursal in('0102','0103')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo in(''jemd'',''glmh'')', $q$select * from usuarios where codigo in('jemd','glmh')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'CAMBIO DE FECHA PARIS 2023MOVIMIENTO', $q$CAMBIO DE FECHA PARIS 2023MOVIMIENTO 
insert into movimiento2023(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,nit,sede,nit_responsable,
						  sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,
						  tarifa,valor,codigo_origen,item,codigo_usuario)
values('0101','2023-08-15','FE','51953500','6603300583','0101','890500726','1','890500726','1','0002','6603300583 CONSUMO COMBUSTIBLE MONTACARGAS MANIZALES',
	   '6603300583','N','0','0','0.00','0.00','-165900.00','CONTA','1','YAS')
Lunes, 4 de septiembre$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Por favor su apoyo subiendo el saldo a cartera de los siguiente docume…', $q$Por favor su apoyo subiendo el saldo a cartera de los siguiente documentos del cliente TUL SAS nit 901359837, 
documentos contabilizados correctamente a la 13802540$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from cartera_clientes where nit in(''901359837'')', $q$select * from cartera_clientes where nit in('901359837')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into cartera_clientes(codigo_sucursal,numero,fecha,vence,valor,…', $q$insert into cartera_clientes(codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,valor1,valor2,valor3,valor4,
							codigo_vendedor,tipo_venta,contable,sucursal_origen,sucursal_facturacion,retencion)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'values(''0101'',''149'',''2023-07-31'',''2023-07-31'','' 2190726'','' 2190726'',''A…', $q$values('0101','149','2023-07-31','2023-07-31',' 2190726',' 2190726','AJUSTE DE LA COMPRA WYT71557 CON FECHA 2023-07-31 08:51:31.481539 Y CODIGO_SUCURSAL 0701. CALI COL-19316149',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','150','2023-07-31','2023-07-31','7545816','7545816','AJUSTE DE LA COMPRA WYT71620 CON FECHA 2023-07-31 09:01:57.663181 Y CODIGO_SUCURSAL 0701. CALI, COL-19425150',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','151','2023-07-31','2023-07-31','828835','828835','AJUSTE DE LA COMPRA AJ333315 CON FECHA 2023-07-31 10:28:41.915999 Y CODIGO_SUCURSAL 0701. PEREIRA COL-18709151',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','152','2023-07-31','2023-07-31','6781553','6781553','AJUSTE DE LA COMPRA WST79251 CON FECHA 2023-07-31 14:49:15.498187 Y CODIGO_SUCURSAL 0701. BQLLA, COL-19424152',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','153','2023-07-31','2023-07-31','3610998','3610998','AJUSTE DE LA COMPRA WIT91264 CON FECHA 2023-07-31 16:04:52.362112 Y CODIGO_SUCURSAL 0701. MEDELLIN, COL- 18831153',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','154','2023-07-31','2023-07-31','6416854','6416854','AJUSTE DE LA COMPRA WIT91329 CON FECHA 2023-07-31 16:13:39.008009 Y CODIGO_SUCURSAL 0701. MEDELLIN, COL-19426154',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','155','2023-07-31','2023-07-31','18457275','18457275','AJUSTE DE LA COMPRA WYT70070 CON FECHA 2023-07-31 16:51:47.186026 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19557155',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','156','2023-07-31','2023-07-31','25276850','25276850','AJUSTE DE LA COMPRA WTB18567 CON FECHA 2023-07-31 17:01:07.190661 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19556156',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','157','2023-07-31','2023-07-31','4846614','4846614','AJUSTE DE LA COMPRA WTB21362 CON FECHA 2023-07-31 17:04:19.820935 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19554157',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','158','2023-07-31','2023-07-31','6033366','6033366','AJUSTE DE LA COMPRA WTB18732 CON FECHA 2023-07-31 17:26:24.784683 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19553158',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','159','2023-07-31','2023-07-31','2184293','2184293','AJUSTE DE LA COMPRA WTB22961 CON FECHA 2023-07-31 17:34:01.988213 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19553159',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','160','2023-07-31','2023-07-31','53902','53902','AJUSTE DE LA COMPRA WST79231 CON FECHA 2023-07-31 17:38:16.979666 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19553160',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','161','2023-07-31','2023-07-31','9894191','9894191','AJUSTE DE LA COMPRA FJ90050340 CON FECHA 2023-07-31 18:03:50.530371 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19081161',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','162','2023-07-31','2023-07-31','7038618','7038618','AJUSTE DE LA COMPRA FZ80064841 CON FECHA 2023-07-31 18:07:24.026652 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19081162',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0'),
	   ('0101','163','2023-07-31','2023-07-31','16354083','16354083','AJUSTE DE LA COMPRA FVYU12624-1 CON FECHA 2023-07-31 19:18:04.080809 Y CODIGO_SUCURSAL 0701. Dropshipping, COL-19082163',
	   '901359837','1','LEFV','0','0','0','0','LEFV','CR','13802540','0701','0101','0');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIO DE TURNO UNOA', $q$CAMBIO DE TURNO UNOA
desde el incidencia con la caja 4 dl turno erróneo, no se ha registrado nada en el turno 3265 
que es el siguiente despues de reportada la falla, pero cuando revisamos ahi estan incluidas 
las facturas que debería estar en el turno 3264 por favor su ayuda modificandolas $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Todas las del turno 3265 caja 4 pasarlas al turno 3264 caja 4', $q$Todas las del turno 3265 caja 4 pasarlas al turno 3264 caja 4$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select id,turno,* from caja4factura where turno=''3264''', $q$select id,turno,* from caja4factura where turno='3264'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from caja4tarjetas where turno=''3265''', $q$select * from caja4tarjetas where turno='3265'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from forma_pago_electronica where caja in(''4'') and turno in(''…', $q$select * from forma_pago_electronica where caja in('4') and turno in('3265')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from caja1bonos', $q$select * from caja1bonos$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'BUSCAR EN LA BASES DE DATOS LOCAL PRIMERO ANTES DE HACER EL CAMBIO', $q$BUSCAR EN LA BASES DE DATOS LOCAL PRIMERO ANTES DE HACER EL CAMBIO 
Su ayuda por favor con la caja 5 ya que el turno que tiene esta erróneo, el correcto debería ser el 3243 para el dia de hoy 27 de septiembre, 
motivo por el cual no se pudo utilizar la caja hoy $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select id,turno,* from caja5factura where fecha between ''2023-09-26'' a…', $q$select id,turno,* from caja5factura where fecha between '2023-09-26' and '2023-09-27' and turno='3242'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from aperturas_cajas where caja in(''5'')', $q$select * from aperturas_cajas where caja in('5')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select turno,* from caja5tarjetas where turno=''3242''', $q$select turno,* from caja5tarjetas where turno='3242'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from forma_pago_electronica where caja in(''5'') and fecha_fact…', $q$select * from forma_pago_electronica where caja in('5') and fecha_factura='2023-09-27' and turno in('3242')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'PERMISOS PARA AUTORIZAR PEDIDOS POR VENDEDOR', $q$PERMISOS PARA AUTORIZAR PEDIDOS POR VENDEDOR$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'al usuarios que piden los permisos para auto pedidos se debe cambiar e…', $q$al usuarios que piden los permisos para auto pedidos se debe cambiar en el campo supervisor por S si esta en N 
Asignar al usuario Jhon Fredy Ramirez Diaz JFR1 el rol de analista para autorizar pedidos en jaivana web.
Y por favor asociarle los siguientes vendedores para ser autorizados sus pedidos.
KJML
VML
FERR
VMM
WEB1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from usuarios where codigo in(''jfr1'')', $q$select * from usuarios where codigo in('jfr1')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Vendedores', 'select * from vendedoresx where codigo_vendedor in(''KJML'',''VML'',''FERR''…', $q$select * from vendedoresx where codigo_vendedor in('KJML','VML','FERR','VMM','WEB1')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'AUTORIZAR CARTERA', $q$AUTORIZAR CARTERA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT * FROM configuracion_xml WHERE sucursal in(''0110'') and categori…', $q$SELECT * FROM configuracion_xml WHERE sucursal in('0110') and categoria ilike'%pedidos%' and propiedad ilike'%sucursales_autorizadas_cartera%'
14:48
-- AQUI LE AGREGA LA SUCURSAL QUE QUIERE AUTORIZAR PARA CARTERA
update configuracion_xml set valor= concat(valor,',0102','1102') where categoria='pedidos' and propiedad='sucursales_autorizadas_cartera' and sucursal='0110'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CONSULTAR EL CAMBIO DE REOSLUCION EN JAIVANA FACTURAS POS', $q$CONSULTAR EL CAMBIO DE REOSLUCION EN JAIVANA FACTURAS POS
ventas-punto de venta-caja en la cual se cambio la resolcuion$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CARTERA CLIENTES', $q$CARTERA CLIENTES$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Por favor me colaboran dejando la NC 2164 de fecha 22 de septiembre en…', $q$Por favor me colaboran dejando la NC 2164 de fecha 22 de septiembre en cero(0) en el modulo de cartera, se realizó en contabilidad porque emparejar los saldos de los cliente en los dos módulos, adjunto autorización de la Lider Comercial.
SELECT oid, * FROM public.cartera_clientes
WHERE numero = 'NC2164' 
AND fecha = '2023-09-22'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ACTIVAR RESPONSABLE EN DV', $q$ACTIVAR RESPONSABLE EN DV 
acturación - Devolución Ventas - Crear Responsables de Devoluciones Ventas
                                            Se ingrese el codigo del usuario (en este caso SREF)
                                            Se ingresa el nombre del usuario (STEFFY RASHEED ESPINOSA FONSECA)
                                            y se le da al botón "Actualziar$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', '  insert into responsables_devoluciones_ventas (codigo_responsable, no…', $q$  insert into responsables_devoluciones_ventas (codigo_responsable, nombre) values('LMPG','LAURA MELISSA PERDOMO GALLEGO')
    -- Método 2
    insert into responsables_devoluciones_ventas (codigo_responsable, nombre)(select codigo, nombre from usuarios where codigo='LMPG')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'CREAR UNA TABLA PARA ELIMINAR REGISTROS IGUALES', $q$CREAR UNA TABLA PARA ELIMINAR REGISTROS IGUALES
--! si quieres crear una tabla con informacion de otra  se debe hacer esto:
primero se mira q desea coiar este casi un id especifico q es  637804
select * from movimiento2023  where numero_documento='FMC-29457' and fecha_documento='2023-01-16' and id='637804'
despues de identificar el documento vamos a crear una tabla con el nombre movimiento2023_tmpcarlos
usamos el select para indicar q campos copiar y el dis es por si esta duplicado solo traera 1 regsitro de los 2
create table movimiento2023_tmpcarlos as (select distinct * from movimiento2023 where numero_documento='FMC-29457'
                                          and fecha_documento='2023-01-16' and id='637804' )
si es necesario se puede eliminar de la tabla antigua tabla
delete from movimiento2023  where numero_documento='FMC-29457' and fecha_documento='2023-01-16' and id='637804'
seleccionamos movimiento2023_tmpcarlos para ver q registros nos trajo
select * from movimiento2023_tmpcarlos
para insertar los archivos q estan en movimiento2023_tmpcarlos a movimiento2023 se debe insertar asi
insert into movimiento2023 (select * from movimiento2023_tmpcarlos)
por ultimo eliminamos la tabla que habiamos creado para asi dejar de ocupar espacio importa en memoria
DROP TABLE IF EXISTS movimiento2023_tmpcarlos; (editado) $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '—------------/—-------------/—---------------/—-----------------------', $q$—------------/—-------------/—---------------/—-----------------------$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'drop table if exists tmp_proceso1; drop table if exists tmp_proceso2; …', $q$drop table if exists tmp_proceso1;
drop table if exists tmp_proceso2;
drop table if exists tmp_proceso3;
drop table if exists tmp_proceso4;
drop table if exists tmp_proceso5;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'drop table if exists tmp_proceso_total;', $q$drop table if exists tmp_proceso_total;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- resumen2021 select codigo_cuenta,nit,sede,sum(saldo) as xvalor     …', $q$-- resumen2021
select codigo_cuenta,nit,sede,sum(saldo) as xvalor 
       into table tmp_proceso1
       from resumen2021 
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- valores negativos alter table tmp_proceso1 add column concepto varc…', $q$-- valores negativos
alter table tmp_proceso1 add column concepto varchar(10);
update tmp_proceso1 set concepto='saldo_ini';       
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso2
       from movimiento2022 
       where valor<0 and fecha_documento<='2022-06-30'
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'alter table tmp_proceso2 add column concepto varchar(10); update tmp_p…', $q$alter table tmp_proceso2 add column concepto varchar(10);
update tmp_proceso2 set concepto='ene_nov_c';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- valores positivos select codigo_cuenta,nit,sede,sum(valor) as xvalo…', $q$-- valores positivos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso3
       from movimiento2022 
       where valor>0 and fecha_documento<='2022-06-30'
       group by codigo_cuenta,nit,sede;
alter table tmp_proceso3 add column concepto varchar(10);
update tmp_proceso3 set concepto='ene_nov_d';    $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '--diciembre valores negativos select codigo_cuenta,nit,sede,sum(valor)…', $q$--diciembre valores negativos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso4
       from movimiento2022 
       where valor<0 and fecha_documento>'2022-06-30'
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'alter table tmp_proceso4 add column concepto varchar(10); update tmp_p…', $q$alter table tmp_proceso4 add column concepto varchar(10);
update tmp_proceso4 set concepto='dic_c';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- Diciembre valores positivos select codigo_cuenta,nit,sede,sum(valor…', $q$-- Diciembre valores positivos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso5
       from movimiento2022 
       where valor>0 and fecha_documento>'2022-06-30'
       group by codigo_cuenta,nit,sede;
alter table tmp_proceso5 add column concepto varchar(10);
update tmp_proceso5 set concepto='dic_d';       $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * into tmp_proceso_total from tmp_proceso1; -- inserta todo lo …', $q$select * into tmp_proceso_total from tmp_proceso1; -- inserta todo lo del resumen2021
insert into tmp_proceso_total (select * from tmp_proceso2); -- inserta todo lo del movimiento202 valores negativos del 30junio para abajo
insert into tmp_proceso_total (select * from tmp_proceso3); -- inserta todo lo del movimiento202 valores positivos del 30junio para abajo
insert into tmp_proceso_total (select * from tmp_proceso4); -- inserta todo lo del movimiento202 valores negativos del 30junio para arriba
insert into tmp_proceso_total (select * from tmp_proceso5); -- inserta todo lo del movimiento202 valores positivos del 30junio para arriba$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'alter table tmp_proceso_total add column ncuenta varchar(100); -- nomb…', $q$alter table tmp_proceso_total add column ncuenta varchar(100); -- nombre de la cuenta de la tabla cuntas
alter table tmp_proceso_total add column cuenta_texto varchar(20); -- codigo_cuenta de la tabla cuntas
update tmp_proceso_total set ncuenta=cuentas.nombre,cuenta_texto=cuentas.codigo_cuenta_texto
       from cuentas
       where tmp_proceso_total.codigo_cuenta=cuentas.codigo_cuenta;
alter table tmp_proceso_total add column ntercero varchar(250);
update tmp_proceso_total set ntercero=nitsx_sedes.nombre  -- nombre del tercero de acuerdo a la tabla nitsx_sedes
       from nitsx_sedes
       where tmp_proceso_total.nit=nitsx_sedes.nit and tmp_proceso_total.sede=nitsx_sedes.sede;
delete from tmp_proceso_total where xvalor=0; -- ME ELIMINA TODOS LOS VALORES QUE EN LA SUMATORIA DIERON 0$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', '/*', $q$/*
SELECT DISTINCT tmp_daniel.CODIGO_CUENTA FROM(
select codigo_cuenta,ncuenta, nit, /*sede,*/ ntercero, sum(xvalor) as xvalor from tmp_proceso_total WHERE nit='901241861'
	   group by codigo_cuenta,ncuenta, nit, /*sede,*/ ntercero, cuenta_texto$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'order by cuenta_texto', $q$	  order by cuenta_texto
	)tmp_daniel where tmp_daniel.XVALOR='0' -- 33 cuentas
*/$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'SELECT DISTINCT tmp_daniel.CODIGO_CUENTA FROM( select codigo_cuenta,nc…', $q$SELECT DISTINCT tmp_daniel.CODIGO_CUENTA FROM(
select codigo_cuenta,ncuenta, nit, sede, ntercero, sum(xvalor) as xvalor from tmp_proceso_total WHERE nit='901241861'
	   group by codigo_cuenta,ncuenta, nit, sede, ntercero, cuenta_texto$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'order by cuenta_texto', $q$	  order by cuenta_texto
	)tmp_daniel where tmp_daniel.XVALOR='0'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '- + ', $q$- + $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', '/*', $q$/*
select * from nitsx_sedes where nit='901241861'	$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select distinct sede from movimiento2022 where nit=''901241861'' -- SEDE…', $q$select distinct sede from movimiento2022 where nit='901241861' -- SEDE 1, SEDE 2
*/$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022…', $q$select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022
where valor<0 and fecha_documento<='2022-06-30' and nit='901241861' and codigo_cuenta='13050510'
group by codigo_cuenta,nit,sede;
13050500	"901241861"	1	-121935930.00
13050500	"901241861"	2	-20268.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022…', $q$select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022
where valor>0 and fecha_documento<='2022-06-30' and nit='901241861'  and codigo_cuenta='13050510'
group by codigo_cuenta,nit,sede;
13050500	"901241861"	1	121950286.00
13050500	"901241861"	2	111623.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022…', $q$select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022
where valor<0 and fecha_documento>'2022-06-30' and nit='901241861'  and codigo_cuenta='13050510'
group by codigo_cuenta,nit,sede;
13050500	"901241861"	1	-186932950.00
13050500	"901241861"	2	-91355.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '13050510	"901241861"	1	-53000000.00', $q$13050510	"901241861"	1	-53000000.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022…', $q$select codigo_cuenta,nit,sede,sum(valor) as xvalor from movimiento2022
where valor>0 and fecha_documento>'2022-06-30' and nit='901241861'  and codigo_cuenta='13050510'
group by codigo_cuenta,nit,sede;
13050500	"901241861"	1	186918594.00
241000 diferencia$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'sumatoria de los negativos sede 1 308.868.880', $q$sumatoria de los negativos sede 1 308.868.880
sumatoria de los positivos sede 1 308.868.880$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,nit,sede,sum(saldo) as xvalor from resumen2021 wh…', $q$select codigo_cuenta,nit,sede,sum(saldo) as xvalor from resumen2021
where nit='901241861'
group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '**********************************************************************…', $q$*******************************************************************************
drop table if exists tmp_proceso1;
drop table if exists tmp_proceso2;
drop table if exists tmp_proceso3;
drop table if exists tmp_proceso4;
drop table if exists tmp_proceso5;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'drop table if exists tmp_proceso_total;', $q$drop table if exists tmp_proceso_total;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- resumen2021 select codigo_cuenta,nit,sede,sum(saldo) as xvalor     …', $q$-- resumen2021
select codigo_cuenta,nit,sede,sum(saldo) as xvalor 
       into table tmp_proceso1
       from resumen2021 
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- valores negativos alter table tmp_proceso1 add column concepto varc…', $q$-- valores negativos
alter table tmp_proceso1 add column concepto varchar(10);
update tmp_proceso1 set concepto='saldo_ini';       
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso2
       from movimiento2022 
       where valor<0 and fecha_documento<='2022-06-30'
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'alter table tmp_proceso2 add column concepto varchar(10); update tmp_p…', $q$alter table tmp_proceso2 add column concepto varchar(10);
update tmp_proceso2 set concepto='ene_nov_c';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- valores positivos select codigo_cuenta,nit,sede,sum(valor) as xvalo…', $q$-- valores positivos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso3
       from movimiento2022 
       where valor>0 and fecha_documento<='2022-06-30'
       group by codigo_cuenta,nit,sede;
alter table tmp_proceso3 add column concepto varchar(10);
update tmp_proceso3 set concepto='ene_nov_d';    $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '--diciembre valores negativos select codigo_cuenta,nit,sede,sum(valor)…', $q$--diciembre valores negativos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso4
       from movimiento2022 
       where valor<0 and fecha_documento>='2022-01-01'
       group by codigo_cuenta,nit,sede;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'alter table tmp_proceso4 add column concepto varchar(10); update tmp_p…', $q$alter table tmp_proceso4 add column concepto varchar(10);
update tmp_proceso4 set concepto='dic_c';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '-- Diciembre valores positivos select codigo_cuenta,nit,sede,sum(valor…', $q$-- Diciembre valores positivos
select codigo_cuenta,nit,sede,sum(valor) as xvalor 
       into table tmp_proceso5
       from movimiento2022 
       where valor>0 and fecha_documento>='2022-01-01'
       group by codigo_cuenta,nit,sede;
alter table tmp_proceso5 add column concepto varchar(10);
update tmp_proceso5 set concepto='dic_d';       $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * into tmp_proceso_total from tmp_proceso1; -- inserta todo lo …', $q$select * into tmp_proceso_total from tmp_proceso1; -- inserta todo lo del resumen2021
insert into tmp_proceso_total (select * from tmp_proceso2); -- inserta todo lo del movimiento202 valores negativos del 30junio para abajo
insert into tmp_proceso_total (select * from tmp_proceso3); -- inserta todo lo del movimiento202 valores positivos del 30junio para abajo
insert into tmp_proceso_total (select * from tmp_proceso4); -- inserta todo lo del movimiento202 valores negativos del 30junio para arriba
insert into tmp_proceso_total (select * from tmp_proceso5); -- inserta todo lo del movimiento202 valores positivos del 30junio para arriba$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'alter table tmp_proceso_total add column ncuenta varchar(100); -- nomb…', $q$alter table tmp_proceso_total add column ncuenta varchar(100); -- nombre de la cuenta de la tabla cuntas
alter table tmp_proceso_total add column cuenta_texto varchar(20); -- codigo_cuenta de la tabla cuntas
update tmp_proceso_total set ncuenta=cuentas.nombre,cuenta_texto=cuentas.codigo_cuenta_texto
       from cuentas
       where tmp_proceso_total.codigo_cuenta=cuentas.codigo_cuenta;
alter table tmp_proceso_total add column ntercero varchar(250);
update tmp_proceso_total set ntercero=nitsx_sedes.nombre  -- nombre del tercero de acuerdo a la tabla nitsx_sedes
       from nitsx_sedes
       where tmp_proceso_total.nit=nitsx_sedes.nit and tmp_proceso_total.sede=nitsx_sedes.sede;
delete from tmp_proceso_total where xvalor=0; -- ME ELIMINA TODOS LOS VALORES QUE EN LA SUMATORIA DIERON 0$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'select codigo_cuenta,ncuenta, nit, sede, ntercero, sum(xvalor) as xval…', $q$select codigo_cuenta,ncuenta, nit, sede, ntercero, sum(xvalor) as xvalor from tmp_proceso_total WHERE nit='901241861'
group by codigo_cuenta,ncuenta, nit, sede, ntercero, cuenta_texto
order by cuenta_texto$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'INSERTAR DATOS EN CARTERA PROVEEDORES', $q$INSERTAR DATOS EN CARTERA PROVEEDORES$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into cartera_proveedores 	(codigo_sucursal,numero,fecha,vence,v…', $q$insert into cartera_proveedores
	(codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
	(select codigo_centro_costo, numero_documento, fecha_documento, fecha_documento, valor       *(-1), valor *(-1),
	 concat('conta.',numero_documento), nit, sede, 'ereb', codigo_cuenta from movimiento2023
	 where codigo_cuenta='23354500' and numero_documento in('DSEF649'))$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update cartera_proveedores set codigo_sucursal=''0101'' where numero in(…', $q$update cartera_proveedores set codigo_sucursal='0101'
where numero in('DSEF649') and codigo_sucursal='0102'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select sum(total_iva+total_sin_iva) from itemfc where ID in(998103,998…', $q$select sum(total_iva+total_sin_iva) from itemfc where ID in(998103,998104,998105,998106,998107,998108,998109,998110,
998111,998112,998113,998114,998115,998116,998117,998118,998119,998120,998121,998122,998123,998124,998125,998126,998127,998128,
998129,998130,998131,998132,998133,998134,998135,998136) not in
order by ID$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'VER INTERFACES SIN SUBIR', $q$VER INTERFACES SIN SUBIR 
select  distinct 'ventas',  fecha from facturac  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'dvventas',  fecha from dfacturac  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'rc',  fecha from pagos  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'pagos',  fecha from pagos_compras  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'compras',  fecha from facturac_compras  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'devcompras',  fecha from dfacturac_compras  where  fecha>='2022-05-01' and  contable='.'
union all
select  distinct 'notasp',  fecha from notasp  where  fecha>='2022-05-01' and  contable='.' 
union all
select  distinct 'notas',  fecha from notas  where  fecha>='2022-05-01' and  contable='.'
order by  fecha$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'COMO CALCULAR LOS DIAS', $q$COMO CALCULAR LOS DIAS
(cast(now() as date)-cartera_clientes.vence) as dias,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'cooperativa santa rosa ', $q$cooperativa santa rosa $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'solicito por favor dejar en ceros contablemente la factura de compra d…', $q$solicito por favor dejar en ceros contablemente la factura de compra de cafe:$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'factura n° 72066 a nombre de MARIA RUBIELA AMAYA DE ALVARAN', $q$factura n° 72066 a nombre de MARIA RUBIELA AMAYA DE ALVARAN$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select kilos_reales,valor_total,valor_neto,* from cafe_ordenes where n…', $q$select kilos_reales,valor_total,valor_neto,* from cafe_ordenes where numero in('72066')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update cafe_ordenes set kilos_reales=''0'',valor_total=''0'',valor_neto=''0…', $q$update cafe_ordenes set kilos_reales='0',valor_total='0',valor_neto='0'
where numero in('72066')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '45.90	499392	493232.00', $q$45.90	499392	493232.00$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'unoa galeria', $q$ unoa galeria 
Buen día, requerimos de su colaboración eliminando el documento numero 74 correspondiente a nomina provisión 
( tipo de doc 0502) del 31 de marzo del presente año$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select * from movimiento2023 where codigo_documento in(''0502'') and fec…', $q$select * from movimiento2023 where codigo_documento in('0502') and fecha_documento='2023-03-31' and numero_documento in('74')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CASE WHEN', $q$CASE WHEN
select numero,nproveedor,nit,
 case when nproveedor = 'SUMATEC' then 'proveedor de tornilleria'
      when nproveedor = 'JAIVANA' then 'proveedor de software'
	  when nproveedor = 'ARMETALES S.A' THEN 'proveedor de hierro'
	  else 'otro tipo de clientes'
end as detalle
from facturac_compras where fecha between '2023-01-01' and '2023-03-10'
group by numero,nproveedor,nit
IMPUESTOS SALUDABLES UNOA — ACTUALIZACIÓN$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'insert into articulos_impuestos(codigo_articulo,id_impuestos,tarifa,va…', $q$insert into articulos_impuestos(codigo_articulo,id_impuestos,tarifa,valor,por_porcentaje,en_compras,en_ventas,afecta_costo) 
select articulo.codigo,impuestos_la29.id_impuestos,impuestos_la29.tarifa,
impuestos_la29.valor, impuestos_la29.por_porcentaje,impuestos_la29.en_compras,impuestos_la29.en_ventas,
impuestos_la29.afecta_costo
from articulo,impuestos_la29 where articulo.barras=impuestos_la29.barras$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from articulos_impuestos limit 1', $q$select * from articulos_impuestos limit 1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'permisos', $q$permisos$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'insert into pantallas_autorizadas(codigou,codigop)values(''0003'',''IMP_A…', $q$insert into pantallas_autorizadas(codigou,codigop)values('0003','IMP_ART');
insert into pantallas_autorizadas(codigou,codigop)values('0003','CONS_IMPART');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'codigo', $q$ codigo	
IBUA VALOR
ICUI POCENTAJE
INPP $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'insert into configuracion_xml(sucursal,categoria,propiedad,valor) valu…', $q$insert into configuracion_xml(sucursal,categoria,propiedad,valor) values
('.','contabilidad','xml_en_servidor','S')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'ECONSTRUIR SALDOS', $q$ECONSTRUIR SALDOS 
1.	Reconstuir kardex cantidades. Ejemplo (Tengo un error en jaivana (kardex) de cantidades. Quien me podría ayudar con esto por favor para realizar el cambio y que quede real?, el cuadro resaltado debería estar en 225 según la sumatoria.),
En jaivana – inventarios – costeo – costeo en línea – reconstruir costos. Aquí se da el código – se da la fecha y la bodega, se pone en el cuadro de la izquierda el código con | , y después se da pr, apenas el termine se busca en la tabla articulo y la bodega a la q pertenece.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'DIFERENCIAS EN UNOA', $q$DIFERENCIAS EN UNOA 
codigo_documento	numero_documento	xvalor	
0405			05			-112400.0
0405			22			-17350.0
0405			29			-10600.0
-- descuadres de caja, diferencias contables, diferencias en contabilidad - Ticket HD-38038 -> CAJA 8 SUPIA CON DIFERENCIAS - Solicito revisión de CAJA 8 SUPIA , esta descuadrada se verifica y  presenta diferencia de 12.500 es necesario que este corregida para la presentación de impuestos.
	select (select sum (cantidad*precio_sin_iva) as valor_sin_iva_item from caja5itemf where caja5itemf.fecha='2023-11-05'),
	(select sum (basee+baseg) as vlor_sin_iva_factura from caja5factura where caja5factura.fecha='2023-11-05'),
	((select sum (cantidad*precio_sin_iva) from caja5itemf
	where fecha='2023-11-05')-(select sum (basee+baseg) from caja5factura where fecha='2023-11-05')) as diferencia;
/* Query por inner join y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci
	inner join caja5factura cf
	on cf.numero = ci.numero
	where cf.fecha='2023-11-05' and ci.fecha='2023-11-05'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	--group by ci.numero, cf.numero
	order by ci.numero, cf.numero
/* Otra forma. Query por where y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
	y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci, caja5factura cf
	where cf.numero = ci.numero and cf.fecha='2023-11-05' and ci.fecha='2023-11-05'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	order by ci.numero, cf.numero;
numero		valor_items_sin_iva	numero		valor_factura_sin_iva	diferencia
659914;		2300.000000;		659914;		0.00;			2300.000000
659953;		50217.930000;		659953;		0.00;			50217.930000
659982;		41806.730000;		659982;		0.00;			41806.730000
659986;		4831.930000;		659986;		0.00;			4831.930000
select * from caja5factura where numero='659914'
select * from caja5factura where numero='659953'
select * from caja5factura where numero='659982'
select * from caja5factura where numero='659986'
-- delete from caja5factura where numero in('659914','659953','659982','659986') and valor='0';
select * from caja5factura where numero in('659914','659953','659982','659986')
select * from configuracion_xml where propiedad ilike'%servidor%'
update configuracion_xml set valor='N' where propiedad ilike'%xml_en_servidor%'
-- 2023-11-22
-- descuadres de caja, diferencias contables, diferencias en contabilidad - Ticket HD-38038 -> CAJA 8 SUPIA CON DIFERENCIAS - Solicito revisión de CAJA 8 SUPIA , esta descuadrada se verifica y  presenta diferencia de 12.500 es necesario que este corregida para la presentación de impuestos.
	select (select sum (cantidad*precio_sin_iva) as valor_sin_iva_item from caja5itemf where caja5itemf.fecha='2023-11-22'),
	(select sum (basee+baseg) as vlor_sin_iva_factura from caja5factura where caja5factura.fecha='2023-11-22'),
	((select sum (cantidad*precio_sin_iva) from caja5itemf
	where fecha='2023-11-22')-(select sum (basee+baseg) from caja5factura where fecha='2023-11-22')) as diferencia;
/* Query por inner join y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci
	inner join caja5factura cf
	on cf.numero = ci.numero
	where cf.fecha='2023-11-22' and ci.fecha='2023-11-22'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	--group by ci.numero, cf.numero
	order by ci.numero, cf.numero
/* Otra forma. Query por where y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
	y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci, caja5factura cf
	where cf.numero = ci.numero and cf.fecha='2023-11-22' and ci.fecha='2023-11-22'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	order by ci.numero, cf.numero;
numero		valor_items_sin_iva	numero		valor_factura_sin_iva	diferencia
663712;		17350.000000;		663712;		0.00;			17350.000000
select * from caja5factura where numero='663712'
delete from caja5factura where numero in('663712') and valor='0';
select * from caja5factura where numero in('663712')
-- 2023-11-29
-- descuadres de caja, diferencias contables, diferencias en contabilidad - Ticket HD-38038 -> CAJA 8 SUPIA CON DIFERENCIAS - Solicito revisión de CAJA 8 SUPIA , esta descuadrada se verifica y  presenta diferencia de 12.500 es necesario que este corregida para la presentación de impuestos.
	select (select sum (cantidad*precio_sin_iva) as valor_sin_iva_item from caja5itemf where caja5itemf.fecha='2023-11-29'),
	(select sum (basee+baseg) as vlor_sin_iva_factura from caja5factura where caja5factura.fecha='2023-11-29'),
	((select sum (cantidad*precio_sin_iva) from caja5itemf
	where fecha='2023-11-29')-(select sum (basee+baseg) from caja5factura where fecha='2023-11-29')) as diferencia;
/* Query por inner join y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci
	inner join caja5factura cf
	on cf.numero = ci.numero
	where cf.fecha='2023-11-29' and ci.fecha='2023-11-29'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	--group by ci.numero, cf.numero
	order by ci.numero, cf.numero
/* Otra forma. Query por where y having para mostrar la factura o las facturas que tiene diferencia entre el valor de cada una de las facturas de venta y el valor total de cada uno de los items de venta
	y muestra la diferencia entre esos dos para mirar el descuadre*/
	select ci.numero, sum (ci.cantidad*ci.precio_sin_iva) as valor_sin_iva_item, cf.numero, (cf.basee+cf.baseg) as vlor_sin_iva_factura, (sum (ci.cantidad*ci.precio_sin_iva)-(cf.basee+cf.baseg)) as diferencia
	from caja5itemf ci, caja5factura cf
	where cf.numero = ci.numero and cf.fecha='2023-11-29' and ci.fecha='2023-11-29'
	group by ci.numero, cf.numero, cf.basee, cf.baseg
	having (cf.basee+cf.baseg) <> (sum(ci.cantidad*ci.precio_sin_iva))
	order by ci.numero, cf.numero;
numero		valor_items_sin_iva	numero		valor_factura_sin_iva	diferencia
665416;		10095.240000;		665416;		0.00;			10095.240000
select * from caja5factura where numero='665416'
delete from caja5factura where numero in('665416') and valor='0';
select * from caja5factura where numero in('665416')
codigo_documento	numero_documento	xvalor	
0201			12067			39719.48
0800			89745			25090408
SELECT * FROM DOCUMENTOS WHERE CODIGO_DOCUMENTO IN('0201','0800')
"0201";"DEV. COMPRAS"
"0800";"OTROS PAGOS"
SELECT * FROM MOVIMIENTO2023 WHERE NUMERO_DOCUMENTO='89745' AND CODIGO_DOCUMENTO='0800'
SELECT * FROM MOVIMIENTO2023 WHERE NUMERO_DOCUMENTO='12067' AND CODIGO_DOCUMENTO='0201'
select * from dfacturac_compras where numero='12067' and fecha='2023-11-24'
select * from ditemfc_compras where numero='12067' and fecha='2023-11-24'
fecha		nit		valor		numero	nproveedor
"2023-11-24";	"860003831" 	39719.48	"12067"	"PRODUCTOS RAMO S.A"$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '-- delete from dfacturac_compras where numero=''12067'' and fecha=''2023-…', $q$-- delete from dfacturac_compras where numero='12067' and fecha='2023-11-24'
-- delete from MOVIMIENTO2023 WHERE NUMERO_DOCUMENTO='12067' AND CODIGO_DOCUMENTO='0201'
select * from cuentas where codigo_cuenta='53059501'
"53059501";"AJUSTE AL PESO"
Enviar un mensaje a Jhon Daniel Gonzalez Lopez$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'MODIFICAR CAMPOS EN CONTABILIDAD', $q$MODIFICAR CAMPOS EN CONTABILIDAD
campos_modificables_usuario$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from campos_modificables_usuario   where codigo_usuario 09:33…', $q$select * from campos_modificables_usuario   where codigo_usuario
09:33
insert into campos_modificables_usuario (codigo_usuario,nombre_campo) values
('AUXCONTA','valor'),
('AUXCONTA','tarifa'),
('AUXCONTA','numero_documento'),
('AUXCONTA','nit_responsable'),
('AUXCONTA','nit'),
('AUXCONTA','fecha_documento'),
('AUXCONTA','codigo_sucursal'),
('AUXCONTA','codigo_documento'),
('AUXCONTA','codigo_cuenta'),
('AUXCONTA','codigo_centro_costo'),
('AUXCONTA','base'),
('AUXCONTA','codigo_departamento_interno');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insertar un pago  insert into pagos 	(select ''8436'', c.fecha, (c.valor…', $q$insertar un pago 
insert into pagos
	(select '8436', c.fecha, (c.valor/-1)::numeric(15,2), '999','13050502',
	 c.fecha, n.nombre, 'Anticipo ' || c.numero , '0','0','999', '.', c.nit, c.sede,'0022','.', '.' ,
	 'wras', c.codigo_sucursal,c.fecha,now()
	from cartera_clientes c , nitsx_sedes n
	where c.numero='A-8436' and  c.fecha>='2025-05-21' and c.nit=n.nit and c.sede=n.sede and c.id=4319496)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select pedido,* from facturac where cast(valor as varchar) ilike''%1390…', $q$select pedido,* from facturac where cast(valor as varchar) ilike'%13902%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_d…', $q$insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_documento, codigo_cuenta, numero_documento,
codigo_centro_costo, nit, sede, nit_responsable, sede_responsable,codigo_departamento_interno, detalle, documento_fuente, tipo_fuente,
documento_banco, llave, base, tarifa, valor, codigo_origen,item, codigo_usuario, fecha_sistema)
(select p.codigo_sucursal, p.fecha, '0800','61359506', p.numero, p.codigo_sucursal, p.nit,
p.sede, p.nit, p.sede, '9999',concat('Pago ', p.numero,':', p.beneficiario),
'.', 'C', '0','0', '0', '0', p.valor_anexos, 'PAGOS', '0', 'JERR', p.fecha_sistema
from pagos_compras p where p.fecha='2024-11-12' and  p.nit in('816006449','890916575',
'891100445','890304130','805026940','890315540') and p.numero in ('119255','119254','119253','119256','119257','119252'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pagos where numero in (''1586'',''1597'',''1653'')', $q$select * from pagos where numero in ('1586','1597','1653')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pagosi where numero in (''1586'',''1597'',''1653'')', $q$select * from pagosi where numero in ('1586','1597','1653')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select documento_fuente,valor,* from movimiento2023 where numero_docum…', $q$select documento_fuente,valor,* from movimiento2023 where numero_documento in ('1586') 
and nit in ('900016811')order by documento_fuente$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select documento_fuente,valor,* from movimiento2023 where numero_docum…', $q$select documento_fuente,valor,* from movimiento2023 where numero_documento in ('1597') 
and nit in ('79691687')order by documento_fuente$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select documento_fuente,valor,* from movimiento2023 where numero_docum…', $q$select documento_fuente,valor,* from movimiento2023 where numero_documento in ('1653') 
 and nit in('79895633') order by documento_fuente$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac where numero in(''FE-4228'')', $q$select * from facturac where numero in('FE-4228')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'select * from cuentas where codigo_cuenta in (''11100505'',''13551510'',''1…', $q$select * from cuentas where codigo_cuenta in ('11100505','13551510','13050501')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from cartera_clientes where numero in(''FE-4228'')--79895633', $q$select * from cartera_clientes where numero in('FE-4228')--79895633$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from pagos where nit in(''79895633'')', $q$select * from pagos where nit in('79895633')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into pagos (select cast(Substring(c.numero,3) as numeric(6)), c…', $q$insert into pagos
(select cast(Substring(c.numero,3) as numeric(6)), c.fecha,  c.valor/-1, '999','13050502',
c.fecha, n.nombre, 'Anticipo ' || c.numero , '0','0','999', '.', c.nit, c.sede,'0003','.', '.' ,
'wras', c.codigo_sucursal,c.fecha,now()
from cartera_clientes c , nitsx_sedes n
where cast(Substring(c.numero,3) as numeric(6) ) not in (select numero from pagos)
and  c.fecha>='2023-06-02'  and c.numero like 'FE-4228' and c.nit=n.nit and c.sede=n.sede)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'INSERTAR PANTALLAS EN FACTURACION ELECTONICA  select ''INSERT INTO FRAM…', $q$INSERTAR PANTALLAS EN FACTURACION ELECTONICA 
select 'INSERT INTO FRAMESTEXTOS VALUES (', *, ');'from FRAMESTEXTOS WHERE CODIGO='DFACTELECT' ORDER BY ORDEN
select * from framestextos where codigo='DFACTELECT'
-- delete framestextos where codigo='DFACTELECT'
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',1,'LB',1,'.','Recibe factura electronica:',10,350,40,30,'.','.','.','.',0,'.','.','.','.',False,0,'.','.',0,'.','.',0,'.','2','postgres',248,248,248,'Ms Sans Serif',2,20,0.0,0.0,'n1','.',175,255,45,'.','.','N','.','.');
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',2,'TX',1,'.','Recibe factura electronica',355,100,40,30,'recibe_factura_electronica','recibe_factura_electronica','nitsx_sedes','recibe_factura_electronica',200,'recibe_factura_electronica','recibe_factura_electronica','T','T',True,2000,'recibe_factura_electronica,email_factura_electronica','0',0,'%','.',4,'S','2','postgres',239,225,255,'Ms Sans Serif',1,16,-1.0,-1.0,'recibe_factura_electronica','.',255,50,31,'.','recibe_factura_electronica','S','.','300');
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',3,'LB',5,'.','S,N',460,500,40,30,'.','.','.','.',0,'.','.','.','.',False,0,'.','.',0,'.','.',0,'.','2','postgres',248,248,248,'Ms Sans Serif',2,20,0.0,0.0,'n8','.',175,255,45,'.','.','N','.','.');
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',4,'LB',2,'.','Email para recibir factura electronica:',10,350,75,30,'.','.','.','.',0,'.','.','.','.',False,0,'.','.',0,'.','.',0,'.','2','postgres',248,248,248,'Ms Sans Serif',2,20,0.0,0.0,'n3','.',175,255,45,'.','.','N','.','.');
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',5,'TX',2,'.','Email para recibir factura electronica:',355,500,75,30,'email_factura_electronica','email_factura_electronica','nitsx_sedes','email_factura_electronica',200,'email_factura_electronica','email_factura_electronica','T','T',True,2000,'.','0',0,'%','.',250,'S','2','postgres',239,225,255,'Ms Sans Serif',1,16,-1.0,-1.0,'email_factura_electronica','.',255,50,31,'.','email_factura_electronica','S','.','.');
INSERT INTO FRAMESTEXTOS VALUES ('DFACTELECT',6,'TB',1,'Grabar','Grabar datos de esta pestaña',360,230,110,30,'.','.','.','.',0,'.','.','N','N',False,0,'.','.',0,'.','Actualizar',4,'.','0','postgres',150,193,152,'Ms Sans Serif',1,16,-1.0,-1.0,'grabar','.',255,50,31,'.','.','N','.','.');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTAR CONTRA PARTE DE UNA DEVOLUCION ', $q$INSERTAR CONTRA PARTE DE UNA DEVOLUCION $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2023(					codigo_sucursal,fecha_documento,codigo…', $q$insert into movimiento2023(					codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,					nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,					documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)(select codigo_sucursal,fecha_documento,codigo_documento,'41750302',numero_documento,codigo_centro_costo,					nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,					documento_banco,llave,base,tarifa,valor *(-1),codigo_origen,item,codigo_usuario,fecha_sistema
					from MOVIMIENTO2023
					where numero_DOCUMENTO in('133')
					AND CODIGO_DOCUMENTO='DV');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'items_impuestos_compras', $q$items_impuestos_compras 
 lanzarScreen.sh $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'servidor centos 12345', $q$servidor centos 12345
ls
cd / home/ 
cd servidor 
ls = listar$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'cd = navegar ejemplo: cd /home/servicios/', $q$cd = navegar ejemplo: cd /home/servicios/
screen -ls = lista servicios activos
QUERY INSERTAR UN NUMERO DELANTE DEL OTRO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'UPDATE ciudades1 SET codigo_dian = LPAD(codigo_dian::text, 5, ''0'') WHE…', $q$UPDATE ciudades1
SET codigo_dian = LPAD(codigo_dian::text, 5, '0')
WHERE LENGTH(codigo_dian::text) = 4 OR LENGTH(codigo_dian::text) = 1;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'AGREGAR USUARIOS A CONSULTAS', $q$AGREGAR USUARIOS A CONSULTAS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'update consultas set usuarios_autorizados=concat(usuarios_autorizados,…', $q$update consultas set usuarios_autorizados=concat(usuarios_autorizados, ',rmym')
where titulo in('ORDENES DE COMPRA PENDIENTES - todos', 'Remisiones _pendientes',
'Remisiones - Consulta de productos', 'SEGUIMIENTO ITEMS TRASLADADOS DMN ', 'Pedidos Pendientes - todos', 'Fecha de pago facturas de credito')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'and id in(14,18,74,13,9,75)', $q$and id in(14,18,74,13,9,75)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'select * from consultas where codigo in (''14'',''140'',''142'', ''147'',''148''…', $q$select * from consultas where codigo in ('14','140','142',
'147','148','153','174','197','199','2') and usuarios_autorizados ilike'%ruya%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'update consultas set usuarios_autorizados = regexp_replace(usuarios_au…', $q$update consultas
set usuarios_autorizados = regexp_replace(usuarios_autorizados, '(^|,)ruya(,|$)', ',', 'g')
where usuarios_autorizados ilike '%ruya%' and codigo in ('14','140','142','147','148','153','174','197','199','2')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'inserta en cartera_proveedores de contabbilidad', $q$inserta en cartera_proveedores de contabbilidad$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'update movimiento2024 set documento_fuente=''FECREDI1031193'' where codi…', $q$update movimiento2024 set documento_fuente='FECREDI1031193' where codigo_cuenta='22050500'
 and numero_documento='967' and codigo_documento='N4' and documento_fuente='FE CREDI 1031193';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into cartera_proveedores (codigo_sucursal,numero,fecha,vence,va…', $q$insert into cartera_proveedores (codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
 (select codigo_centro_costo, documento_fuente, fecha_documento, fecha_documento, valor, valor,
 concat('conta.',numero_documento), nit, sede, 'wras', codigo_cuenta from movimiento2024
 where codigo_cuenta='22050500' and numero_documento='967'
 and codigo_documento='N4' and documento_fuente='FECREDI1031193');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into cartera_proveedores (codigo_sucursal, numero, fecha, vence…', $q$insert into cartera_proveedores (codigo_sucursal, numero, fecha, vence, valor, saldo, texto, nit, sede, usuario, contable)
select  m.codigo_centro_costo,  m.documento_fuente,  m.fecha_documento,  m.fecha_documento, 
 m.valor, m.valor,concat('conta.', m.numero_documento), m.nit, m.sede, 'wras', m.codigo_cuenta 
from movimiento2024 mwhere m.numero_documento IN ('HE4P1822', 'HE4P1915', 'HE4P1957', 'HE4P2046')
and m.codigo_cuenta = '23359505' AND m.codigo_documento = 'FE' 
and m.codigo_origen = 'CONTA' AND m.nit IN ('900156839')
and m.id IN (5191500, 5176143, 5176213, 5183428);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'AGROCENTRO', $q$AGROCENTRO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '-- Se busca la nota crédito (Devolución en venta) en la tabla document…', $q$-- Se busca la nota crédito (Devolución en venta) en la tabla documentos_pendientes
	select * from documentos_pendientes where numero_documento='50364'
	-- Se cambia de estado "p" a estado "a" el campo estado_enviada de la tabla documentos_pendientes, y se debe esperar a que el servicio procese dicho documento y lo cambie a estado "s"
	update documentos_pendientes set estado_enviada='a' where numero_documento='50364$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTAR VARIOS DATOS EN CARTERA_CLIENTES DE MOVIMIENTOS', $q$INSERTAR VARIOS DATOS EN CARTERA_CLIENTES DE MOVIMIENTOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor…', $q$insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
 (select m.codigo_centro_costo, concat('DV-',m.documento_fuente), m.fecha_documento, m.fecha_documento, m.valor, m.valor,
 concat('DV ',m.numero_documento, 'de Fra ', df.pedido), m.nit, m.sede, 'wras', m.codigo_cuenta from movimiento2024 m, dfacturac df
 where (df.numero, df.nit, df.fecha)=(m.numero_documento, m.nit, m.fecha_documento) and numero_documento in('6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30')
and codigo_cuenta='13050500' and codigo_documento='DV' and codigo_origen='DEV.FAC'
 and m.nit in	('860002175','860002175','830123177','901446500','900619863','901120547',
'901120547','800215496','900455489','830042112','900647684','900007044','899999034','830113727','890201881','800194600',
'860013570','800130305','830007691','860069497','860069497','901446500','901299581','901073394','900232695','830043084'));
14:39
ELIMINAR ORDENES DE PRODUCCION
select * from facturac_ordenesp where numero = '13105'
select * from itemfc_ordenesp where numero = '13105'
 update facturac_ordenesp set estado='E' where numero = '13105'
update itemfc_ordenesp set estado='E' where numero = '13105'
 Solución del ticket:
        Se resuelve el caso cambiando el estado de la orden de producción n° 13105 se pone en estado "E" (Eliminando). 
COMPARAR PERMISOS:
Solicito por favor la colaboración habilitando el módulo de contabilidad a la usuario “prg”
Por favor clonarle los permisos del usuario “ypvp” en el módulo contable.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'SELECT codigop FROM pantallas_autorizadas WHERE codigou = ''ypvp'' EXCEP…', $q$SELECT codigop
FROM pantallas_autorizadas
WHERE codigou = 'ypvp'
EXCEPT
SELECT codigop
FROM pantallas_autorizadas
WHERE codigou = 'prg';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ACTUALIZAR DATOS', $q$ACTUALIZAR DATOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update sucursales_documentos set numero=numero + 1 where codigo_docume…', $q$update sucursales_documentos set numero=numero + 1 where codigo_documento='RC' and codigo_sucursal='0000';
select max(numero) from sucursales_documentos where codigo_documento='RC' and codigo_sucursal='0000'; -- el consecutivo máxnimo despues de actualizarlo es 924
update pagos set numero='924', detalle='Pago 924 Facturas' where numero='3' and nit='890800788';
update pagosi set numero='924' where numero='3' and nit='890800788';
update cartera_clientes
 set texto = CONCAT(substring (cartera_clientes.texto, 1,(POSITION('Pago.' IN cartera_clientes.texto)+4)),
 PAGOSI.numero)
 from pagosi where pagosi.numero='924' and cartera_clientes.numero=pagosi.documento and cartera_clientes.nit=pagosi.nit
 and pagosi.fecha='2024-03-13' and pagosi.nit='890800788';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update tablas_usuario set query=concat(substring (query, 1,(position(''…', $q$update tablas_usuario set query=concat(substring (query, 1,(position('))' in query))), ',oid serial)')
where codigo in('conta2','conta1')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INFORMES VENTAS MES A MES POR CODIGO ', $q$INFORMES VENTAS MES A MES POR CODIGO $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select ''ventas'' tipo, i.fecha,i.numero,i.codigo,i.cantidad,i.subtotal1…', $q$select 'ventas' tipo, i.fecha,i.numero,i.codigo,i.cantidad,i.subtotal1 as valor_unitario,i.total_iva as iva,i.total_sin_iva as baseg, sum(i.total_iva+i.total_sin_iva)
as valor_total,i.tarifa_iva
from itemfc i
where i.fecha between 'K1' and 'K2' and i.cantidad<>0
group by i.fecha,i.numero,i.codigo,i.cantidad,i.subtotal1,i.total_iva,i.total_sin_iva,i.tarifa_iva
union all
select 'devolucines_ventas' tipo, i.fecha,i.numero,i.codigo,i.cantidad,i.subtotal1 as valor_unitario,i.total_iva as iva,i.total_sin_iva as baseg, sum(i.total_iva+i.total_sin_iva)
as valor_total,i.tarifa_iva
from ditemfc i
where i.fecha between  'K1' and 'K2' and   i.cantidad<>0
group by i.fecha,i.numero,i.codigo,i.cantidad,i.subtotal1,i.total_iva,i.total_sin_iva,i.tarifa_iva$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'RECIBOS DE CAJA Y UNIR UN DCUMENTO EN UNA SOLA COLUMNA', $q$RECIBOS DE CAJA Y UNIR UN DCUMENTO EN UNA SOLA COLUMNA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT P.fecha,P.numero AS recibo_de_caja,P.nit,P.sede,P.beneficiario …', $q$SELECT P.fecha,P.numero AS recibo_de_caja,P.nit,P.sede,P.beneficiario AS cliente,P.valor_anexos,P.valor AS pagado,
P.valor_facturas AS valor_facturas,STRING_AGG(i.documento, ', ') AS facturas
FROM pagos P INNER JOIN pagosi i ON p.nit = i.nit
WHERE p.fecha BETWEEN 'K1' AND 'K2'  
AND i.fecha = p.fecha AND i.numero = p.numero
GROUP BY P.fecha,P.numero,P.nit,P.sede,P.beneficiario,P.valor_anexos, P.valor,P.valor_facturas
ORDER BY P.fecha ASC;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ALTERAR TABLAS', $q$ALTERAR TABLAS
ALTER TABLE public.pagosi_compras alter COLUMN documento SET DATA TYPE character varying(20);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTA insert into aperturas_cajas(caja,turno,valor_base,fecha_apertu…', $q$INSERTA
insert into aperturas_cajas(caja,turno,valor_base,fecha_apertura,fecha_cierre,estado,usuario_apertura,usuario_cierre,
  efectivo,cheques,bonos,tarjetas,pagos,entregas,credito)
  (select caja,turno+1,valor_base,current_timestamp ,current_timestamp,'A',usuario_apertura,usuario_cierre,
  efectivo,cheques,bonos,tarjetas,pagos,entregas,credito from aperturas_cajas where turno='278' and caja='7')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'root@caja4:/home/caja4/caja4/actualizar#', $q$root@caja4:/home/caja4/caja4/actualizar#
4# crontab -l
AUTOINCREMENTAR ID $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'SELECT ROW_NUMBER() OVER(PARTITION BY id , 0 	  	ORDER BY codigo_forma…', $q$SELECT ROW_NUMBER() OVER(PARTITION BY id , 0
	  	ORDER BY codigo_formato ASC, codigo_concepto ASC, codigo_cuenta ASC ) AS incrementable,
		  codigo_formato, codigo_concepto, codigo_cuenta, tipo, cierre, columna,id
	from exo_cuentas$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'UPDATE', $q$UPDATE$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'update exo_cuentas set id= tmp_exo.incrementable from (SELECT ROW_NUMB…', $q$update exo_cuentas set id= tmp_exo.incrementable from (SELECT ROW_NUMBER() OVER(PARTITION BY id , 0
	  	ORDER BY codigo_formato ASC, codigo_concepto ASC, codigo_cuenta ASC ) AS incrementable,
		  codigo_formato, codigo_concepto, codigo_cuenta, tipo, cierre, columna,id
		from exo_cuentas
		) tmp_exo
where (exo_cuentas.codigo_formato, exo_cuentas.codigo_concepto, exo_cuentas.codigo_cuenta)=
(tmp_exo.codigo_formato, tmp_exo.codigo_concepto, tmp_exo.codigo_cuenta)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PONER SALDO POSITIVO SI ESTA NEGATIVO', $q$PONER SALDO POSITIVO SI ESTA NEGATIVO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', '--update cartera_proveedores set  valor=abs(valor) where numero IN (''F…', $q$--update cartera_proveedores set  valor=abs(valor)
where numero IN ('FE42318','9536529645-76','FEM-1283','FVE2098','FVE2105','753-619451','MEMO 1206','BPUP370591','FEMS406','FE771','FEGM4241','BPUP372040','DSEM501','DSEM499','DSEM503','DSEM504','DSEM500','DSEM502') and contable = '23359501' and valor < 0;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTA PAGO PARA NO HACER INTERFACE', $q$INSERTA PAGO PARA NO HACER INTERFACE$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_d…', $q$insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_documento, codigo_cuenta, numero_documento, 
codigo_centro_costo, nit, sede, nit_responsable, sede_responsable,codigo_departamento_interno, detalle, documento_fuente, tipo_fuente, 
documento_banco, llave, base, tarifa, valor, codigo_origen,item, codigo_usuario, fecha_sistema)
(select '0101', p.fecha, 'RC', p.cuenta::numeric, p.numero, p.codigo_sucursal, p.nit, 
p.sede, p.nit, p.sede, '9999',concat('RC', p.numero, ' doc ', i.documento, ' : ', p.beneficiario), 
'.', 'c', '0', '0', '0', p.valor, 'RC', '0', 'wras', p.fecha_sistema
from pagos p join pagosi i on p.numero = i.numero
where p.numero in ('2040') and p.fecha = '2024-09-10' and p.nit = '890502572' and i.documento='AO-191565');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_d…', $q$insert into movimiento2024 (codigo_sucursal, fecha_documento, codigo_documento, codigo_cuenta, numero_documento, 
codigo_centro_costo, nit, sede, nit_responsable, sede_responsable,codigo_departamento_interno, detalle, documento_fuente, tipo_fuente, 
documento_banco, llave, base, tarifa, valor, codigo_origen,item, codigo_usuario, fecha_sistema)
(select '0101', p.fecha, 'RC', p.cuenta::numeric, p.numero, p.codigo_sucursal, p.nit, 
p.sede, p.nit, p.sede, '9999',concat('RC', p.numero, ' doc ', i.documento, ' : ', p.beneficiario), 
'.', 'c', '0', '0', '0', p.valor, 'RC', '0', 'wras', p.fecha_sistema
from pagos p join pagosi i on p.numero = i.numero$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'where p.numero in (''2039'') and p.fecha = ''2024-09-10'' and p.nit = ''890…', $q$where p.numero in ('2039') and p.fecha = '2024-09-10' and p.nit = '890502572' and i.documento='AO-191405');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTER pagosc', $q$INSERTER pagosc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into pagosc(numero,fecha,codigo_concepto,valor,tipo,contable,co…', $q$insert into pagosc(numero,fecha,codigo_concepto,valor,tipo,contable,codigo_sucursal,detalle,origen)
(select numero,fecha,'0',valor_anexos,'C',13050519,codigo_sucursal,concat('Pago ',numero,' Facturas'),'RC'
from pagos where numero=757802);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'INSERTAR CONTRAPARTIDA DE PAGOI EN CONTABILIAD insert into movimiento2…', $q$INSERTAR CONTRAPARTIDA DE PAGOI EN CONTABILIAD
insert into movimiento2025 (codigo_sucursal, fecha_documento, codigo_documento, codigo_cuenta, numero_documento, 
codigo_centro_costo, nit, sede, nit_responsable, sede_responsable,codigo_departamento_interno, detalle, documento_fuente, tipo_fuente, 
documento_banco, llave, base, tarifa, valor, codigo_origen,item, codigo_usuario, fecha_sistema)
(select p.codigo_sucursal, p.fecha, '0320', i.contable::numeric, p.numero, p.codigo_sucursal, p.nit, 
p.sede, p.nit, p.sede, '9999',concat('RC', p.numero, ' doc ', i.documento, ' : ', p.beneficiario), 
'.', 'C', '0', '0','0', '0', i.valor*-1, 'RC', '0', 'wras', p.fecha_sistema
from pagos p join pagosi i on p.numero = i.numero and p.nit=i.nit and p.fecha=i.fecha
where   p.fecha >='20250101' and p.fecha <='20251231' and p.numero  in  (	
'65','61','73','69','68','71','59','72','57','58','60','64',
'70','62','67','66','63','2'));
ALIAS EN TARJETA KARDEX$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update  framestextos set  campos =''codigo,nombre,alias'' where  codigo=…', $q$update  framestextos set  campos ='codigo,nombre,alias' where  codigo='TARJKARDEX' and  orden ='3'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'CREAR BODEGAS ', $q$CREAR BODEGAS $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'alter table articulo add column saldo60 numeric(15,2) default 0; alter…', $q$alter table articulo add column saldo60 numeric(15,2) default 0;
alter table articulo add column costo60 numeric(15,2) default 0;
alter table articulo add column costo_pro_60 numeric(15,2) default 0;
select codigo, saldo60, costo60, costo_pro_60 from articulo where estado='A' limit 5 (editado)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'insert into bodegas (codigo_bodega, nombre, ajustes, traslados, ventas…', $q$insert into bodegas (codigo_bodega, nombre, ajustes, traslados, ventas, compras, estado, fecha_creacion, correo,
orden, codigo_sucursal, wms,  consignacion,  sucursal_id,  transito,
-- contable_e numeric(15,0) DEFAULT 14350700, -- contable_x numeric(15,0) DEFAULT 14350700,
web,
-- nit character varying(20) COLLATE pg_catalog."default" DEFAULT '.'::character varying, sede numeric DEFAULT 0,
wa
)(select 's4', '0106 INHOUSE FIRPLAK', 'S', 'S', 'S', 'S', 'A', now(), '.', (select (max(orden))+1 from bodegas),
codigo_sucursal, 'N', 'N', id, 'N', 'N', 'N' from sucursales where codigo_sucursal='0106')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'CREAR BODEGA DIFERENTE A SUMATEC', $q$CREAR BODEGA DIFERENTE A SUMATEC$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'alter table articulo add column saldo11 numeric(15,2) default 0; alter…', $q$alter table articulo add column saldo11 numeric(15,2) default 0;
alter table articulo add column costo11 numeric(15,2) default 0;
alter table articulo add column costo_pro_11 numeric(15,2) default 0;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'insert into bodegas (codigo_bodega, nombre, ajustes, traslados, ventas…', $q$insert into bodegas (codigo_bodega, nombre, ajustes, traslados, ventas, compras, estado, fecha_creacion, correo,
orden, codigo_sucursal, wms,  consignacion,  sucursal_id,  transito,contable_e,contable_x,web,remoto,so_hq,bodega_noacloud_pedidos,nit,wa,
bodega_materia_prima_almacen,wms_nuevo,wms_externo)
(select (select (max(orden))+1 from bodegas), '0101 CONSIGNACION SUMATEC', 'S', 'S', 'S', 'S', 'A', now(), '.', (select (max(orden))+1 from bodegas),
codigo_sucursal, 'N', 'N', id, '.', '0', '0','.','.','.','.','.','N' ,'N','N','N' from sucursales where codigo_sucursal='0101');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'BUSCAR CUENTA DE LA TARJETA', $q$BUSCAR CUENTA DE LA TARJETA 
select * from forma_pago where numero_factura ilike'FFC-%' and tarjeta_debito <>'0' and codigo_tarjeta_debito='0008'
select valor, * from movimiento2024 where numero_documento='FFC-126751' and codigo_documento='IF'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTAR CARTERA_CLIENTES', $q$INSERTAR CARTERA_CLIENTES$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor…', $q$insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
(select d.codigo_sucursal, concat('DV-',d.numero), d.fecha, d.fecha, d.valor *(-1), d.valor *(-1),
concat('DV ',d.numero,' de Fra ',d.pedido), d.nit, d.sede, 'wras','13050502'
 from dfacturac d where d.numero='137'  and d.fecha='2025-03-14' and d.nit in('811039091'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PAGOS QUE NO ESTAN EN CARTERA Y ESTAN DESCUADRADOS EN CONTABILIDAD', $q$PAGOS QUE NO ESTAN EN CARTERA Y ESTAN DESCUADRADOS EN CONTABILIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor…', $q$insert into cartera_clientes (codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
(select p.codigo_sucursal, concat('A-',p.numero), p.fecha, p.fecha, p.valor *(-1), 0,
concat(p.numero, 'Pago. 156516 Anula pago ',p.numero), p.nit, p.sede, 'wras','28050600' from pagos p where p.numero='156489' and p.cuenta='11100503' and p.fecha='2024-05-22' and p.nit in('25154925'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
(select '0101', p.fecha, '0320','28050600', p.numero, p.codigo_sucursal,p.nit, p.sede, p.nit, p.sede, '8888', concat('RC ', p.numero,':', p.beneficiario),
p.numero, 'C', '0', '0', '0', '0', c.valor,'RC', '0', 'wras', p.fecha_sistema from pagos p, cartera_clientes c where p.numero in('156489')
and p.FECHA='2024-05-22' and p.nit='25154925' and (concat('A-',p.numero::varchar)=c.numero)and (p.nit,p.sede)=(c.nit,c.sede));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,
documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
(select '0101', p.fecha, '0320','28050600', p.numero, p.codigo_sucursal,p.nit, p.sede, p.nit, p.sede, '8888', concat('RC ', p.numero,':', p.beneficiario),
p.numero, 'C', '0', '0', '0', '0', c.valor *(-1),'RC', '0', 'wras', p.fecha_sistema from pagos p, cartera_clientes c where p.numero in('156516')
and p.FECHA='2024-05-23' and p.nit='25154925' and c.numero='A-156489' and p.numero::varchar=(substring (c.texto, (POSITION('Pago.' IN c.texto)+6), 6)) and (p.nit,p.sede)=(c.nit,c.sede));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTA DOCUMENTO EN CONTABILIDAD', $q$INSERTA DOCUMENTO EN CONTABILIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,…', $q$nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,documento_banco,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistem…', $q$llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '(select distinct codigo_sucursal,fecha_documento,codigo_documento,1105…', $q$(select distinct codigo_sucursal,fecha_documento,codigo_documento,11050509,numero_documento,codigo_centro_costo,nit,sede,nit_responsable,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'sede_responsable,codigo_departamento_interno,''Venta : FNC-63399:INVERS…', $q$sede_responsable,codigo_departamento_interno,'Venta : FNC-63399:INVERSIONES DISE�O E INGIENERIA S.A.S',documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '512690.65,codigo_origen,item,codigo_usuario,fecha_sistema', $q$512690.65,codigo_origen,item,codigo_usuario,fecha_sistema$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'from movimiento2024 where numero_documento in(''FNC-63399'') AND codigo_…', $q$from movimiento2024 where numero_documento in('FNC-63399') AND codigo_documento='IF' and codigo_origen='FACTURA')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTA DOCUMENTOS EN EINHELL QUE DE LA RETENCION', $q$INSERTA DOCUMENTOS EN EINHELL QUE DE LA RETENCION$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into  movimiento2024 (codigo_sucursal,fecha_documento,codigo_do…', $q$insert into  movimiento2024 (codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,
codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,
tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
(select distinct m.codigo_sucursal, m.fecha_documento,m.codigo_documento,13551501,f.numero,
m.codigo_centro_costo,m.nit,m.sede,m.nit_responsable,m.sede_responsable,m.codigo_departamento_interno,
concat('Retencion Ventas ', f.numero, ':', f.nproveedor),f.numero,m.tipo_fuente,m.documento_banco,
m.llave,f.baseg,m.tarifa,abs(f.baseg + f.iva - f.valor),m.codigo_origen,m.item,m.codigo_usuario,m.fecha_sistema
from movimiento2024 m
join facturac f on f.numero = m.numero_documento and f.nit = m.nit and f.fecha = m.fecha_documento
where m.codigo_documento = 'IF' and m.codigo_origen = 'FACTURA'
and m.numero_documento in (
'ECOL-1125', 'ECOL-1355', 'ECOL-1354', 'ECOL-1359', 'ECOL-1287', 'ECOL-1291', 'ECOL-1357', 'ECOL-1330', 'ECOL-1212', 'ECOL-1482',
'ECOL-1227', 'ECOL-1210', 'ECOL-1221', 'ECOL-1124', 'ECOL-1358', 'ECOL-1100', 'ECOL-1211', 'ECOL-1404', 'ECOL-1292', 'ECOL-1481',
'ECOL-1290', 'ECOL-1289', 'ECOL-1332', 'ECOL-1204', 'ECOL-1277', 'ECOL-1219', 'ECOL-1405', 'ECOL-1360', 'ECOL-1117', 'ECOL-1328',
'ECOL-1200', 'ECOL-1483')
and m.nit in ('1024464135', '1095806370', '12961349', '16789308', '28328075', '45468297', '50900346', '63313423', '800007359', '800151127',
'804017457', '805028705', '805030512', '830512400', '890331426', '891801918', '900231860', '900323278', '900632182', '901031400',
'901144023', '901285199'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'INSERTAR IMPOCONSUMO LA 29 insert into movimiento2026 (codigo_sucursal…', $q$INSERTAR IMPOCONSUMO LA 29
insert into movimiento2026 (codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,
numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,
detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
select  f.codigo_sucursal,f.fecha,'0900',41359506,f.numero,f.codigo_sucursal,f.nit,f.sede,
f.nit,f.sede,'9999',concat('Impoconsumo ', f.numero, ':', f.nproveedor),f.numero,'P',0,0,f.baseg,0,
f.impoconsumo * -1,'FACTURA',0,f.usuario,current_timestamp 
from facturac f where f.impoconsumo <> 0 and f.fecha between '20260501' and '20260520'
and not exists (
    select 1
    from movimiento2026 mo
    where mo.numero_documento = f.numero
      and mo.nit = f.nit
      and mo.sede = f.sede
      and mo.fecha_documento = f.fecha
      and mo.codigo_cuenta = 41359506
);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTAR RETENCIONES TODO PVC FACTURAS Y DEVLUCIONES', $q$INSERTAR RETENCIONES TODO PVC FACTURAS Y DEVLUCIONES$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--insertar retenciones facturas DEBEN DE SER 152 REGISTROS insert into…', $q$--insertar retenciones facturas DEBEN DE SER 152 REGISTROS
insert into movimiento2026 (codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,
numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,
detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
select  f.codigo_sucursal,f.fecha,'0301',13551501,f.numero,f.codigo_sucursal,f.nit,f.sede,
f.nit,f.sede,'99',concat('Retencion Ventas ', f.numero, ':', f.nproveedor),f.numero,'C',0,0,f.baseg,0,
fi.valor,'FACTURA',0,f.usuario,current_timestamp 
from facturac f 
join facturac_impuestos fi on  f.numero=fi.numero_factura and f.fecha=fi.fecha
where   f.fecha between '20260101' and current_date
and not exists (
    select 1
    from movimiento2026 mo
    where mo.numero_documento = f.numero
      and mo.nit = f.nit
      and mo.sede = f.sede
      and mo.fecha_documento = f.fecha
      and mo.codigo_cuenta = 13551501
)returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--insertar retenciones DEVOLUCIONES DEBEN DE SER 8 REGISTROS insert in…', $q$--insertar retenciones DEVOLUCIONES DEBEN DE SER 8 REGISTROS
insert into movimiento2026 (codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,
numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,
detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
select  f.codigo_sucursal,f.fecha,'0351',13551501,f.numero,f.codigo_sucursal,f.nit,f.sede,
f.nit,f.sede,'99',concat('Retencion Devolucion Ventas ', f.numero, ':', f.nproveedor),f.numero,'C',0,0,f.baseg,0,
fi.valor,'DEV.FAC',0,f.usuario,current_timestamp 
from dfacturac f 
join dfacturac_impuestos fi on  f.numero=fi.numero_devolucion and f.fecha=fi.fecha
where   f.fecha between '20260101' and current_date
and not exists (
    select 1
    from movimiento2026 mo
    where mo.numero_documento = f.numero
      and mo.nit = f.nit
      and mo.sede = f.sede
      and mo.fecha_documento = f.fecha
      and mo.codigo_cuenta = 13551501
)returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'Pagos que no subieron la contrapartida', $q$Pagos que no subieron la contrapartida
insert into movimiento2026 (codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,
numero_documento,codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,
detalle,documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
select  '0101',p.fecha,'RC',13050500,p.numero,i.codigo_sucursal,p.nit,p.sede,
i.nit,i.sede,'9999',concat('RC ',i.numero,' doc ',i.documento, ':', p.beneficiario),i.documento,'C',0,0,0,0,
i.valor*-1,'RC',0,p.codigo_usuario,current_timestamp 
from pagosi i  
join pagos p on i.numero=p.numero and i.fecha=p.fecha and   i.nit=p.nit
where   i.fecha between '20260504' and '20260531'
and not exists (
    select 1
    from movimiento2026 mo
    where  mo.numero_documento = i.numero::text
	  and mo.documento_fuente = i.documento
      and mo.nit = i.nit
      and mo.sede = i.sede
      and mo.fecha_documento = i.fecha
      and mo.codigo_cuenta = 13050500
)returning *;
NIT ALFA NUMERICO
SELECT * FROM nitsx_sedes WHERE nit ~ '[A-Za-z]' AND nit ~ '[0-9]';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'CALCULAR IVAS BASE', $q$CALCULAR IVAS BASE
select 
    sum(case when tarifa_iva = '5' then total_iva else 0 end) AS iva_5,
    sum(case when tarifa_iva = '5' then total_sin_iva else 0 end) AS baseg_5,
    sum(case when tarifa_iva = '19' then total_iva else 0 end) AS iva_19,
    sum(case when tarifa_iva = '19' then total_sin_iva else 0 end) AS baseg_19,
    sum(case when tarifa_iva = '0' then total_sin_iva else 0 end) AS basee
from itemfc where numero = 'SPFE10974';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'INSERTAR PAGOS Y EN CONTABILIDAD ----inserta en la tabla pagos insert …', $q$INSERTAR PAGOS Y EN CONTABILIDAD
----inserta en la tabla pagos
insert into pagos
(select cast(Substring(c.numero,3) as numeric(6)), c.fecha,  c.valor/-1, '999','11100525',
c.fecha, n.nombre, 'Anticipo ' || c.numero , '0','0','999', '.', c.nit, c.sede,'0003','.', '.' ,
'wras', c.codigo_sucursal,c.fecha,now()from cartera_clientes c , nitsx_sedes n
 where cast(Substring(c.numero,3) as numeric(6) ) not in (select numero from pagos)
and  c.fecha='2024-05-03'  and c.numero='A-634958' and c.nit=n.nit and c.sede=n.sede);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '------ insertar en contabilidad', $q$------ insertar en contabilidad$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,
codigo_centro_costo,nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,
documento_fuente,tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
(select '0101', p.fecha, 'RC','11100525', p.numero, p.codigo_sucursal,p.nit, p.sede, p.nit, p.sede, '9999', concat('RC ', p.numero,':', p.beneficiario),
p.numero, 'C', '0', '0', '0', '0', c.valor *(-1),'RC', '0', 'wras', p.fecha_sistema from pagos p, cartera_clientes c where p.numero in('634958')
and p.FECHA='2024-05-03' and p.nit='13068461' and c.numero='A-634958' and p.numero::character varying=c.texto and (p.nit,p.sede)=(c.nit,c.sede));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2024(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,
nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,tipo_fuente,documento_banco,
llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema)
(select '0101', c.fecha,'RC',c.contable,c.numero,c.codigo_sucursal,c.nit,c.sede,c.nit,c.sede,9999,concat('RC ', c.numero,':',p.beneficiario),
 p.numero,'C', '0', '0', '0', '0',c.valor,'RC', '0', 'wras', p.fecha_sistema 
from cartera_clientes c, pagos p where c.numero in('634958') and c.id='3918322' and c.nit=p.nit);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select ''clientes'' tipo_tercero, nit, sede, verifica, nombre, otro_nomb…', $q$select 'clientes' tipo_tercero, nit, sede, verifica, nombre, otro_nombre, telefonos, email, direccion, email_factura_electronica,
codigo_ciudad, codigo_departamento_geografico, fecha_ingreso fecha_creacion, estado
from nitsx_sedes where (nit, sede) in(select distinct nit, sede from facturac_compras)
union all
select 'proveedores' tipo_tercero, nit, sede, verifica, nombre, otro_nombre, telefonos, email, direccion, email_factura_electronica,
codigo_ciudad, codigo_departamento_geografico, fecha_ingreso fecha_creacion, estado
from nitsx_sedes where (nit, sede) in(select distinct nit, sede from facturac)
union all
select 'empleados' tipo_tercero, nit, sede, verifica, nombre, otro_nombre, telefonos, email, direccion, email_factura_electronica,
codigo_ciudad, codigo_departamento_geografico, fecha_ingreso fecha_creacion, estado
from nitsx_sedes where salario <>'0'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'alterar una tabla con default', $q$alterar una tabla con default$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'ALTER TABLE public.nitsx_sedes', $q$ALTER TABLE public.nitsx_sedes
ALTER COLUMN tipo_persona SET DEFAULT 'N'::character varying;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'CUADRADAR INTERFACES EN LAS CUENTAS CON LOS ITEMS VS CONTABILIDAD', $q$CUADRADAR INTERFACES EN LAS CUENTAS CON LOS ITEMS VS CONTABILIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'WITH resumen_iva AS (', $q$WITH resumen_iva AS (
  SELECT 
    numero,
    SUM(CASE WHEN tarifa_iva = '5' THEN total_iva ELSE 0 END) * -1 AS suma_iva_5,
    SUM(CASE WHEN tarifa_iva = '5' THEN total_sin_iva ELSE 0 END) * -1 AS suma_sin_iva_5,
    SUM(CASE WHEN tarifa_iva = '19' THEN total_iva ELSE 0 END) * -1 AS suma_iva_19,
    SUM(CASE WHEN tarifa_iva = '19' THEN total_sin_iva ELSE 0 END) * -1 AS suma_sin_iva_19,
    SUM(CASE WHEN tarifa_iva = '0' THEN total_sin_iva ELSE 0 END) * -1 AS suma_sin_iva_0
  FROM itemfc 
  WHERE numero IN (
    'MYM3953', 'MY1318732', 'MYM4059', 'MYM5880', 'MY1314225', 'MY1315813',
    'MY1312153', 'MY1317113', 'MYM5879', 'MY1312955', 'MY1317115', 'MY1318101',
    'MYM3268', 'MYM6296', 'MY1319059', 'MYM5216', 'MYM3267', 'MY1315492',
    'MY1317116', 'MY1318731', 'MYM4703', 'MYM5556', 'MYM5877', 'MYM5113',
    'MY1318733', 'MYM5555', 'MY1314226', 'MYM4705', 'MY1315491', 'MYM5878',
    'MY1317114', 'MYM4704'
  )
  GROUP BY numero
)
UPDATE movimiento2024
SET valor = 
  CASE 
    WHEN codigo_cuenta = '24080105' THEN (SELECT suma_iva_5 FROM resumen_iva WHERE resumen_iva.numero = movimiento2024.numero_documento)
    WHEN codigo_cuenta = '41359505' THEN (SELECT suma_sin_iva_5 FROM resumen_iva WHERE resumen_iva.numero = movimiento2024.numero_documento)
    WHEN codigo_cuenta = '24080106' THEN (SELECT suma_iva_19 FROM resumen_iva WHERE resumen_iva.numero = movimiento2024.numero_documento)
    WHEN codigo_cuenta = '41359508' THEN (SELECT suma_sin_iva_19 FROM resumen_iva WHERE resumen_iva.numero = movimiento2024.numero_documento)
    WHEN codigo_cuenta = '41359503' THEN (SELECT suma_sin_iva_0 FROM resumen_iva WHERE resumen_iva.numero = movimiento2024.numero_documento)
  END
WHERE numero_documento IN (
    'MYM3953', 'MY1318732', 'MYM4059', 'MYM5880', 'MY1314225', 'MY1315813',
    'MY1312153', 'MY1317113', 'MYM5879', 'MY1312955', 'MY1317115', 'MY1318101',
    'MYM3268', 'MYM6296', 'MY1319059', 'MYM5216', 'MYM3267', 'MY1315492',
    'MY1317116', 'MY1318731', 'MYM4703', 'MYM5556', 'MYM5877', 'MYM5113',
    'MY1318733', 'MYM5555', 'MY1314226', 'MYM4705', 'MY1315491', 'MYM5878',
    'MY1317114', 'MYM4704'
  )
  AND codigo_cuenta IN ('24080105', '41359505', '24080106', '41359508', '41359503');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ORGANIZAR ITEMS CON FACTURA', $q$ORGANIZAR ITEMS CON FACTURA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'WITH resumen_factura AS (', $q$WITH resumen_factura AS (
  SELECT 
    SUM(CASE WHEN tarifa_iva = '5' THEN total_iva ELSE 0 END) +
    SUM(CASE WHEN tarifa_iva = '19' THEN total_iva ELSE 0 END) AS total_iva,
    SUM(CASE WHEN tarifa_iva = '5' THEN total_sin_iva ELSE 0 END) +
    SUM(CASE WHEN tarifa_iva = '19' THEN total_sin_iva ELSE 0 END) AS total_baseg,
    SUM(CASE WHEN tarifa_iva = '0' THEN total_sin_iva ELSE 0 END) AS total_basee$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '  FROM itemfc where numero=''MYM3953''', $q$  FROM itemfc where numero='MYM3953'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', ')', $q$)
-- Luego, actualizamos la tabla facturac
UPDATE facturac
SET 
  iva = COALESCE(resumen_factura.total_iva, 0),
  baseg = COALESCE(resumen_factura.total_baseg, 0),
  basee = COALESCE(resumen_factura.total_basee, 0),
  valor = COALESCE(resumen_factura.total_basee, 0) + COALESCE(resumen_factura.total_baseg, 0) + COALESCE(resumen_factura.total_iva, 0)
FROM resumen_factura
WHERE facturac.numero = resumen_factura.numero;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'DATOS PANAMA Y COSTA RICA', $q$DATOS PANAMA Y COSTA RICA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PANAMA DGI', $q$PANAMA DGI
https://dgi-fep.mef.gob.pa/Sesion/LoginFEP  (Pagina para consultar documentos de Panamá )$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'USUARIO:155744266-2-2023', $q$USUARIO:155744266-2-2023
CONTRASEÑA:SUMAPA311023$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'COSTA RICA', $q$ COSTA RICA
(Credenciales para consultar documentos de costarica)
https://facturacion.mdg-cloud.com/MDGPortal/Usuario/Filtro#
usuario: raquel.morera@sumatec.cr
contraseña: Jmtm0522@$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ACTUALIZAR FECHA DE CONTABILIDAD CON FACTURA', $q$ACTUALIZAR FECHA DE CONTABILIDAD CON FACTURA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update facturac set fecha = m.fecha_documento from movimiento2024 m wh…', $q$update facturac
set fecha = m.fecha_documento
from movimiento2024 m
where facturac.numero = m.numero_documento
and facturac.nit = m.nit
and facturac.fecha between '2024-09-28' and '2024-09-30';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select f.numero as facturas,f.fecha as fecha_factura,f.codigo_sucursal…', $q$select f.numero as facturas,f.fecha as fecha_factura,f.codigo_sucursal,m.numero_documento as contabilidad,m.fecha_documento as fecha_contabilidad
from facturac f inner join movimiento2024 m on (f.numero,f.nit)=(m.numero_documento,m.nit)
where f.fecha between '20240928' and '20240930'
group by f.numero,f.fecha,m.numero_documento,m.fecha_documento,f.codigo_sucursal
order by f.fecha$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR FECHA DE VENCIMIENTO', $q$CAMBIAR FECHA DE VENCIMIENTO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'a 60 dias de la fecha de emisión de la factura current_date fecha actu…', $q$a 60 dias de la fecha de emisión de la factura current_date fecha actual$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update cartera_Clientes set vence=fecha + interval ''60 days'' where nit…', $q$update cartera_Clientes
set vence=fecha + interval '60 days'
where nit='900989305' and saldo<>0 and numero not ilike '%DV-%'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '10 dias antes', $q$10 dias antes
UPDATE registros
SET fecha = DATE_SUB(fecha, INTERVAL 10 DAY)
WHERE id = tu_id_de_registro;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '10 dias despues', $q$10 dias despues
UPDATE registros
SET fecha = DATE_ADD(fecha, INTERVAL 10 DAY)
WHERE id = tu_id_de_registro;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'PINTUNAL', $q$PINTUNAL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select  pf.fecha, pf.lote, g.codigo_grupo, lc.codigo_articulo, pf.cant…', $q$select  pf.fecha, pf.lote, g.codigo_grupo, lc.codigo_articulo, pf.cantidad_a_producir,
sum(lc.costo_unitario * abs(lc.cantidad))::numeric(15,2) as costo_materia_prima,
sum((lc.costo_unitario * abs(lc.cantidad)) / nullif((select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pf.id), 0))::numeric(15,2) as costo_granel,
pfa.detalle from produccion_fichas pf
left join produccion_fichas_ajustes pfa on pfa.produccion_fichas_id = pf.id
left join log_costos lc on lc.numero_documento = pfa.numero_ajuste and lc.tipo = 'AJ'
left join  procesos p on pf.lote = p.referencia and p.estado = 'Finalizado'
inner join articulo a on a.codigo = lc.codigo_articulo
inner join grupos g on g.codigo_grupo = a.codigo_grupo
where p.proceso_configuracion_id=1 and p.fecha_fin between'K1 00:00:00' and 'K2 23:59:59'
group by pf.fecha,pf.lote,lc.codigo_articulo,pf.cantidad_a_producir,lc.costo_unitario,g.codigo_grupo,lc.cantidad,pfa.detalle;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Usuarios, roles y permisos', 'SELECT pf.id,pf.lote,pf.descripcion,pf.cantidad_a_producir,u.nombre as…', $q$SELECT pf.id,pf.lote,pf.descripcion,pf.cantidad_a_producir,u.nombre as usuario,f.procedimiento,a.codigo as codigo_producto_formulacion, a.nombre as nombre_producto_formulacion,pf.fecha,pf.hora, (select sum(pfi.cantidad) as peso_teorico from produccion_fichas_items pfi where pf.id = pfi.produccion_fichas_id),pf.observaciones_calidad, pf.puntos,CASE WHEN pf.tipo_ficha='L' THEN 'LIBRE'::VARCHAR(10)  WHEN pf.tipo_ficha='N' THEN 'NORMAL'::VARCHAR(10) END AS tipo_ficha,
(select galones_resultantes from produccion_fichas_pesajes where produccion_fichas_id=pf.id) as peso_registrado_por_calidad,
(select coalesce(sum(emp_final.cantidad_agregada * emp_final.factor_galon),1)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id=pf.id) as total_envasados
FROM produccion_fichas pf INNER JOIN usuarios u ON pf.usuario_id  = u.id
INNER JOIN produccion_formulaciones f ON pf.formulacion_id = f.id
INNER JOIN articulo a ON f.articulo_id = a.id
where pf.lote='2024-007456';
select --costos.fecha,costos.lote,costos.grupo,costos.codigo, costos.cantidad, 
/*l.codigo_articulo,l.costo_unitario,*/ pf.fecha as fecha, pf.lote as lote, g.codigo_grupo as grupo, a2.codigo codigo,
sum(abs(l.costo_unitario * (l.cantidad)) / nullif((select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pf.id), 0))::numeric(15,2) as costo_unitario,
sum(l.costo_unitario*l.cantidad) as costo_total
--sum(abs(costos.costo_granel)) as costo_unitario, (sum(abs(costos.costo_granel))*costos.cantidad) as costo_total
from
/*(select   pf.fecha as fecha, pf.lote as lote, g.codigo_grupo as grupo, a.codigo codigo, pf.id id, pfa.numero_ajuste as numero_ajuste,
(select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pf.id)
as cantidad ,lc.codigo_articulo as codigo_articulo,
sum((lc.costo_unitario * (lc.cantidad)) / nullif((select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pf.id), 0))::numeric(15,2) as costo_granel
from produccion_fichas pf
--inner join produccion_fichas_envasado_final emp_final on emp_final.produccion_fichas_id=pf.id
inner join produccion_fichas_envasado_final pfaf on pfaf.produccion_fichas_id=pf.id
inner join produccion_fichas_ajustes pfa on pfa.produccion_fichas_id = pf.id
inner join log_costos lc on lc.numero_documento = pfa.numero_ajuste and lc.tipo = 'AJ' 
left join  procesos p on pf.lote = p.referencia and p.estado = 'Finalizado'
inner join articulo a on a.id = pfaf.articulo_id 
inner join grupos g on g.codigo_grupo = a.codigo_grupo 
--inner join produccion_fichas_items pfi on pf.id=pfi.produccion_fichas_id
where p.proceso_configuracion_id=1 and p.fecha_fin BETWEEN '20241001 00:00:00' and '20241015 23:59:59' and pf.lote='2024-007456'
AND( a.codigo NOT LIKE '%-2' AND a.codigo NOT LIKE '%-5' AND a.codigo NOT LIKE '%-1' AND a.codigo NOT LIKE '%-50' )
group by  pf.fecha,pf.lote,g.codigo_grupo,a.codigo,lc.codigo_articulo,pf.id,pfa.numero_ajuste) as costos*/ 
produccion_fichas pf
--inner join produccion_fichas pf on pf.id=.id
inner join produccion_fichas_items pfi on pf.id=pfi.produccion_fichas_id
inner join articulo a on  pfi.articulo_id=a.id 
inner join produccion_fichas_ajustes pfa on pfa.produccion_fichas_id = pf.id
inner join produccion_fichas_envasado_final pfaf on pfaf.produccion_fichas_id=pf.id
inner join articulo a2 on  pfaf.articulo_id=a2.id 
inner join grupos g on g.codigo_grupo = a2.codigo_grupo 
inner join log_costos l on l.codigo_articulo=a.codigo and l.numero_documento=pfa.numero_ajuste and l.tipo = 'AJ'
where pf.lote='2024-007456' AND( a2.codigo NOT LIKE '%-2' AND a2.codigo NOT LIKE '%-5' AND a2.codigo NOT LIKE '%-1' AND a2.codigo NOT LIKE '%-50' )
--l.codigo_articulo=costos.codigo_articulo 
--group by costos.fecha,costos.lote,costos.grupo,costos.codigo, costos.cantidad,l.codigo_articulo,l.costo_unitario,l.cantidad
group by  pf.fecha, pf.lote , g.codigo_grupo, a2.codigo $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select   pf.fecha, pf.lote, g.codigo_grupo, a.codigo,lc.codigo_articul…', $q$select   pf.fecha, pf.lote, g.codigo_grupo, a.codigo,lc.codigo_articulo,lc.cantidad,lc.costo_unitario ,
--sum(lc.costo_unitario * (lc.cantidad))::numeric(15,2) as costo_materia_prima,
sum((lc.costo_unitario * abs(lc.cantidad)) / nullif((select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pf.id), 0))::numeric(15,2) as costo_granel,pfa.detalle
from produccion_fichas pf
left join produccion_fichas_envasado_final pfef on pfef.produccion_fichas_id = pf.id
inner join produccion_fichas_ajustes pfa on pfa.produccion_fichas_id = pf.id
inner join log_costos lc on lc.numero_documento = pfa.numero_ajuste and lc.tipo = 'AJ'
left join  procesos p on pf.lote = p.referencia and p.estado = 'Finalizado'
inner join articulo a on a.id = pfef.articulo_id
AND a.codigo NOT LIKE '%-2' AND a.codigo NOT LIKE '%-5' AND a.codigo NOT LIKE '%-1' AND a.codigo NOT LIKE '%-50'
inner join grupos g on g.codigo_grupo = a.codigo_grupo
where p.proceso_configuracion_id=1 and p.fecha_fin BETWEEN 'K1 00:00:00' and 'K2 23:59:59'
group by  pf.fecha,pf.lote,g.codigo_grupo,lc.cantidad,a.codigo,lc.costo_unitario,lc.codigo_articulo,pfa.detalle$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from log_costos where numero_documento in(''21188'',''21187'') an…', $q$select * from log_costos where numero_documento in('21188','21187') and tipo='AJ'
select * from procesos
select * from produccion_fichas_ajustes where numero_ajuste in('21188','21187')
select * from produccion_fichas where lote ='2024-007456'
select * from  produccion_fichas_ajustes where produccion_fichas_id='9564'
select * from produccion_fichas_envasado_final where produccion_fichas_id='9564'
select * from articulo where id in (366203,366155)
select * from produccion_fichas_items where produccion_fichas_id ='9564'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select pf.fecha as fecha, pf.lote as lote, g.codigo_grupo as grupo, a2…', $q$select pf.fecha as fecha, pf.lote as lote, g.codigo_grupo as grupo, a2.codigo, aux.cantidad,aux.costo_unitario::numeric(15,2) as costo_unitario,
aux.total as costo_total
from  
     (select sum(abs(it.costo_unitario*it.cantidad))::numeric(15,2) as total, pft.produccion_fichas_id id,
	 sum((abs(it.costo_unitario * it.cantidad))) / nullif((select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
	from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pft.produccion_fichas_id ), 0)::numeric(15,2) as costo_unitario,
	 (select sum(emp_final.cantidad_agregada * emp_final.factor_galon)
     from produccion_fichas_envasado_final emp_final where emp_final.produccion_fichas_id = pft.produccion_fichas_id)::numeric(15,1) as cantidad
	from produccion_fichas_ajustes pft  
	left join log_costos it on it.numero_documento=pft.numero_ajuste and it.tipo =('AJ')  
	left join articulo a on a.codigo=it.codigo_articulo 
	where a.id in ( select articulo_id from produccion_fichas_items  
	union all 
	select articulo_id from produccion_fichas_items_ajustes ) 
	and it.cantidad  in (  select -1*cantidad_agregada from produccion_fichas_items 
	union all  
	select -1*cantidad_agregada from produccion_fichas_items_ajustes)group by pft.produccion_fichas_id) as aux
inner join produccion_fichas pf on pf.id=aux.id
inner join produccion_fichas_items pfi on pf.id=pfi.produccion_fichas_id
inner join articulo a on  pfi.articulo_id=a.id 
inner join produccion_fichas_ajustes pfa on pfa.produccion_fichas_id = pf.id
INNER JOIN produccion_formulaciones f ON pf.formulacion_id = f.id
inner join articulo a2 on  f.articulo_id=a2.id 
inner join grupos g on g.codigo_grupo = a2.codigo_grupo 
inner join log_costos l on l.codigo_articulo=a.codigo and l.numero_documento=pfa.numero_ajuste and l.tipo = 'AJ'
left join  procesos p on pf.lote = p.referencia and p.estado = 'Finalizado'
where p.fecha_fin BETWEEN '20241001 00:00:00' and '20241015 23:59:59'
AND( a2.codigo NOT LIKE '%-2' AND a2.codigo NOT LIKE '%-5' AND a2.codigo NOT LIKE '%-1' AND a2.codigo NOT LIKE '%-50' )
group by  pf.fecha, pf.lote , g.codigo_grupo, a2.codigo ,pf.id,aux.total,aux.costo_unitario,aux.cantidad
order by pf.lote$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ELIMINAR DOCUMENTOS DUPLICADOS EN CONTABILIDAD', $q$ELIMINAR DOCUMENTOS DUPLICADOS EN CONTABILIDAD$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '--QUERY QUE AL QJECUTAR MUESTRA LA CANTIDAD DE DOCUMENTOS QUE ESTAN DU…', $q$--QUERY QUE AL QJECUTAR MUESTRA LA CANTIDAD DE DOCUMENTOS QUE ESTAN DUPLICADOS
select FECHA_DOCUMENTO, NUMERO_DOCUMENTO, CODIGO_CUENTA, CODIGO_DOCUMENTO, 'factura' AS TIPO_DOCUMENTO, VALOR,
COUNT(VALOR) AS VECES_REPETIDO from movimiento2025
where codigo_origen='FACTURA' AND FECHA_DOCUMENTO BETWEEN '2025-02-24' AND '2025-02-25'
GROUP BY FECHA_DOCUMENTO, NUMERO_DOCUMENTO, CODIGO_CUENTA, CODIGO_DOCUMENTO, VALOR
HAVING COUNT(VALOR) >1 and valor <> '0'
order by fecha_Documento,numero_documento asc
----- QUERY, PARA BORRAR LOS DOCUMENTOS DUPLICADOS, SOLO SE ELIMINAN LOS DOCUMENTOS QUE SON MAYORES A UNO EN EL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'DELETE FROM movimiento2025 WHERE id IN (     SELECT id FROM (         …', $q$DELETE FROM movimiento2025
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY FECHA_DOCUMENTO, NUMERO_DOCUMENTO, CODIGO_CUENTA, CODIGO_DOCUMENTO, VALOR ORDER BY id) AS fila_numero
        FROM movimiento2025
        WHERE codigo_origen = 'FACTURA'
        AND FECHA_DOCUMENTO BETWEEN '2025-02-24' AND '2025-02-25'
    ) t
    WHERE fila_numero > 1
);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ORGANIZAR COMPRAS EN LA INTEGRIDAD CON OTROS IMPUESTOS', $q$ORGANIZAR COMPRAS EN LA INTEGRIDAD CON OTROS IMPUESTOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'UPDATE movimiento2024 AS m SET valor = fc.otros_impuestos FROM factura…', $q$UPDATE movimiento2024 AS m
SET valor = fc.otros_impuestos
FROM facturac_compras AS fc
WHERE fc.numero = m.numero_documento
  AND fc.fecha = m.fecha_documento
  AND fc.nit = m.nit
  AND m.codigo_cuenta = '14350527'
  AND m.numero_documento IN (
	  'FYMB102204770', '3081679087',
      'FYMB102206033', '3081672859', 'FE600682674',
      'FYMB102206012', '3081679094', 'FYMB102204750',
      'FYMB102206013', 'MY3981555', '7005538798',
      '1272050070', 'FE600685703', '7005538810',
      '3081684197');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SELECT m.numero_documento, m.fecha_documento, m.nit, m.valor, fc.otros…', $q$SELECT m.numero_documento, m.fecha_documento, m.nit, m.valor, fc.otros_impuestos,
 m.valor-fc.otros_impuestos as dife
FROM movimiento2024 AS m
JOIN facturac_compras AS fc
  ON fc.numero = m.numero_documento
  AND fc.fecha = m.fecha_documento
  AND fc.nit = m.nit
WHERE m.codigo_cuenta = '14350527'
  AND m.numero_documento IN (
'N19989870','N19983671','FFAE11170864','N19983680','DQ118648',
'DQ07209845','N110023217','FYMB102209226','3081703043',
'FV1901','FYMB102209205','3081703038','3081703034',
'FE0124139','3081709267','3081709273','ECC12302');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INGRESAR  FACTURAS MASIVAS', $q$INGRESAR  FACTURAS MASIVAS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'DO $$', $q$DO $$  
DECLARE  
    i INT := 0;  
    base_num INT := 55525; -- Número inicial del consecutivo  
    nuevo_numero TEXT;  
BEGIN  
    WHILE i < 40000 LOOP  
        -- Generar el nuevo número consecutivo  
        nuevo_numero := 'FCCP-' || (base_num + i);  $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '        -- Insertar el registro con el consecutivo generado           …', $q$        -- Insertar el registro con el consecutivo generado  
        INSERT INTO facturac (fecha, nit, sede, vence, valor, baseg, basee, iva, descuentos, fletes, fletepor, 
		retencion, porrete, desc1, desc2, desc3, fecha1, fecha2, fecha3, pedido, bodega, estado, hora, numero,
		aproxima, imp01, imp02, tipo, contable, vendedor, peso, ruta, ciudad, costo, costo1, telefonico, 
		nproveedor, desc4, trasmite, observa, codigo_facturacion, codigo_sucursal, h_sistema, sucursal_origen, 
		sucursal_cartera, usuario, fecha_sistema, factor, imp04, impoconsumo, valor_rete_iva, id, tarifa_rete_iva, 
		ciudad_entrega, direccion_entrega, dateresponse, cufe, qr, enviada, fecha_envio, respuesta, bolsas, tarifa_bolsas, 
		aviso_de_recibo, orden_de_compra, tipo_moneda, facturacion_contingencia, resolucion_dian, 
		respuesta_servidor_propio, response_enviada, response_consulta, consulta, costo_promedio,
		zip_key, factura_json_envio, factura_json_respuesta, cliente_requiere_factura_electronica,
		dian_nit, dian_documento, dian_valor_sin_iva)  
        (SELECT fecha, nit, sede, vence, '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', fletepor, '0.00', '0.00', '0.00', 
		'0.00', '0.00', fecha1, fecha2, fecha3, '0', bodega, estado, hora, nuevo_numero, '0.00', '0.00', '0.00', tipo, '*',
		vendedor, '0.00', ruta, ciudad, '0.00', '0.00', telefonico, nproveedor, '0.00', trasmite, 'consecutivo se deja en ceros porque se saltó',
		codigo_facturacion, codigo_sucursal, h_sistema, sucursal_origen, sucursal_cartera, usuario, fecha_sistema, factor, '0.00', '0.00', '0.00', id, '0', 
		ciudad_entrega, direccion_entrega, '.', '.', '0', enviada, fecha_envio, respuesta, bolsas, tarifa_bolsas, aviso_de_recibo, orden_de_compra, tipo_moneda,
		facturacion_contingencia, '0', respuesta_servidor_propio, '.', '.', '.', costo_promedio, zip_key, factura_json_envio, factura_json_respuesta,
		cliente_requiere_factura_electronica, dian_nit, '.', '0'  
        FROM facturac  
        WHERE numero = 'FCCP-55524');  $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '        -- Incrementar el contador           i := i + 1;       END LOO…', $q$        -- Incrementar el contador  
        i := i + 1;  
    END LOOP;  
END $$;  $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTA DE MOVIMIENTO A MOVIMIENTO', $q$INSERTA DE MOVIMIENTO A MOVIMIENTO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'insert into movimiento2025(codigo_sucursal,fecha_documento,codigo_docu…', $q$insert into movimiento2025(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,
						   nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,
						   tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema,
						   niif,valor_niif,detalle_niif,codigo_cuenta_niif,documento_niif,contabilidad_placa_vehiculo_por_defecto,
						   referencia)
						   (select m.codigo_sucursal,'2025-01-31',m.codigo_documento,m.codigo_cuenta,m.numero_documento,m.codigo_centro_costo,
						   m.nit,m.sede,m.nit_responsable,m.sede_responsable,m.codigo_departamento_interno,m.detalle,m.documento_fuente,
						   m.tipo_fuente,m.documento_banco,m.llave,m.base,m.tarifa,m.valor,m.codigo_origen,m.item,m.codigo_usuario,m.fecha_sistema,
						   m.niif,m.valor_niif,m.detalle_niif,m.codigo_cuenta_niif,m.documento_niif,m.contabilidad_placa_vehiculo_por_defecto,
						   m.referencia from movimiento2024 m where m.numero_Documento='196' and m.codigo_documento='CBA'
						   and m.fecha_documento='2024-12-31');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'INSERTAR DV SIN ITEMS EN SOLDEX MOVIMIENTO2025 insert into movimiento2…', $q$INSERTAR DV SIN ITEMS EN SOLDEX MOVIMIENTO2025
insert into movimiento2025(codigo_sucursal,fecha_documento,codigo_documento,codigo_cuenta,numero_documento,codigo_centro_costo,
						   nit,sede,nit_responsable,sede_responsable,codigo_departamento_interno,detalle,documento_fuente,
						   tipo_fuente,documento_banco,llave,base,tarifa,valor,codigo_origen,item,codigo_usuario,fecha_sistema,
						   niif,valor_niif,detalle_niif,codigo_cuenta_niif,documento_niif,contabilidad_placa_vehiculo_por_defecto,
						   referencia)
						   (select m.codigo_sucursal,m.fecha_documento,m.codigo_documento,41750500,m.numero_documento,m.codigo_centro_costo,
						   m.nit,m.sede,m.nit_responsable,m.sede_responsable,m.codigo_departamento_interno,m.detalle,m.documento_fuente,
						   m.tipo_fuente,m.documento_banco,m.llave,m.base,m.tarifa,abs(m.valor),m.codigo_origen,m.item,m.codigo_usuario,m.fecha_sistema,
						   m.niif,m.valor_niif,m.detalle_niif,m.codigo_cuenta_niif,m.documento_niif,m.contabilidad_placa_vehiculo_por_defecto,
						   m.referencia from movimiento2024 m where m.numero_Documento='217' and m.codigo_documento='DV'
						   and m.fecha_documento='2024-12-31' and codigo_cuenta=13050500 and id=13360) returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIAR CONTRASEÑA EN BASE DE DATOS', $q$CAMBIAR CONTRASEÑA EN BASE DE DATOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ALTER USER usuario WITH PASSWORD ''nueva_password''', $q$ALTER USER usuario WITH PASSWORD 'nueva_password'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CAMBIO DE RESOLUCION', $q$CAMBIO DE RESOLUCION$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select ID,resolucion,finicio,ffinal,ninicio,nfinal,numero_resolucion,l…', $q$select ID,resolucion,finicio,ffinal,ninicio,nfinal,numero_resolucion,llave_tecnica,*from consecutivo_facturas where codigo_facturacion='0002' AND id=2 and prefijo_factura='FESA-'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update consecutivo_facturas set resolucion=''18764087932962 DE ENERO 29…', $q$update consecutivo_facturas
set resolucion='18764087932962 DE ENERO 29/2025, DESDE  FESA-5001 A FESA-15000 AUTORIZA vig 24 meses',
finicio='2025-01-29',ffinal='2027-01-29',ninicio='5001',nfinal='15000',numero_resolucion='18764087932962',
llave_tecnica='790f694df220b8d8ef9fcd143fde149640554120ffd9f83309795b1a06af6da1'
where codigo_facturacion='0002' AND id=2 and prefijo_factura='FESA-'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'SUBIR NOTAS PUNTO FERRETERO', $q$SUBIR NOTAS PUNTO FERRETERO
insert into movimiento2024 
	(select codigo_sucursal, fecha, '0302', '41750104', numero, codigo_sucursal, nit, sede, nit, sede,'9999', 'Notas'  || numero||':'|| nproveedor, numero, 'C', '0','0' , valor, '0', (iva*-1)-(valor*-1), '0302', '0', 'admin'
	from notas where numero='1971' and  fecha='2024-12-11' and codigo_concepto='0004' and factura='FE-2201');
	insert into movimiento2024
	(select codigo_sucursal, fecha, '0302', '130505', numero, codigo_sucursal, nit, sede, nit, sede,'9999', 'Notas'  || numero ||':'|| nproveedor, numero, 'C', '0','0' , valor, '0', valor/-1, '0302', '0', 'admin'
	from notas where numero='1971' and  fecha='2024-12-11' and codigo_concepto='0004' and factura='FE-2201');
	insert into movimiento2024
	(select codigo_sucursal, fecha, '0302', '24080705', numero, codigo_sucursal, nit, sede, nit, sede,'9999', 'Notas'  || numero ||':'|| nproveedor, numero, 'C', '0','0' , valor, '0', iva, '0302', '0', 'admin'
	from notas where numero='1971' and  fecha='2024-12-11' and codigo_concepto='0004' and factura='FE-2201');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', '	update notas  	set  contable=''*'' 	where numero=''1971'' and  fecha=''202…', $q$	update notas 
	set  contable='*'
	where numero='1971' and  fecha='2024-12-11' and codigo_concepto='0004' and factura='FE-2201';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'INSERTAR DEVOLUCION ', $q$INSERTAR DEVOLUCION $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into dfacturac(fecha,nit,sede,vence,valor,baseg,basee,iva,descu…', $q$insert into dfacturac(fecha,nit,sede,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,desc1,desc2,desc3,fecha1,fecha2,fecha3,pedido,bodega,estado,hora,numero,
aproxima,imp01,imp02,tipo,contable,vendedor,peso,nproveedor,concepto,detalle,codigo_sucursal,usuario,fecha_sistema,imp04,impoconsumo,codigo_facturacion,valor_rete_iva,trasmite,
qr,cufe,dateresponse,enviada,fecha_envio,respuesta,concepto_nota,tarifa_iva,response_enviada,consulta,response_consulta,respuesta_servidor_propio,factor,zip_key,factura_json_envio,
factura_json_respuesta,dian_nit,dian_documento,dian_valor_sin_iva,referencia_fe,nempresa,valor_atencion)  
(select c.fecha,C.nit,C.sede,C.vence,abs(c.saldo),'0',abs(c.saldo/1.19)::numeric(15,2),abs(c.saldo*0.19),'0.00','0.00',d.fletepor,'0.00','0.00','0.00','0.00','0.00',c.fecha,c.fecha,c.fecha,f.numero,f.bodega,f.estado,
d.hora,'34','0.00','0.00','0.00',d.tipo,'.',d.vendedor,'0.00',f.nproveedor,'9999','MAYOR VALOR COBRADO',f.codigo_sucursal,f.usuario,f.fecha_sistema,d.imp04,d.impoconsumo,f.codigo_facturacion,d.valor_rete_iva,d.trasmite,
'.','.',d.dateresponse,'.',d.fecha_envio,d.respuesta,d.concepto_nota,d.tarifa_iva,'.','.',d.response_consulta,d.respuesta_servidor_propio,d.factor,d.zip_key,d.factura_json_envio,
d.factura_json_respuesta,d.dian_nit,d.dian_documento,d.dian_valor_sin_iva,d.referencia_fe,d.nempresa,d.valor_atencion 
 from dfacturac d 
 inner join cartera_clientes c on c.nit=d.nit and c.numero='DV-34' and c.fecha='2025-02-21' and c.id=59984
 inner join facturac f on d.nit=f.nit and f.numero='FEA-108'
 where d.pedido='FEA-49' and d.numero='13');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'INSERTAR FACTURAS EN FORMA PAGO insert into forma_pago (select pedido,…', $q$INSERTAR FACTURAS EN FORMA PAGO
insert into forma_pago
(select pedido,codigo_sucursal,numero,codigo_sucursal,codigo_facturacion,fecha,valor,valor,'0','0','0','0','0','0','0','0','0','0','0'
from facturac where  (numero,fecha) not in
(select  numero_factura,fecha_factura from forma_pago) and  fecha>='2025-02-01' and tipo='CO'  order by numero)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'REVISAR BASES Y GRAVADA DE 5 Y 19 , Y IVAS 5 Y 19', $q$REVISAR BASES Y GRAVADA DE 5 Y 19 , Y IVAS 5 Y 19
select 'gravada 19 total_sin_iva',sum(total_sin_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva='19'
union all
select 'gravada 5 total_sin_iva',sum(total_sin_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva='5'
union all
select 'total gravada 5 y 19',
(select sum(total_sin_iva) from itemfc where  fecha between '20250101' and '20250228' and tarifa_iva in ('19'))
       +
(select sum(total_sin_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva in ('5'))
as  total_general
union all
select 'total excentos ',sum(total_sin_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva='0'
union all
select 'iva 5 total_iva',sum(total_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva='5'
union all
select 'iva 19 total_iva',sum(total_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva='19'
union all
select 'total iva 5 y 19',
(select sum(total_iva) from itemfc where  fecha between '20250101' and '20250228' and tarifa_iva in ('19'))
       +
(select sum(total_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva in ('5'))
as  total_general
union all
select 'total',
(select sum(total_sin_iva) from itemfc where  fecha between '20250101' and '20250228' and tarifa_iva in ('19', '5', '0'))
       +
(select sum(total_iva) from itemfc where fecha between '20250101' and '20250228' and tarifa_iva in ('19', '5'))
as  total_general
union all
select 'contabilidad', sum(valor) from movimiento2025 where codigo_cuenta::text ilike'%2408%' and fecha_documento between '20250101' and '20250228'
and valor<0
union all
select 'contabilidad', sum(valor) from movimiento2025 where codigo_cuenta::text ilike'%41359%' and fecha_documento between '20250101' and '20250228'
and valor<0$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'excel', $q$excel
Cells.EntireColumn.AutoFit$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'Guia', $q$Guia
select a.codigo_grupo,g.nombre_grupo,a.codigo,a.nombre,sum(it.cantidad) as total_cantidad,a.factor_galon as factor,a.densidad,
(select sum(it2.cantidad * a2.factor_galon * a2.densidad)::numeric(15, 2) from articulo a2
inner join itemfc it2
 on a2.codigo = it2.codigo
 where a2.codigo = a.codigo
and it2.fecha between 'K1' and 'K2') as total_galones
from articulo a
inner join grupos g on a.codigo_grupo = g.codigo_grupo
inner join itemfc it on a.codigo = it.codigo
where it.fecha between 'K1' and 'K2'
group by a.codigo_grupo, a.codigo, g.nombre_grupo, a.nombre, a.factor_galon, a.densidad;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'REVISAR COSTO DIFERENTE COMPRAS INVENTARIO CONCILIACIÓN WERK', $q$REVISAR COSTO DIFERENTE COMPRAS INVENTARIO CONCILIACIÓN WERK$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select ''compras''as tipo,it.codigo,a.nombre,it.costo_real as costo,sum(…', $q$select 'compras'as tipo,it.codigo,a.nombre,it.costo_real as costo,sum(it.cantidad*it.costo_real)::numeric(15,5) as total 
from itemfc_compras it join articulo a on a.codigo=it.codigo
where it.codigo='003106100' and it.numero='WERK-500-6'
group by it.codigo,a.nombre,it.costo_real
union all
select 'costos'as tipo,l.codigo_articulo,a.nombre,l.costo_unitario,sum(l.cantidad*l.costo_unitario)::numeric(15,4)  as total 
from log_Costos l  
join articulo a on a.codigo=l.codigo_articulo
where l.codigo_articulo='003106100' and l.numero_documento='WERK-500-6'
group by codigo_articulo,a.nombre,l.costo_unitario
union all
select 'diferencia costo' as tipo,'003106100' as codigo, 'GAGL TORNILLO DRYWALL ZINCADO 6*1"' as nombre,'0' as costo,
((select sum(cantidad*costo_real)::numeric(15,5) from itemfc_compras where codigo='003106100' and numero='WERK-500-6')
       -
(select sum(cantidad*costopro_despues)::numeric(15,4)  from log_Costos  where codigo_articulo='003106100' and numero_documento='WERK-500-6'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ACTUALIZAR VALORES FACTURA CONTRA MOVIMIENTO', $q$ACTUALIZAR VALORES FACTURA CONTRA MOVIMIENTO
update movimiento2025
set valor = f.iva
from facturac f
where movimiento2025.nit = f.nit and movimiento2025.numero_documento = f.numero and f.numero = 'AF-560001'
and movimiento2025.codigo_cuenta = '24080100' and movimiento2025.id = 2303774;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update movimiento2025  set valor = f.baseg from facturac f where movim…', $q$update movimiento2025 
set valor = f.baseg
from facturac f
where movimiento2025.nit = f.nit and movimiento2025.numero_documento = f.numero and f.numero = 'AF-560001'
and movimiento2025.codigo_cuenta = '41354802' and movimiento2025.id = 2303773;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update movimiento2025  set valor = f.valor from facturac f where movim…', $q$update movimiento2025 
set valor = f.valor
from facturac f
where movimiento2025.nit = f.nit and movimiento2025.numero_documento = f.numero and f.numero = 'AF-560001'
and movimiento2025.codigo_cuenta = '13050500' and movimiento2025.id = 2303775;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'NO GENERO EL NUMERO DE AJUSTE DEL CONTEO DEL INVENTARIO', $q$NO GENERO EL NUMERO DE AJUSTE DEL CONTEO DEL INVENTARIO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from conteo0001_1', $q$select * from conteo0001_1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into facturac_ajustes (fecha,proveedor,vence,valor,baseg,basee,…', $q$insert into facturac_ajustes (fecha,proveedor,vence,valor,baseg,basee,iva,descuentos,fletes,fletepor,retencion,porrete,
desc1,desc2,desc3,fecha1,fecha2,fecha3,pedido,bodega,estado,hora,numero,aproxima,imp01,
imp02,contable,imp03,nproveedor,factor,trasmite,codigo_sucursal,detalle,h_sistema,usuario,
costo_promedio,tercero,sede,fecha_sistema,codigo_sucursal_alterna,numero_alterno,codigo_transaccion,
doc_origen,fecha_doc_origen,suc_doc_origen,bodega_destino)
(select current_date,proveedor,current_date,(select sum(valor_item) from itemfc_ajustes where numero='114379'),0
,(select sum(valor_item) from itemfc_ajustes where numero='114379'),0,descuentos,fletes,fletepor,retencion,porrete,
desc1,desc2,desc3,current_date,current_date,current_date,pedido,bodega,estado,now(),'114379',aproxima,imp01,
imp02,contable,imp03,nproveedor,factor,trasmite,codigo_sucursal,detalle,h_sistema,usuario,
costo_promedio,tercero,sede,now(),codigo_sucursal_alterna,numero_alterno,codigo_transaccion,
doc_origen,fecha_doc_origen,suc_doc_origen,bodega_destino from facturac_ajustes where numero='114336');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'insert into itemfc_ajustes(numero,codigo,cantidad,costo,valor_iva,valo…', $q$insert into itemfc_ajustes(numero,codigo,cantidad,costo,valor_iva,valor_item,otros,vr_descuento,subtotal1,subtotal2,tarifa_iva,
fecha,bodega,imp01,imp02,retencion,imp03,proveedor,costo_real,trasmite,codigo_sucursal,tipo_producto,f_sistema,costo_promedio,
pendiente,ubicacion)
(select '114379',co.codigo,co.bodega_1_c1,co.costo,0,co.bodega_1_c1*co.costo,0,0,co.costo,co.costo,0,current_date,1,0,0,
0,0,9999,co.costo,0,'0001','G',current_date,0,0,'.'
from conteo0001_1 co);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'REVISAR CUADRE', $q$REVISAR CUADRE 
select 'efectivo',sum(efectivo-devuelta) from forma_pago_electronica where fecha_factura='20250422' and usuario='sofia'
union all
select 'tarjetas', sum (valor) from caja3tarjetas where fecha_factura='20250422' and usuario='sofia'
union all
select 'bonos', sum (valor) from caja3bonos  where fecha_factura='20250422' and usuario='sofia'
union all 
select 'entregas', sum(valor*-1) from caja3entregas  where fecha='20250422'   and usuario='sofia'
union all
select'total ventas',
(select sum(efectivo-devuelta) from forma_pago_electronica where fecha_factura='20250422' and usuario='sofia')
+
(select sum (valor) from caja3tarjetas where fecha_factura='20250422' and usuario='sofia')
+
(select sum (valor) from caja3bonos  where fecha_factura='20250422' and usuario='sofia')$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'RUTA PARA EJECUTAR DOS', $q$
RUTA PARA EJECUTAR DOS
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'AÑOS DIAS MES ', $q$AÑOS DIAS MES $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT    EXTRACT(DAY FROM CURRENT_DATE) AS dia,   EXTRACT(MONTH FROM …', $q$SELECT 
  EXTRACT(DAY FROM CURRENT_DATE) AS dia,
  EXTRACT(MONTH FROM CURRENT_DATE) AS mes,
  EXTRACT(YEAR FROM CURRENT_DATE) AS año;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT    TO_CHAR(CURRENT_DATE, ''DD'') AS dia,   TO_CHAR(CURRENT_DATE, …', $q$SELECT 
  TO_CHAR(CURRENT_DATE, 'DD') AS dia,
  TO_CHAR(CURRENT_DATE, 'MM') AS mes,
  TO_CHAR(CURRENT_DATE, 'YYYY') AS año;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '  SELECT    date_part(''day'', CURRENT_DATE) AS dia,   date_part(''month''…', $q$  SELECT 
  date_part('day', CURRENT_DATE) AS dia,
  date_part('month', CURRENT_DATE) AS mes,
  date_part('year', CURRENT_DATE) AS año;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SELECT   DATE_TRUNC(''day'', CURRENT_DATE)::date AS solo_dia,   DATE_TRU…', $q$SELECT
  DATE_TRUNC('day', CURRENT_DATE)::date AS solo_dia,
  DATE_TRUNC('month', CURRENT_DATE)::date AS inicio_mes,
  DATE_TRUNC('year', CURRENT_DATE)::date AS inicio_año;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Zona horaria', $q$Zona horaria$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SHOW TIMEZONE;  ALTER DATABASE nombre_base_datos SET timezone TO ''Amer…', $q$SHOW TIMEZONE; 
ALTER DATABASE nombre_base_datos SET timezone TO 'America/Bogota';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'sumar cantidades vendidas', $q$sumar cantidades vendidas$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'SELECT * FROM (     -- Detalles de cada ítem     SELECT          i.fec…', $q$SELECT * FROM (
    -- Detalles de cada ítem
    SELECT 
        i.fecha, 
        i.numero, 
        a.nombre, 
        i.cantidad,
        a.codigo,
        1 as orden,
        a.codigo as codigo_orden -- Para ordenar por código
    FROM itemfc i
    JOIN articulo a ON a.codigo = i.codigo 
    WHERE i.fecha BETWEEN '20250501' AND '20250514'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '    UNION ALL', $q$    UNION ALL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '    -- Subtotales por código     SELECT          NULL as fecha,       …', $q$    -- Subtotales por código
    SELECT 
        NULL as fecha, 
        NULL as numero, 
        'total_vendida ', 
        SUM(i.cantidad) as cantidad,
        a.codigo,
        2 as orden,
        a.codigo as codigo_orden
    FROM itemfc i
    JOIN articulo a ON a.codigo = i.codigo 
    WHERE i.fecha BETWEEN '20250501' AND '20250514'
    GROUP BY a.codigo$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '    UNION ALL', $q$    UNION ALL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '    -- Total general     SELECT          NULL as fecha,          NULL …', $q$    -- Total general
    SELECT 
        NULL as fecha, 
        NULL as numero, 
        'TOTAL GENERAL' as nombre, 
        SUM(i.cantidad) as cantidad,
        NULL as codigo,
        3 as orden,
        'null' as codigo_orden -- Para que aparezca al final
    FROM itemfc i
    WHERE i.fecha BETWEEN '20250501' AND '20250514'
) as datos_ordenados
ORDER BY 
    codigo_orden,
    orden,
    fecha,
    numero$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CREDENCIALES CARPETAS COMPARTIDAS PLAZA', $q$CREDENCIALES CARPETAS COMPARTIDAS PLAZA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'a pedir credenciales de carpeta compartida de plaza campesina', $q$a pedir credenciales de carpeta compartida de plaza campesina
\\192.168.1.221\jaivana
Usuario : userplaza
Contraseña : p4r43ntr4r$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'TABLAS PARA CREAR CONSULTAS EN PINTUNAL', $q$TABLAS PARA CREAR CONSULTAS EN PINTUNAL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from log_costos where codigo_articulo=''82-102'' select * from …', $q$select * from log_costos where codigo_articulo='82-102'
select * from produccion_fichas limit 1
select * from produccion_formulaciones limit 1
select * from produccion_formulas_productos limit 1
select * from produccion_formulas_versiones
select * from produccion_etapas
select * from produccion_calidad_especificaciones_producto limit 1
select * from produccion_fichas_ajustes
select * from produccion_calidad_parametros
select * from produccion_fichas_calidad limit 1
select * from produccion_fichas_etapas limit 1
select * from produccion_fichas_conceptos limit 1
select * from actividades_configuracion limit 1
select * from procesos limit 1
select * from procesos_configuracion limit 1
select * from produccion_fichas_items_ajustes limit 1
select * from produccion_fichas where lote='2025-008924' 
select * from produccion_fichas_items_ajustes where articulo_id in(365105,365249)
select * from produccion_fichas_ajustes order by id desc limit 1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', '--Obtener el nombre de la secuencia (si no lo conoces): select  pg_get…', $q$--Obtener el nombre de la secuencia (si no lo conoces):
select  pg_get_serial_sequence('articulos_impuestos', 'id');
--Obtener el valor actual de la secuencia:
select  last_value from  public.articulos_impuestos_id_seq;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'cambiar cuenta terceros todos los meses unoa galeria', $q$cambiar cuenta terceros todos los meses unoa galeria
select * from movimiento2025 where nit in('30284381','10201104','25095923','75080615','24315039','1053840597',
'71776019','10223855','10225364','30296801','700017572','75095659','75085623','3359228','6282232','40761093','24758475',
'1136059229','10253459','12746962','24317631','1036631056','3359737','1053868627','30233176')
and fecha_documento>=date_trunc('month',current_date - interval '1 month') 
and fecha_documento< date_trunc('month',current_date) and codigo_cuenta=14350506$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Contabilidad', 'update movimiento2025 set codigo_cuenta=14350508 where nit in(''3028438…', $q$update movimiento2025
set codigo_cuenta=14350508
where nit in('30284381','10201104','25095923','75080615','24315039','1053840597',
'71776019','10223855','10225364','30296801','700017572','75095659','75085623','3359228','6282232','40761093','24758475',
'1136059229','10253459','12746962','24317631','1036631056','3359737','1053868627','30233176')
and fecha_documento>=date_trunc('month',current_date - interval '1 month') 
and fecha_documento< date_trunc('month',current_date) and codigo_cuenta=14350506$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'QUE ARTICULOS ESTAN EN UNA CLASE EQUIVOCADA', $q$QUE ARTICULOS ESTAN EN UNA CLASE EQUIVOCADA
select a.codigo,a.clase_de_producto,a.viva,codigo_tipo_producto,a.exento,a.excluido,a.gravado 
from articulo a 
where clase_de_producto='CVG' and exento='S'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'ENCVIAR FACTURAS CON IMPUESTOS', $q$ENCVIAR FACTURAS CON IMPUESTOS$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'UPDATE facturac f SET     valor = it.valor,     iva = it.iva,     base…', $q$UPDATE facturac f
SET
    valor = it.valor,
    iva = it.iva,
    baseg = it.baseg,
    basee = it.basee,
    fecha = current_date,
    enviada = '.'
FROM (
    SELECT
        it.nit,
        it.numero,
         COALESCE(SUM(it.total_sin_iva) FILTER (WHERE it.tarifa_iva > 0 ), 0) AS baseg,
        SUM(it.total_iva) AS iva,
        COALESCE(SUM(it.total_sin_iva) FILTER (WHERE it.tarifa_iva > 0), 0)::numeric
        + SUM(it.total_iva)::numeric
        - COALESCE(fi.total_impuestos, 0)::numeric
        + COALESCE(SUM(it.total_sin_iva) FILTER (WHERE it.tarifa_iva = 0), 0)::numeric AS valor,
        COALESCE(SUM(it.total_sin_iva) FILTER (WHERE it.tarifa_iva = 0), 0) AS basee
    FROM itemfc it
    LEFT JOIN (
        SELECT
            numero_factura,
            SUM(valor) AS total_impuestos
        FROM facturac_impuestos
        GROUP BY numero_factura
    ) fi ON it.numero = fi.numero_factura
    WHERE it.numero IN ('FCR-52')
    GROUP BY it.numero, it.nit, fi.total_impuestos
) AS it
WHERE f.numero = it.numero
  AND f.nit = it.nit;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--ejecutar para enviar  update facturac set fecha=current_date where  …', $q$--ejecutar para enviar 
update facturac
set fecha=current_date
where  numero in ()$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update itemfc set fecha=current_date where  numero in ()', $q$update itemfc
set fecha=current_date
where  numero in ()$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', '--ejecutar despues de ser enviadas update facturac set fecha=cast(fech…', $q$--ejecutar despues de ser enviadas
update facturac
set fecha=cast(fecha_sistema as date)
where  numero in ()$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'update itemfc it set fecha=cast(f.fecha_sistema as date) from facturac…', $q$update itemfc it
set fecha=cast(f.fecha_sistema as date)
from facturac f
where f.numero=it.numero
and f.nit=it.nit
and f.sede=it.sede
and f.numero in ();$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'UPDATE facturac f
SET valor = it.valor_total,iva = it.iva,baseg = it.b…', $q$UPDATE facturac f
SET valor = it.valor_total,iva = it.iva,baseg = it.baseg,basee = it.basee,fecha = current_date,enviada = '.'
FROM (
 SELECT it.nit,it.numero,
        COALESCE(
            (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '19')
          + (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '5')
        , 0) AS baseg,        -- IVA
        COALESCE(
            (SELECT SUM(subtotal1 * cantidad * 0.19)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '19')
          + (SELECT SUM(subtotal1 * cantidad * 0.05)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '5')
        , 0) AS iva,        -- Base exenta
        COALESCE(
            (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '0')
        , 0) AS basee,        -- Valor total incluyendo BOLSAS y otros impuestos
        COALESCE(
            (SELECT SUM(subtotal1 * cantidad * 0.19)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '19')
          + (SELECT SUM(subtotal1 * cantidad * 0.05)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '5')
          + (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '19')
          + (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '5')
          + (SELECT SUM(subtotal1 * cantidad)::numeric(15,2)
             FROM itemfc
             WHERE numero = it.numero AND cantidad > 0 AND tarifa_iva = '0')
          + (SELECT SUM(BOLSAS * TARIFA_BOLSAS)::numeric(15,2)
             FROM facturac
             WHERE numero = it.numero)
        , 0) AS valor_total
    FROM itemfc it
    WHERE it.numero = 'MZLB-4511'
    GROUP BY it.numero, it.nit
) AS it
WHERE f.numero = it.numero AND f.nit = it.nit;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select l.sucursal,l.bodega,l.tipo,l.numero_documento,l.fecha_documento…', $q$select l.sucursal,l.bodega,l.tipo,l.numero_documento,l.fecha_documento,l.codigo_articulo, a.nombre as nombre_articulo, l.costo_unitario as valor_documento,l.costopro_despues as costo_real,l.cantidad, (i.total_sin_iva-i.costo) as utilidad, f.nproveedor as ncliente, f.vendedor 
from log_costos l, facturac f, itemfc i, articulo a 
where (l.fecha_documento between 'K1' and 'K2') and l.tipo='V' and i.numero=f.numero and i.numero=l.numero_documento and l.codigo_articulo=i.codigo and l.codigo_articulo=a.codigo
order by l.bodega,l.tipo,l.fecha_documento,l.numero_documento,l.codigo_articulo$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'como hacer una copia de seguridad en postgresql', $q$como hacer una copia de seguridad en postgresql$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CMD COMO ADMINISTRADOR', $q$CMD COMO ADMINISTRADOR$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Ruta: C:\Program Files\PostgreSQL\11\BIN', $q$Ruta: C:\Program Files\PostgreSQL\11\BIN
Comandos para generar la copia pg_dump -U posgres -h localhost prestamos_db> C:\Users\JamesGrisales\Desktop\ prestamos_db.sql$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'Restaurarla', $q$Restaurarla
C:\Program Files\PostgreSQL\11\BIN>psql -U postgres pos < nombre.sql$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'CALCULAR DIGITO DE VERIFICACION', $q$CALCULAR DIGITO DE VERIFICACION 
--validar los diferentes
SELECT verifica,*
FROM (
    SELECT 
        public.calcular_digito_verificacion(nit) AS digito_verificacion,
        n.*
    FROM nitsx_sedes n
    WHERE estado = 'A'
) t
WHERE t.verifica::integer <> t.digito_verificacion;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', '--actualizar	 UPDATE nitsx_sedes SET verifica = public.calcular_digito…', $q$--actualizar	
UPDATE nitsx_sedes
SET verifica = public.calcular_digito_verificacion(nit)
WHERE estado = 'A'
AND verifica::integer <> public.calcular_digito_verificacion(nit);$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CUANDO SE INSERTA UNA TRANSACCIÓN POR JAIVANA', $q$CUANDO SE INSERTA UNA TRANSACCIÓN POR JAIVANA 
update tmp_auxiliar_costo_wras_20250930111233
set costo_unificado_antes=costopro_antes,costo_unificado_despues=costopro_despues,
saldo_antes_uni=saldo_antes,saldo_despues_uni=saldo_despues,valor_flete=0,saldo_total_antes=253,
saldo_total_despues=254,costopro_antes_uni=0,costopro_despues_uni=0
where numero_documento='155604' and afecta='S';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'RETORNAR RESERVA', $q$RETORNAR RESERVA$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,a.saldo25,ubi…', $q$select wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,a.saldo25,ubi.cantidad as cantidad_ubicacion, 
sum(wms.cantidad) as cantidad_reservada,a.saldo25-ubi.cantidad as dife
from wms_items_pedidos_reservados_25 wms
join wms_nuevo_ubicaciones_cantidades ubi on wms.codigo_articulo=ubi.codigo and wms.codigo_ubicacion=ubi.ubicacion_codigo
and wms.id_ubicaciones_cantidades=ubi.id
join articulo a on a.id=ubi.codigo_id  
where wms.codigo_ubicacion='wms-0111-25-1-1-1' and wms.estado='R' 
and wms.codigo_articulo in ('074060045','074706035','007080100','024040116','074706050','007100116','128100160',
'041160116','107000016','107000020','170051217','170051240','170051626','170051635','170051621','128100120',
'128100200','128220255','170051015','170051018','170052132','041160108','104000016') and wms.pedido in ('6860947','6840662')
group by wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,ubi.ubicacion_codigo,ubi.codigo,ubi.cantidad,a.saldo25$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select ''reserva'' as detalle,codigo_articulo,sum(cantidad) from wms_ite…', $q$select 'reserva' as detalle,codigo_articulo,sum(cantidad) from wms_items_pedidos_reservados_a1 where codigo_articulo='812027320'
and estado='R' group by codigo_articulo
union all
select 'ubicacion'as detalle,codigo,sum(cantidad) from wms_nuevo_ubicaciones_cantidades where codigo='812027320' and bodega='a1'
group by codigo
union all
select 'saldo bodega'as detalle, codigo,saldoa1 from articulo where codigo = '812027320'
union all
select 'dife' as detalle,'812027320' as codigo,
((select sum(cantidad)::numeric(15,2) from wms_nuevo_ubicaciones_cantidades where codigo='812027320' and bodega='a1' )
-
(select  saldoa1::numeric(15,2) from articulo where codigo='812027320'))$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'update  wms_nuevo_ubicaciones_cantidades ubi set cantidad = ubi.cantid…', $q$update  wms_nuevo_ubicaciones_cantidades ubi
set cantidad = ubi.cantidad + sub.cantidad_reservada
from  (
    select  
        wms.codigo_articulo,
        wms.codigo_ubicacion,
        wms.id_ubicaciones_cantidades,
        sum(wms.cantidad) as cantidad_reservada
    from  wms_items_pedidos_reservados_25 wms
    where wms.codigo_ubicacion = 'wms-0111-25-1-1-1'
      and wms.estado = 'R'
      and wms.codigo_articulo in (
        '074060045','074706035','007080100','024040116','074706050','007100116','128100160',
        '041160116','107000016','107000020','170051217','170051240','170051626','170051635','170051621',
        '128100120','128100200','128220255','170051015','170051018','170052132','041160108','104000016'
      )
      and wms.pedido in ('6860947','6840662')
    group by 
        wms.codigo_articulo,
        wms.codigo_ubicacion,
        wms.id_ubicaciones_cantidades
) sub
where ubi.codigo = sub.codigo_articulo
  and ubi.ubicacion_codigo = sub.codigo_ubicacion
  and ubi.id = sub.id_ubicaciones_cantidades;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from wms_items_pedidos_reservados_25 where pedido in (''686094…', $q$select * from wms_items_pedidos_reservados_25 where pedido in ('6860947','6840662') and estado='R'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update wms_items_pedidos_reservados_25 set estado=''X'' where pedido in …', $q$update wms_items_pedidos_reservados_25
set estado='X'
where pedido in ('6860947','6840662') and estado='R';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CUANDO LOS PEDIDOS QUEDAN EN PUNTO EN ESTADO WMS', $q$CUANDO LOS PEDIDOS QUEDAN EN PUNTO EN ESTADO WMS 
update pedidos
set estado_real='00',estado_inventario='04'
where numero in(6710442,6710451,6710453,6710455,6710476,6711821)returning numero,estado_real,estado_inventario;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'update items_pedidos  set estado_real=''00''  where numero  in(6710442,6…', $q$update items_pedidos 
set estado_real='00' 
where numero  in(6710442,6710451,6710453,6710455,6710476,6711821) returning numero,estado_real;
bodega diferente$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'update items_pedidos set codigo_bodega=''a1'' where numero=6897714 and c…', $q$update items_pedidos
set codigo_bodega='a1'
where numero=6897714 and codigo_bodega='25' and id in (35941901,35941902) 
returning;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'REMISION EN CERO', $q$REMISION EN CERO$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select pedido,estado,* from facturac_remision where numero=''285269'' an…', $q$select pedido,estado,* from facturac_remision where numero='285269' and fecha='2026-03-27'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from facturac_remision where pedido=6915103', $q$select * from facturac_remision where pedido=6915103$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select cantidad,auxiliar,reservado,reservado_conteo,* from items_pedid…', $q$select cantidad,auxiliar,reservado,reservado_conteo,* from items_pedidos where numero=6915103$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from wms_nuevo_ubicaciones_cantidades where codigo in (''83700…', $q$select * from wms_nuevo_ubicaciones_cantidades where codigo in ('837006166','0000058095') and bodega='4'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from wms_items_pedidos_reservados_4 where codigo_articulo in …', $q$select * from wms_items_pedidos_reservados_4 where codigo_articulo in ('837006166','0000058095') and pedido='6915103'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,a.saldo4,ubi.…', $q$select wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,a.saldo4,ubi.cantidad as cantidad_ubicacion, 
sum(wms.cantidad) as cantidad_reservada,a.saldo4-ubi.cantidad as pendiente
from wms_items_pedidos_reservados_4 wms
join wms_nuevo_ubicaciones_cantidades ubi on wms.codigo_articulo=ubi.codigo and wms.codigo_ubicacion=ubi.ubicacion_codigo
and wms.id_ubicaciones_cantidades=ubi.id
join articulo a on a.id=ubi.codigo_id  
where wms.codigo_ubicacion='wms-0107-4-1-1-1' 
and wms.codigo_articulo in ('837006166','0000058095') and wms.pedido in ('6915103')
group by wms.codigo_articulo,a.nombre,wms.codigo_ubicacion,ubi.ubicacion_codigo,ubi.codigo,ubi.cantidad,a.saldo4$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select pedido,estado,* from facturac_remision where numero=''285269'' an…', $q$select pedido,estado,* from facturac_remision where numero='285269' and fecha='2026-03-27'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select estado_real,id,* from items_pedidos where numero=6915103  and i…', $q$select estado_real,id,* from items_pedidos where numero=6915103  and id=8187559$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'update pedidos set estado=''A'' where numero=6915103 and nit=''901045125''…', $q$update pedidos
set estado='A'
where numero=6915103 and nit='901045125' and id=8187559$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'UPDATE facturac_remision SET estado=''X'' where pedido=6915103 and fecha…', $q$UPDATE facturac_remision
SET estado='X'
where pedido=6915103 and fecha='2026-03-27' and numero='285269';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'update wms_items_pedidos_reservados_4 set estado=''R'' where pedido=6915…', $q$update wms_items_pedidos_reservados_4
set estado='R'
where pedido=6915103 and estado='F';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'INSERTAR FACTURA EXPRTACION insert into facturas_exportacion (select n…', $q$INSERTAR FACTURA EXPRTACION
insert into facturas_exportacion
(select numero,codigo_facturacion,factor,'.','.','.',0,0,0 from facturac  where numero in ('AN-563409','AN-563410'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'UPDATE secciones_jdesk  SET estado = ''I'' WHERE padre_id IS NULL AND no…', $q$UPDATE secciones_jdesk 
SET estado = 'I'
WHERE padre_id IS NULL
AND nombre IN ('Procesos', 'Inventario', 'Integraciones', 'Producción', 'Administración WMS', 'Desarrollo', 'Compras', 'Servicios Logísticos') returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'ACTUALIZAR COSTO DE BODEGAS ', $q$ACTUALIZAR COSTO DE BODEGAS $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'WITH costos AS (', $q$WITH costos AS (
select  distinct on  (codigo_articulo)codigo_articulo,costo_unitario
from  log_costos where bodega = '5' 
and costo_unitario <> 0
and codigo_articulo IN (
          select codigo 
          from articulo 
          where estado = 'A'
          and costo_pro_5 = 0
          and saldo5 <> 0
          and costo <> 0
      )
order by codigo_articulo, fecha_documento desc  
)
update articulo a
set costo_pro_5 = c.costo_unitario
from costos c
where a.codigo = c.codigo_articulo returning  a.codigo,a.costo_pro_5;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'https://gestionhumana.jaivanaweb.co/
usuario: jgrisales@jaivana.co
clave: james0123', $q$https://gestionhumana.jaivanaweb.co/
usuario: jgrisales@jaivana.co
clave: james0123
DISM /Online /Cleanup-Image /RestoreHealth$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'flyway', $q$flyway
16:16
https://www.liquibase.org/
liquibase.com
Liquibase Community
Join the Liquibase community to connect, learn, and contribute to the evolution of database change management. (10 kB)$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'Cuando no se auto complete la informacion', $q$Cuando no se auto complete la informacion
Revisar estos campos 
0
update nitsx_sedes set   tarifa_iva_preferencial_origen='0', tarifa_iva_preferencial_destino='0'
where tarifa_iva_preferencial_origen is  null$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Terceros, proveedores y cartera', 'ADICIONAR PORDUCTOS EN WA', $q$ADICIONAR PORDUCTOS EN WA
insert into wa_centros_materiales_distribucion (nit, bodega_destino, bodega_origen, codigo_producto,
unidad_producto, cantidad_minima_pedir, cantidad_empaque,frecuencia, lead_time, descripcion_articulo, nit_proveedor)
select  nuevos_wa.nit,nuevos_wa.bodega_destino,nuevos_wa.bodega_origen,v.codigo_producto,
nuevos_wa.unidad_producto,nuevos_wa.cantidad_minima_pedir,nuevos_wa.cantidad_empaque,
nuevos_wa.frecuencia,nuevos_wa.lead_time,v.descripcion_articulo,nuevos_wa.nit_proveedor
from  wa_centros_materiales_distribucion nuevos_wa
cross join (
values('867003816', 'SUMO CHAQUETA VAQUETA CON BROCHE EN EL PUÑO T-M'),
      ('867003818', 'SUMO CHAQUETA VAQUETA CON BROCHE EN EL PUÑO T-L'),
      ('867003820', 'SUMO CHAQUETA VAQUETA CON BROCHE EN EL PUÑO T-XL')) as v(codigo_producto, descripcion_articulo)
where nuevos_wa.nit = '900448113'and nuevos_wa.bodega_destino = 'r8' and nuevos_wa.id = 4616300 returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select distinct wms.id,wms.codigo_articulo,wms.pedido,wms.cantidad as …', $q$select distinct wms.id,wms.codigo_articulo,wms.pedido,wms.cantidad as cantidad_reservada,
a.saldo25 as saldo_escritorio,ub.cantidad as saldo_web, p.estado, p.estado_real
from wms_items_pedidos_reservados_25 wms
join items_pedidos it on wms.pedido=it.numero
join pedidos p on it.numero=p.numero
join articulo a on wms.codigo_articulo=a.codigo
join wms_nuevo_ubicaciones_cantidades ub on a.codigo=ub.codigo
where wms.codigo_articulo='170051217'  and wms.estado='R' and  ub.ubicacion_codigo='wms-0111-25-1-1-1'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Inventario, artículos y cajas', 'select * from wms_items_pedidos_reservados_25 where codigo_articulo=''2…', $q$select * from wms_items_pedidos_reservados_25 where codigo_articulo='208080040'  and estado='R'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'select * from wms_nuevo_ubicaciones_cantidades where codigo=''208080040…', $q$select * from wms_nuevo_ubicaciones_cantidades where codigo='208080040' and ubicacion_codigo='wms-0111-25-1-1-1'$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'select * from sucursales_email_facturacion 11:36 todo debe estar en 1', $q$select * from sucursales_email_facturacion
11:36
todo debe estar en 1$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'ENVIAR ACEPTACION DIAN', $q$ENVIAR ACEPTACION DIAN
select concat('http://direcciongeneral.sumatec.jaivana.co:7020/api/eventos/v1/validar_eventos_docrecibido/',cufe) as estado_aceptacion_dian
from documentos_recibidos where  estado_acuse_dian='a' and estado_recibo_dian='a' and estado_aceptacion_dian='p' 
and fecha_documento>='20250801' order by fecha_documento desc$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'CUANDO NO SE DEJA VISUALIZAR LAS LLAVES TECNICAS', $q$CUANDO NO SE DEJA VISUALIZAR LAS LLAVES TECNICAS
se debe de revisar las siguientes propiedades  $q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'se debe de revisar en la tabla de configuración_xml estas dos propiedades', $q$se debe de revisar en la tabla de configuración_xml estas dos propiedades
deben de estar valor en S
maneja_facturacion_electronica, maneja_facturacion_electronica_propia,
y en la tabla empresa maneja_facturacion_electronica, esta propiedad debe de estar en S$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Facturación electrónica y DIAN', 'configurar sucursal completa', $q$configurar sucursal completa
--sucursal
insert into sucursales(codigo_sucursal,codigo_ciudad,nombre,direccion,telefonos,estado,dias_entrega,
dias_validez,cupo,porcentaje,pricing_mostrador_id,pricing_credito_id,alias1,codigo_facturacion_pedidos,
bodega,cajas,ip,bdatos,tipo,alias,ciudad_id,bodega_id,estadoactivo_id)
(select '0102',codigo_ciudad,'LEKAMP CONSIGNACIONES',direccion,telefonos,estado,dias_entrega,
dias_validez,cupo,porcentaje,pricing_mostrador_id,pricing_credito_id,alias1,codigo_facturacion_pedidos,
'2',cajas,ip,bdatos,tipo,alias,ciudad_id,bodega_id,estadoactivo_id from sucursales where codigo_sucursal='0101')returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--centro de costo', $q$--centro de costo$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'insert into centros_costo(codigo_centro_costo,nombre,estado,estadoacti…', $q$insert into centros_costo(codigo_centro_costo,nombre,estado,estadoactivo_id)
(select '0102','CONSIGNACIONES',estado,estadoactivo_id from centros_costo where codigo_centro_costo='0101') returning *;$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--insertar datos en sucursales_documentos en cero insert into sucursal…', $q$--insertar datos en sucursales_documentos en cero
insert into sucursales_documentos(codigo_documento,codigo_sucursal,numero,formato_documento,modificable,copia,estado,estadoactivo_id)
(select codigo_documento,'0102',0,formato_documento,modificable,copia,estado,estadoactivo_id
 from sucursales_documentos  where codigo_sucursal='0101');$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '-- insertar datos en consecutivos insert into consecutivos(codigo_cons…', $q$-- insertar datos en consecutivos
insert into consecutivos(codigo_consecutivo,detalle,numero,codigo_sucursal,codigo,estadoactivo_id)
(select codigo_consecutivo,detalle,0,'0102',codigo,estadoactivo_id 
 from consecutivos where codigo_sucursal='0101' and detalle not in ('ordenes de compra'));$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', '--inserta configuracion copiarlos de las 0101 insert into configuracio…', $q$--inserta configuracion copiarlos de las 0101
insert into configuracion_xml (sucursal, categoria, propiedad, valor,fecha_modificacion)
select  '0102' AS sucursal,categoria,propiedad,replace(valor, '0101', '0102') AS valor,current_timestamp
from  configuracion_xml where sucursal = '0101';$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Apuntes sueltos Jaivaná', 'SEGUMIENDO TABLE PRCEDIMIENTOS CON LIQUIBASE', $q$SEGUMIENDO TABLE PRCEDIMIENTOS CON LIQUIBASE 
select * from DATABASECHANGELOG$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Liquibase — control de versiones de BD', '✅ PASO 1 — Generar el changeLog inicial', $q$Para sacar la copia de la base de datos con liquibase
liquibase --defaultsFile=liquibase.properties --changeLogFile=logs/ddl/db.initial_database.postgresql.sql generateChangeLog
Esto crea un archivo con toda la estructura actual de tu base de datos.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Liquibase — control de versiones de BD', '✅ PASO 2 — MARCARLO COMO EJECUTADO (SIN EJECUTARLO)', $q$Este paso es el que hace que Liquibase lo considere como inicial.
Debes usar:
liquibase --defaultsFile=liquibase.properties --changeLogFile=logs/ddl/db.initial_database.postgresql.sql changelogSync
liquibase clear-checksums
liquibase update
liquibase updateSQL$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Liquibase — control de versiones de BD', 'Ejemplo real para que un changeset SOLO se ejecute en la base db_clientes', $q$master.xml
<changeSet id="2861.20250805.q_jdesk_herramientas_usuarios.formulario331"
           author="jgrisales"
           runOnChange="false">
    <preConditions onFail="MARK_RAN" onError="HALT">
        <!-- Garantiza que es PostgreSQL -->
        <dbms type="postgresql"/>
        <!-- Condición para ejecutar SOLO si la base es db_clientes -->
        <sqlCheck expectedResult="1">
            SELECT CASE WHEN current_database() = 'db_clientes' THEN 1 ELSE 0 END;
        </sqlCheck>
    </preConditions>
    <sqlFile 
        path="changelogs/changelogs_9.5/2861.20250805.q_jdesk_herramientas_usuarios.formulario331.sql" 
        relativeToChangelogFile="true"/>
</changeSet>$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Liquibase — control de versiones de BD', '🔍 ¿Qué está haciendo esto?', $q$✔ Liquibase se conecta a la base (por el .properties)
Por ejemplo:
url=jdbc:postgresql://192.168.1.50:5432/db_tienda_maria
Entonces la base activa es:
➡️ db_tienda_maria
✔ Liquibase evalúa la preCondition
Ejecuta:
SELECT CASE WHEN current_database() = 'db_clientes' THEN 1 ELSE 0 END;
Si la base es db_clientes → devuelve 1 → Liquibase ejecuta el script.
Si la base NO es db_clientes → devuelve 0 → Liquibase marca el changeset como ejecutado (MARK_RAN) y continúa.$q$);
INSERT INTO jaivana_notas (categoria, titulo, contenido) VALUES ('Liquibase — control de versiones de BD', '🎯 Resultado EXACTO que buscabas', $q$Puedes tener el mismo script en todos los masters.
Liquibase lo reconoce, pero solo lo ejecuta donde debe.
No hay errores.
No bloquea la secuencia.
No se re-ejecuta en clientes donde no aplica.
CMD (Admin):
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew
Reinicia PC si pide.
2. Comprobar velocidad negociada:
wmic nic where (NetEnabled=true) get Name,Speed
Ping y traceroute:
ping -n 20 8.8.8.8
tracert google.com
pathping google.com
reiniciar la laquinas
sudo systemctl restart xrdp
commandos ubuntu
mkdir crear carpetas
touch crear achivos
APRENDIENDO A CREAR FUNCINES DISPARADORES
create or replace function precio_venta()
returns trigger as $precio_venta$
declare
begin
-- calcular el precio venta
  new.precio_venta:=new.precio_compra*1.3;
  return new;
  end;
$precio_venta$ language plpgsql;
create trigger precio_venta 
before insert or update
on autos for each row
execute procedure precio_venta();
inserter consultas nuevo AÑO
insert into consultas (titulo,query,tipo,usuario,usuarios_autorizados)
select 
    replace(titulo, '2025', '2026') AS titulo,
    replace(query, 'movimiento2025','movimiento2026') AS query,
    tipo,usuario, usuarios_autorizados
from  consultas where  titulo ilike '%2025%' and  query ilike '%movimiento2025%';
insert into consultas (titulo,query,tipo,usuario,usuarios_autorizados)
select 
    replace(titulo, '2025', '2026') AS titulo,
    replace(
        replace(
            replace(
                replace(
                    replace(
                        replace(query,
                            'movimiento2025', 'movimiento2026'
                        ),
                        'MOVIMIENTO2025', 'MOVIMIENTO2026'
                    ),
                    'ventas2025', 'ventas2026'
                ),
                'VENTAS2025', 'VENTAS2026'
            ),
            'resumen2025', 'resumen2026'
        ),
        'RESUMEN2025', 'RESUMEN2026'
    ) as query,
    tipo,usuario, usuarios_autorizados
from  consultas where  titulo ilike '%2025%' 
and (query ilike '%movimiento2025%'
     or query ilike '%ventas2025%'
     or query ilike '%resumen2025%');
function 
CREATE OR REPLACE FUNCTION duplicar_consultas_por_anio(
    anio_origen INTEGER,
    anio_destino INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO consultas (titulo, query, tipo, usuario, usuarios_autorizados)
    SELECT 
        REPLACE(titulo, anio_origen::TEXT, anio_destino::TEXT) AS titulo,
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(query,
                                'movimiento' || anio_origen, 'movimiento' || anio_destino
                            ),
                            'MOVIMIENTO' || anio_origen, 'MOVIMIENTO' || anio_destino
                        ),
                        'ventas' || anio_origen, 'ventas' || anio_destino
                    ),
                    'VENTAS' || anio_origen, 'VENTAS' || anio_destino
                ),
                'resumen' || anio_origen, 'resumen' || anio_destino
            ),
            'RESUMEN' || anio_origen, 'RESUMEN' || anio_destino
        ) AS query,
        tipo,
        usuario,
        usuarios_autorizados
    FROM consultas
    WHERE titulo ILIKE '%' || anio_origen || '%'
      AND (
            query ILIKE '%movimiento' || anio_origen || '%'
         OR query ILIKE '%ventas' || anio_origen || '%'
         OR query ILIKE '%resumen' || anio_origen || '%'
      );
END;
$$;
SELECT duplicar_consultas_por_anio(2025, 2026);
ACTIVAR WINDOWS
slmgr -rearm
update cartera_clientes
set saldo=saldo-196006,texto=concat(texto,'. abono 196,006 CR. ')
where nit='9728950' and numero='23855' returning *;
insert into cartera_clientes 
(codigo_sucursal,numero,fecha,vence,valor,saldo,texto,nit,sede,usuario,contable)
(select codigo_sucursal,'25119','2025-10-23','2025-11-18',656000,0,'25119. abono 656,000 CR. ',nit,sede,usuario,contable
from cartera_clientes  where nit='9728950' and numero='23855')
with ventas as (
    select codigo,sum(cantidad) as cantidad_vendida,
    sum(precio_lista * cantidad)::numeric(15,2) as total_venta,max(fecha) as fecha_ultima_venta
    from itemfc
    group by codigo
),
compras as (
    select  codigo, sum(cantidad) as cantidad_comprada, sum(costo * cantidad)::numeric(15,2) as total_compra,
     max(fecha) as fecha_ultima_compra
     from itemfc_compras
    group by codigo
)
select 
    a.codigo,
    a.nombre,
    a.saldo1 as saldo_actual,
    c.cantidad_comprada,
    v.cantidad_vendida,
    (v.cantidad_vendida - c.cantidad_comprada) as diferencia_cantidad,
    case 
        when v.cantidad_vendida < c.cantidad_comprada then 'vendio menos unidades'
        else 'vendio igual o mas unidades'
    end as comparacion_cantidad,
    c.total_compra as costo_total,
    v.total_venta as venta_total,
    (c.total_compra / c.cantidad_comprada)::numeric(15,2) as costo_unitario,
    (v.cantidad_vendida * (c.total_compra / c.cantidad_comprada))::numeric(15,2) as costo_vendido,
    -- rentabilidad sobre lo vendido
    (v.total_venta - (v.cantidad_vendida * (c.total_compra / c.cantidad_comprada)))::numeric(15,2) as rentabilidad_valor,
    -- rentabilidad en porcentaje con %
    concat(
        case 
            when v.cantidad_vendida = 0 then 0::numeric(15,2)
            else ((v.total_venta - (v.cantidad_vendida * (c.total_compra / c.cantidad_comprada))) 
                  / (v.cantidad_vendida * (c.total_compra / c.cantidad_comprada)) * 100)::numeric(15,2)
        end,
        '%'
    ) as rentabilidad_porcentaje,
    case 
        when v.total_venta - (v.cantidad_vendida * (c.total_compra / c.cantidad_comprada)) < 0 
        then 'vendio mas barato de lo que costo'
        else 'vendio con ganancia'
    end as resultado_precio,
    v.fecha_ultima_venta,
    c.fecha_ultima_compra
from articulo a
inner join ventas v on v.codigo = a.codigo
inner join compras c on c.codigo = a.codigo
order by a.codigo;.
J15318821j**
SABER EL ULTIMO NUMERO DE FACTURA
SELECT DISTINCT ON (prefijo)numero,fecha,prefijo
FROM (
    SELECT 
        numero,
        fecha,
        SPLIT_PART(numero, '-', 1) AS prefijo,
        CAST(SPLIT_PART(numero, '-', 2) AS INTEGER) AS consecutivo
    FROM facturac
    WHERE SPLIT_PART(numero, '-', 1) IN
    ('MZLA','MZ2','MZ3','MZ4','MZ5','MZ6','MZ7','MZ8','MZ9','MZLB','MZ11','MZLC','MZLD')
) t
ORDER BY prefijo, consecutivo DESC;
VALIDAR SI EXISTE O NO EL ARTICULO
 SELECT l.codigo AS articulo_no_existe
FROM (
    SELECT unnest(ARRAY[
		'0000054845',-- se valida si existe o no
		]) AS codigo
) l
LEFT JOIN articulo a
       ON TRIM(a.codigo) = TRIM(l.codigo)
WHERE a.codigo IS NULL;
QUITAR ESPACIOS PARA QUE NO HAGA SALTO DE LINEAS
rtrim(regexp_replace(detalle, '[\r\n\t]+', ' ', 'g')) as detalle
numero=trim(replace(numero,chr(160),''))
Nextclud
Noatec:
http://admin.jaivana.co:8084/
noatec
43r8dio0gv8obbMHuIQ9g6HMc
[14:07]
Diveco:
http://diveco.jaivanaweb.co:8084/
diveco
8m6JLPN2eCJZmrkeYvfOQqG4g
BUSCAR CUENTAS RETEFUENTE Y RETEIVA
insert into retencion(ccuenta,nombre,tarifa)
select distinct (m.codigo_cuenta),c.nombre,m.tarifa  
from movimiento2024 m, cuentas c where m.codigo_cuenta in
(select codigo_cuenta from cuentas where cuenta_de_retefuente='S' or cuenta_de_reteica='S') and m.codigo_cuenta=c.codigo_cuenta
and m.tarifa>0 and m.codigo_cuenta not in (select ccuenta from retencion)
id EXOGENAS
ALTER TABLE public.exo_formatos
    ADD COLUMN id serial NOT NULL;
ALTER TABLE public.exo_cuentas
    ADD COLUMN id serial NOT NULL;
ALTER TABLE public.exo_conceptos
    ADD COLUMN id serial NOT NULL;
anydeks
%appdata%
DATOS CLIENTES 
select case when tipo_identificacion='C' then '13'
            when tipo_identificacion='N' then '31'
			when tipo_identificacion='TX' then '21'
			when tipo_identificacion='CE' then '22'
			when tipo_identificacion='P' then '41'
ELSE 'OTRO TIPO'
END AS codigo_dian,
nit,verifica,sede,ape1,ape2,nom1,nom2,otro_nombre,direccion,
case when tipo_identificacion='C' then 'CEDULA'
      when tipo_identificacion='N' then 'NIT'
	  when tipo_identificacion='TX' then 'TIPO DE DOCUMENTO EXTRANJERO'
	  when tipo_identificacion='P' then 'PASAPORTE'
	  when tipo_identificacion='CE' then 'CEDULA DE EXTRANJERIA'
	  ELSE 'OTRO'
	  end as tipo_identificacion,
case when tipo_persona='N' then 'NATURAL'
else 'JURIDICA'
end as tipo_persona
from nitsx_sedes where estado='A';
AUDITORIAS 
select c.saldo,m.valor,m.valor-c.saldo as diferencia from movimiento2026 m
inner join
cartera_clientes c on c.numero = m.numero_documento
where m.codigo_cuenta = '130505' and m.numero_documento
select c.numero,contable,m.codigo_cuenta,c.saldo,m.valor,m.valor-c.saldo as diferencia 
from movimiento2026 m
inner join
cartera_proveedores c on c.numero = m.documento_fuente
where m.codigo_cuenta <> c.contable 
and c.nit='800226784'
CORTE INVENTARIO LEKAMP 
select distinct on (l.codigo_articulo, l.bodega) l.codigo_articulo,a.nombre,l.saldo_despues AS corte_fecha,saldo2 as saldo_actual
from  log_costos l
join  articulo a on a.codigo=l.codigo_articulo
where  l.fecha_documento <= 'K1' and l.bodega='2'
order by l.codigo_articulo, l.bodega, l.fecha_documento DESC, l.orden DESC, l.id DESC;
COMPARAR CUENTA EN TIPO DE PROCUSTO 
select distinct a.codigo,a.nombre,a.clase_de_producto,c.codigo_cuenta,c.nombre
from tipos_productos_configuracion tpc
join articulo a on  a.clase_de_producto=tpc.tipo_producto
join cuentas c on c.codigo_cuenta=tpc.cuenta_1
where a.codigo in ('IMU160036','IMU160048','IMU160047','NAL080413','JET170035','GAC090043','JET170036','BIA020638','IMU160035','NAL080388')
and a.id in (55947,55512,55887,55888,55967,55976,55968,55982,55926,56001) and tarifa=19
PROCESOS MASIVOS
update configuracion_procesos_masivos
set usuarios_permitidos = concat_ws(',',nullif(usuarios_permitidos,''),
    case when usuarios_permitidos not ilike '%gfod%' then 'gfod' end,
    case when usuarios_permitidos not ilike '%rmmj%' then 'rmmj' end)
where usuarios_permitidos not ilike '%gfod%'
   or usuarios_permitidos not ilike '%rmmj%';
VALORES EN CERO FACTURAS WERK
update itemfc it
set subtotal1=itp.precio_base,subtotal2=itp.precio_base,valor_item=itp.precio_base*it.cantidad,total_sin_iva=itp.precio_base*it.cantidad
from items_pedidos itp
join pedidos p on  itp.numero=p.numero
where it.nit=p.nit
and itp.codigo=it.codigo
and it.fecha='2026-09-16'
and it.nit='3101799498'
and itp.numero=3133
and it.numero='1993';
update facturac
set valor=(select sum(valor_item) from itemfc where numero='1993' and nit='3101799498' and  fecha='2026-09-16'),
basee=(select sum(valor_item) from itemfc where numero='1993' and nit='3101799498' and fecha='2026-09-16')
where numero='1993'
and nit='3101799498'
and fecha='2026-09-16';$q$);

COMMIT;