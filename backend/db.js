const { JSONFilePreset } = require('lowdb/node'); // For Node.js environment

// Default data to initialize the database with if db.json doesn't exist or is empty
const defaultData = {
  users: []
  // We can add other collections here later, e.g., products, orders, etc.
};

// Initialize the database
// It will create db.json if it doesn't exist, using defaultData.
// If db.json exists, it will load its content.
const db = JSONFilePreset('backend/db.json', defaultData);

// We need to call db.write() once after JSONFilePreset to ensure the file is created
// with default data if it's new, or to trigger initial load/parsing.
// However, typical usage is to call db.read() before accessing data and db.write() after modifying it.
// JSONFilePreset handles the initial read/write to create the file if it doesn't exist.
// Let's ensure the file is created by attempting a write if it's a new setup.
// This is often handled implicitly by JSONFilePreset, but an explicit write can be good.
// (async () => {
//   await db.write(); // Ensures db.json is created with defaults if it's not there.
// })();
// Actually, JSONFilePreset handles the initial creation and load.
// We just need to make sure we call .read() before operations and .write() after modifications.

module.exports = db;
