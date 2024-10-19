const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');

// Object to keep track of database connections
const connections = {};

async function connectToTenantDB(email) {
    // Check if the connection for this email already exists
    if (connections[email]) {
        return connections[email]; // Return the existing connection
    }

    // Find the tenant's database name based on email
    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
        throw new Error('Tenant not found');
    }

    // Create a new connection for this tenant
    const dbUri = `mongodb+srv://sowb1:sowb1@cluster0.dbjop.mongodb.net/${tenant.dbName}?retryWrites=true&w=majority`;

    const newConnection = mongoose.createConnection(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    connections[email] = newConnection; // Store the connection for future use
    return newConnection;
}

module.exports = connectToTenantDB;
