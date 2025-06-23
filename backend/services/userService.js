const db = require('../db'); // Adjusted path assuming db.js is in the root of backend/
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Ensure db is ready (it's a promise-like object from JSONFilePreset)
// We typically await db.read() before operations and db.write() after.

const userService = {
  /**
   * Finds a user by their email.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<object|null>} The user object or null if not found.
   */
  async findUserByEmail(email) {
    await db.read(); // Ensure data is loaded
    const user = db.data.users.find(u => u.email === email);
    return user || null;
  },

  /**
   * Creates a new user.
   * @param {object} userData - User data.
   * @param {string} userData.email - The user's email.
   * @param {string} userData.password - The user's plain text password.
   * @returns {Promise<object>} The newly created user object (without password hash).
   * @throws {Error} If email is already taken or password hashing fails.
   */
  async createUser({ email, password }) {
    await db.read(); // Ensure data is loaded

    // Check if email is already taken
    const existingUser = db.data.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already in use.');
    }

    // Hash the password
    const saltRounds = 10; // Recommended salt rounds for bcrypt
    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to secure password.');
    }

    const newUser = {
      id: uuidv4(), // Generate a unique ID for the user
      email: email.toLowerCase(), // Store email in lowercase for consistency
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(newUser);
    await db.write(); // Save changes to db.json

    // Return user object without the password hash for security
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  /**
   * Verifies a user's password.
   * @param {string} plainPassword - The plain text password to verify.
   * @param {string} hashedPassword - The stored hashed password.
   * @returns {Promise<boolean>} True if the password matches, false otherwise.
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false; // Or throw, depending on desired error handling
    }
  }
};

module.exports = userService;
