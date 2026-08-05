import { jsonResponse } from '../helpers/json_response.js';

//configuracion de roles 

export const hasRole = (...allowedRoles) => {
    return (req, res, next) => {
        const { user } = req;

        const hasPermission = allowedRoles.includes(user.role);

        if(hasPermission) {
            return next();
        } 

        return res.status(403).json(
            jsonResponse({
                status: 403,
                message: 'No tiene permisos de ADMIN',
                data: null
            })
        );
    }   
}