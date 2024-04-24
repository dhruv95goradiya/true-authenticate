// tests/api.test.js
import request from 'supertest';
import app from '../app.mjs';
import User from '../src/models/user.mjs';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/db/connection.mjs';

console.log(process.cwd());
describe('API Endpoints', () => {
    let authToken = '';
    let server; // Declare server variable

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Start the server and store the reference to it
        server = app.listen(0);

        // Wait for the server to start listening
        await new Promise(resolve => server.on('listening', resolve));

        const userData = {
            name: 'Test User',
            phoneNumber: '1234567890',
            email: 'test@example.com',
            password: 'password123'
        };
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({ ...userData, password: hashedPassword });

        const loginResponse = await request(app)
            .post('/api/login')
            .send({ phoneNumber: userData.phoneNumber, password: userData.password });
        authToken = loginResponse.body.data.token;
    });

    afterAll(async () => {
        // Close the server after all tests are done
        if (server) {
            await server.close();
        }
    });

    describe('POST /api/register', () => {
        it('should register a new user', async () => {
            const newUser = {
                name: 'John Doe',
                phoneNumber: '9876543210',
                email: 'john@example.com',
                password: 'johnpassword'
            };
            const response = await request(app)
                .post('/api/register')
                .send(newUser)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(newUser.name);
            expect(response.body.data.phoneNumber).toBe(newUser.phoneNumber);
            expect(response.body.data.email).toBe(newUser.email);
        });

        it('should return error if phone number is not valid', async () => {
            const invalidUser = {
                name: 'Invalid User',
                phoneNumber: '123',
                email: 'invalid@example.com',
                password: 'invalidpassword'
            };
            const response = await request(app)
                .post('/api/register')
                .send(invalidUser)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid phone number');
        });
    });

    describe('POST /api/login', () => {
        it('should login a user with valid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({ phoneNumber: '2524136541', password: 'password123' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logged in successfully!');
            expect(response.body.data.token).toBeDefined(); // Access token from data
        });

        it('should return error with invalid phone number', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({ phoneNumber: '123', password: 'password123' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid phone number');
        });

        it('should return error with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({ phoneNumber: '1234567890', password: 'wrongpassword' });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid credentials');
        });
    });

    describe('POST /api/mark-spam', () => {
        it('should mark a number as spam', async () => {
            const response = await request(app)
                .post('/api/mark-spam')
                .send({ phoneNumber: '1234567890' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Number 1234567890 marked as spam');
        });

        it('should return error if phone number is not provided', async () => {
            const response = await request(app)
                .post('/api/mark-spam')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid phone number');
        });
    });

    describe('GET /api/search/by-name/:name', () => {
        it('should return users by name', async () => {
            const response = await request(app)
                .get('/api/search/by-name/Test')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should return error if no users found with the given name', async () => {
            const response = await request(app)
                .get('/api/search/by-name/Nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No users found with this name');
        });
    });

    describe('GET /api/search/by-number/:phoneNumber', () => {
        it('should return users by phone number', async () => {
            const response = await request(app)
                .get('/api/search/by-number/1234567890')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('should return error if no users found with the given phone number', async () => {
            const response = await request(app)
                .get('/api/search/by-number/0000000000')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No users found with this phone number');
        });
    });

    describe('GET /api/profile', () => {
        it('should return user profile', async () => {
            const response = await request(app)
                .get('/api/profile')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBeDefined();
            expect(response.body.data.phoneNumber).toBeDefined();
            expect(response.body.data.email).toBeDefined();
        });
    });

});
