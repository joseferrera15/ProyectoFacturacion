import jwt from 'jsonwebtoken';
import {jsonResponse} from '../helpers/json_response.js';

export const isAuth = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json(
            jsonResponse({
                status: 401,
                message: 'Debe iniciar sesion',
                data: null
            })
        );
    }   

    const token = authHeader.split(' ')[1];

    try {   
        const{id,email,role} = jwt.verify(token, process.env.JWT_KEY);
        req.user = {id,email,role};
        next();
    } catch (error) {
        return res.status(401).json(
            jsonResponse({
                status: 401,
                message: 'Sesion invalida o expirada',
                data: null
            })
        );
    }       
}