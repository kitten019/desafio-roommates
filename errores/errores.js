const errores = (error, status, pool) => {
    let message;
    // Manejo de errores
    switch (error) {
        case '22P02':
            status = 400;
            message = "la sintaxis de entrada no es válida para tipo integer";
            break;
        case '28P01':
            status = 400;
            message = "Autenticación de contraseña falló o no existe el usuario: " + pool.options.user;
            break;
        case '42P01':
            status = 400;
            message = "No existe la tabla [" + tabla + "] consultada";
            break;
        case '3D000':
            status = 400;
            message = "La base de datos [" + pool.options.database + "] no existe";
            break;
        case '28000':
            status = 400;
            message = "El usuario [" + pool.options.user + "] no existe";
            break;
        case '42601':
            status = 400;
            message = "Error de Sintaxis en la instrucción";
            break;
        case 'ENOTFOUND':
            status = 500;
            message = "Error en el valor usado como localhost: " + pool.options.host;
            break;
        case 'ECONNREFUSED':
            status = 500;
            message = "Error en el puerto de conexión a la BD, usando: " + pool.options.port;
            break;
        default:
            status = 500;
            message = "Error interno del servidor";
            break;
    }

    return { status, error: message };
};



module.exports = {errores};