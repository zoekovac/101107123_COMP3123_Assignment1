const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxlength: [50, "First name cannot exceed 50 characters"]
        },

        last_name: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxlength: [50, "Last name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"]
        },

        position: {
            type: String,
            required: [true, "Position is required"],
            trim: true
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [0, "Salary cannot be negative"]
        },

        date_of_joining: {
            type: Date,
            required: [true, "Date of joining is required"]
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Employee owner is required"],
            immutable: true,
            index: true,
            validate: {
                validator: async function (userId) {
                    const exists = await mongoose.model("User").exists({ _id: userId });
                    return Boolean(exists);
                },
                message: "Employee owner must be an existing user"
            }
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
);

employeeSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Employee", employeeSchema);
