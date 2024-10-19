// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const User = require("./models/user");
// const QRCode = require("./models/Qrcode"); // Import the QRCode model
// const verifyToken = require("./Middleware/auth"); // Use the JWT middleware

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Atlas connection
// mongoose.connect(
//     "mongodb+srv://sowb1:sowb1@cluster0.dbjop.mongodb.net/?retryWrites=true&w=majority",
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }
// );

// // Register route (No authentication needed)
// app.post("/signup", async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//         return res.status(400).json({ error: "Email is already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//         const user = new User({ name, email, password: hashedPassword });
//         await user.save();
//         res.status(201).json({ message: "User created successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Error creating user" });
//     }
// });

// // Login route (No authentication needed)
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//         return res.status(404).json({ error: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//         return res.status(400).json({ error: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user._id }, "jwtSecret", { expiresIn: "1h" });
//     res.status(200).json({ token });
// });

// // Protected route using JWT middleware
// app.get("/dashboard", verifyToken, (req, res) => {
//     res.status(200).json({ message: "Welcome to the dashboard!", user: req.user });
// });

// // POST route to save QR code
// app.post("/api/qrcodes", verifyToken, async (req, res) => {
//     const { url, qrImage } = req.body;

//     if (!url || !qrImage) {
//         return res.status(400).json({ error: "URL and QR image are required" });
//     }

//     try {
//         const qrCode = new QRCode({ url, qrImage });
//         await qrCode.save();
//         res.status(201).json({ message: "QR Code saved successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Error saving QR Code" });
//     }
// });

// // GET route to fetch all QR codes
// app.get("/api/qrcodes", verifyToken, async (req, res) => {
//     try {
//         const qrCodes = await QRCode.find();
//         res.status(200).json(qrCodes);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching QR Codes" });
//     }
// });

// // GET route to track QR code scans
// app.get("/api/track", async (req, res) => {
//     const { url, latitude, longitude } = req.query;
//     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//     const userAgent = req.headers['user-agent'];

//     if (!url) {
//         return res.status(400).json({ error: "URL is required" });
//     }

//     try {
//         // Save scan information to the database
//         await QRCode.updateOne(
//             { url },
//             {
//                 $push: {
//                     scans: {
//                         ip,
//                         userAgent,
//                         latitude: parseFloat(latitude),
//                         longitude: parseFloat(longitude),
//                         timestamp: new Date(),
//                     },
//                 },
//             },
//             { upsert: true }
//         );

//         // Redirect to the original URL
//         res.redirect(url);
//     } catch (error) {
//         console.error("Error tracking QR code scan:", error);
//         res.status(500).json({ error: "Error tracking scan" });
//     }
// });

// // Start the server
// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });



const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/user");
const QRCode = require("./models/Qrcode");
const Tenant = require("./models/Tenant"); // Import the Tenant model
const verifyToken = require("./Middleware/auth");
const connectToTenantDB = require("./utils/dbManager"); // Utility for multi-tenancy

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection for the main database
mongoose.connect(
    "mongodb+srv://sowb1:sowb1@cluster0.dbjop.mongodb.net/?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

// Function to create tenant-specific User model
const createUserModel = (tenantConnection) => {
    // Check if the model is already registered
    if (tenantConnection.models.User) {
        return tenantConnection.models.User;
    }

    const UserSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "Name is required"],
            minlength: [2, "Name must be at least 2 characters long"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        tenantId: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
        },
    }, { timestamps: true });

    return tenantConnection.model("User", UserSchema);
};

// Signup route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const dbName = `tenant_db_${Date.now()}`;
        const tenantId = `tenant_${Date.now()}`; // Ensure this is unique

        // Save tenant information
        const tenant = new Tenant({ email, dbName });
        await tenant.save();

        // Create tenant-specific DB and save the user there
        const tenantConnection = await connectToTenantDB(email);
        const TenantUser = createUserModel(tenantConnection);

        const user = new TenantUser({ name, email, password: hashedPassword, tenantId });
        await user.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Error creating user" });
    }
});

// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Switch to tenant-specific DB
        const tenantConnection = await connectToTenantDB(email);
        const TenantUser = createUserModel(tenantConnection); // Create model for tenant

        const user = await TenantUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email }, "jwtSecret", { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});

// Protected route
app.get("/dashboard", verifyToken, async (req, res) => {
    const { email } = req.user;

    try {
        const tenantConnection = await connectToTenantDB(email);
        const TenantUser = createUserModel(tenantConnection); // Create model for tenant

        const user = await TenantUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found in tenant DB" });
        }

        res.status(200).json({ message: "Welcome to the dashboard!", user });
    } catch (error) {
        console.error("Error accessing dashboard:", error);
        res.status(500).json({ error: "Error accessing dashboard" });
    }
});

// POST route to save QR code
app.post("/api/qrcodes", verifyToken, async (req, res) => {
    const { email } = req.user;
    const { url, qrImage } = req.body;

    if (!url || !qrImage) {
        return res.status(400).json({ error: "URL and QR image are required" });
    }

    try {
        const tenantConnection = await connectToTenantDB(email);
        const TenantQRCode = tenantConnection.model("QRCode", QRCode.schema); // Fetch QRCode model

        const qrCode = new TenantQRCode({ url, qrImage });
        await qrCode.save();

        res.status(201).json({ message: "QR Code saved successfully" });
    } catch (error) {
        console.error("Error saving QR Code:", error);
        res.status(500).json({ error: "Error saving QR Code" });
    }
});

// GET route to fetch QR codes
app.get("/api/qrcodes", verifyToken, async (req, res) => {
    const { email } = req.user;

    try {
        const tenantConnection = await connectToTenantDB(email);
        const TenantQRCode = tenantConnection.model("QRCode", QRCode.schema); // Fetch QRCode model

        const qrCodes = await TenantQRCode.find();
        res.status(200).json(qrCodes);
    } catch (error) {
        console.error("Error fetching QR Codes:", error);
        res.status(500).json({ error: "Error fetching QR Codes" });
    }
});

// GET route to track QR code scans
app.get("/api/track", verifyToken, async (req, res) => {
    const { email } = req.user;
    const { url, latitude, longitude } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const tenantConnection = await connectToTenantDB(email);
        const TenantQRCode = tenantConnection.model("QRCode", QRCode.schema); // Fetch QRCode model

        await TenantQRCode.updateOne(
            { url },
            {
                $push: {
                    scans: {
                        ip,
                        userAgent,
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        timestamp: new Date(),
                    },
                },
            },
            { upsert: true }
        );

        res.redirect(url);
    } catch (error) {
        console.error("Error tracking QR code scan:", error);
        res.status(500).json({ error: "Error tracking scan" });
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
