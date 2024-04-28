// src/models/contacts.mjs
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connection.mjs';

const Contact = sequelize.define('Contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export default Contact;
