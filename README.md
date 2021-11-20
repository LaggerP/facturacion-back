# facturacion-back


### Última actualización: _29/10/2021_
___


#### Instalación dependencias del proyecto:
`$ npm install`
___

#### Configuración de ambiente de desarrollo: 

Para hacer uso completo de la aplicación de forma local es necesario tener una BD MySQL corriendo bajo el puerto 3306. 
#### Comando Docker para crear imagen MySQL:

`docker run -p 3306:3306 --name tu_DB_local_DB -e MYSQL_ROOT_PASSWORD=tu_DB_local_PASS -d mysql`
___

Crear un archivo `.env` con las siguientes variables de entorno:

```
 DEV=true //true si el ambiente es local/desarrollo
 FyA_AUTH_SECRET=tuSecretAuth
 FyA_AUTH_EXPIRES=1d
 FyA_AUTH_ROUNDS=10
 FyA_EMAIL_USER=tuUserEmail
 FyA_EMAIL_PASS=tuPasswordEmail
 FyA_EMAIL_SMTP=tuSMTP
 SECRET_SSO_FyA_JWT=tokenSuministradoPorSSO
 SECRET_SUBSCRIPTIONS_KEY=keySecretaDeSuscripciones
 DEV_DATABASE_URL=tu_DB_URI_local_Postgres
```

___

####¿Cómo correr el proyecto?

Para correr el proyecto es necesario tener una base de datos MySQL activa. Al correr el comando `node server.js` se 
crearán las tablas en la BD (si es que aún no existen).
___

#### Endpoints:

---

