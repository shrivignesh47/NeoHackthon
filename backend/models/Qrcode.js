const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now },
});

const QRCodeSchema = new mongoose.Schema({
    url: { type: String, required: true },
    qrImage: { type: String, required: true },
    scans: [ScanSchema], // Array to store scan information
});

module.exports = mongoose.model("QRCode", QRCodeSchema);
