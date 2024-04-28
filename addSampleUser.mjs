import bcrypt from 'bcryptjs';
import { sequelize } from './src/db/connection.mjs';
import User from './src/models/user.mjs';
import {faker} from '@faker-js/faker'; // Import faker from the package

async function addSampleUser(shouldCreateMultiple = false) {
  try {
    // Check database connection
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    // Create database if not exists
    await sequelize.query('CREATE DATABASE IF NOT EXISTS true_authenticate_db');

    // Use the true_authenticate_db database
    await sequelize.query('USE true_authenticate_db');

    // Sync models with the database
    await sequelize.sync();

    if (shouldCreateMultiple) {
      // Function to generate random user data
      const generateUserData = async() => {
        return {
          name: faker.person.fullName(),
          phoneNumber: await generateUniquePhoneNumber(), // to Consider unique phone number 
          email: faker.internet.email(),
          password: await bcrypt.hashSync("password123", 10)
        };
      };

      const generateUniquePhoneNumber = async () => {
        let phoneNumber;
        do {
          phoneNumber = faker.phone.number();
          const existingUser = await User.findOne({ where: { phoneNumber } });
        } while (existingUser);
        return phoneNumber;
      };

      // Function to populate the database with sample users
      const populateDatabase = async (numUsers) => {
        try {
          for (let i = 0; i < numUsers; i++) {
            const userData = generateUserData();
            console.log('data ', userData)
            await User.create(userData);
          }
          console.log('Sample data inserted successfully!');
        } catch (error) {
          console.error('Error inserting sample data:', error);
        }
      };

      // Populate with 10 sample users (adjust numUsers as needed)
      await populateDatabase(10);
    } else {
      // Check if there are any users
      const existingUser = await User.findOne();
      if (existingUser) {
        console.log("Sample user already exists.");
        return;
      }

      // Add a single sample user
      const sampleUser = {
        name: "Sample User",
        phoneNumber: "1234567890", // Provide a unique phone number generation logic
        email: "sample@example.com",
        password: await bcrypt.hash("password123", 10) // Encrypt password
      };

      await User.create(sampleUser);
      console.log("Sample user added successfully.");
    }
  } catch (error) {
    console.error("Error adding sample user:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Usage: Create a single sample user
addSampleUser();

// Usage: Create multiple sample users (adjust numUsers as needed)
// addSampleUser(true); // Pass true to create multiple users
