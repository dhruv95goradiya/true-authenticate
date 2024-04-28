import bcrypt from 'bcryptjs';

async function comparePasswords() {
    // Plain text password
    const plaintextPassword = 'password123';

    // Hashed password
    const hashedPassword = await bcrypt.hash(plaintextPassword, 10);

    console.log('Plaintext password:', plaintextPassword);
    console.log('Hashed password:', hashedPassword);

    // Compare
    const match = await bcrypt.compare('cooldown123', '$2b$10$pEe65.jHgg93hvmeXCjjO.IfNQyNxqiIb28D.nAF5Nr6CmkRUItfC');
    console.log('Passwords match:', match);
}

comparePasswords();
