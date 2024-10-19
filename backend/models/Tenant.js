const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true }, // User's email, unique
    dbName: { type: String, required: true } // Database name for this tenant
});

module.exports = mongoose.model("Tenant", tenantSchema);
