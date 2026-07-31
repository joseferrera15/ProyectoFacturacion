import {pool} from '../db/db.js';

export default class AuthModel {

    static findByEmail = async (email) => {

        const conn = await pool.getConnection();

        try {
            const [rows] = await conn.query(
                `SELECT id, name, email, password_hash, role
                FROM users
                WHERE email = ?`,
            [email]
        );
            return rows[0];
        } finally {
            conn.release();
        }
    }   
}
