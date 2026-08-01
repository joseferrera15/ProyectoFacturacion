/*import 'dotenv/config';
import { pool } from '../src/db/db.js';

try {
    const conn = await pool.getConnection();

    console.log('✅ Conexión exitosa a la base de datos');

    const [rows] = await conn.query('SELECT NOW() AS fecha');

    console.table(rows);

    conn.release();

    process.exit(0);

} catch (error) {

    console.error('❌ Error al conectar a la base de datos');
    console.error(error);

    process.exit(1);
} */

