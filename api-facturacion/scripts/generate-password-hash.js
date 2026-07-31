import * as argon2 from 'argon2'

const password = '123456'

//generar hash con argon2 para la contrasena
const hash = await argon2.hash(password)

console.log('\nHash argon2 para la contrasena "123456":\n')

console.log(hash)