//Helper para errores con codigo HTTP e implementarlo en los modelos del proyecto.

export class AppError extends Error{
    constructor(message, statusCode = 500){
        super(message)
        this.statusCode =statusCode
    }
}

