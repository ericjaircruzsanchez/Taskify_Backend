import bcrypt from 'bcrypt'

export const hashPassword = async (password : string) => {
    // Hash password
    const salt = await bcrypt.genSalt(10) //Genera un valor único a cada contraseña
    return await bcrypt.hash(password, salt)   
}

export const checkPassword = async (enteredPassword : string, storedHash: string) => {
    return await bcrypt.compare(enteredPassword, storedHash)
}