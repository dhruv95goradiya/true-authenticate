// src/models/user.mjs
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connection.mjs';
import Contact from './contacts.mjs'; // Import Contact model here
import bcrypt from 'bcryptjs'; // Change bcrypt to bcryptjs

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
});

// Define the association here, after both models have been defined
User.hasMany(Contact, { foreignKey: 'userId' });
Contact.belongsTo(User, { foreignKey: 'userId' });

// Method to compare passwords
User.prototype.validPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default User;

