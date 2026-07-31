import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { validateLogin } from '../schemas/auth.schema.js';
import AuthModel from '../models/auth.model.js';
import { jsonResponse } from '../helpers/json_response.js';

export const login = async (req, res) => {

    const { success, data, error } = validateLogin(req.body);

    if (!success) {
        return res.status(400).json(
            jsonResponse({
                status: 400,
                message: 'No pasó las validaciones',
                data: JSON.parse(error.message)
            })
        );
    }

    try {

        const user = await AuthModel.findByEmail(data.email);

        if (!user) {
            return res.status(401).json(
                jsonResponse({
                    status: 401,
                    message: 'Credenciales inválidas',
                    data: null
                })
            );
        }

        const isValid = await argon2.verify(
            user.password_hash,
            data.password
        );

        if (!isValid) {
            return res.status(401).json(
                jsonResponse({
                    status: 401,
                    message: 'Credenciales inválidas',
                    data: null
                })
            );
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_KEY,
            {
                expiresIn: '10h'
            }
        );

        return res.status(200).json(
            jsonResponse({
                status: 200,
                message: 'Bienvenido',
                data: {
                    ...payload,
                    name: user.name,
                    token
                }
            })
        );

    } catch (error) {

        return res.status(500).json(
            jsonResponse({
                status: 500,
                message: error.message,
                data: null
            })
        );

    }

};