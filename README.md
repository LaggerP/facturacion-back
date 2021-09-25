# facturacion-back


### Última actualización: _24/09/2021_
___


#### Instalación dependencias del proyecto:
`$ npm install`
___

#### Configuración de ambiente de desarrollo: 

Para hacer uso completo de la aplicación de forma local es necesario tener una BD MySQL corriendo bajo el puerto 3306. 

Crear un archivo `.env` con las siguientes variables de entorno:

```
 DEV=true
 FyA_AUTH_SECRET=tuSecretAuth
 FyA_AUTH_EXPIRES=1d
 FyA_AUTH_ROUNDS=10
 SECRET_MOBILE_JWT=secretDeMobile
 SECRET_WEB_JWT=secretDeWeb
 DEV_DB_HOST=localhost
 PROD_DB_PORT=3306
 DEV_DB_USER=tu_DB_local_USER
 DEV_DB_PASS=tu_DB_local_PASS
 DEV_DB_DB=tu_DB_local_DB
```

___

#### Endpoints:

---

