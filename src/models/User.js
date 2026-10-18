const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
            validate: {
                validator: function (value) {
                    if (!this.isModified("password")) return true;
                    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
                },
                message: "Password must contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
            }
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

// Hash password before saving it to the database
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    // Generate a secure bcrypt hash
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// Compare login password with stored hashed password
userSchema.methods.comparePassword = async function (passwordInput) {
    return bcrypt.compare(passwordInput, this.password);
};

// Remove password when converting user document to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", userSchema);
