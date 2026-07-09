import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    // User who owns this session
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // SHA-256 hash of the refresh token (never store raw token)
    token: {
      type: String,
      required: true,
      unique: true,
    },

    // Device information
    deviceInfo: {
      browser: {
        type: String,
        default: "Unknown",
      },
      os: {
        type: String,
        default: "Unknown",
      },
      device: {
        type: String,
        default: "Unknown",
      },
    },

    // IP address used when session was created
    ipAddress: {
      type: String,
      default: "Unknown",
    },

    // Session expiry
    expiresAt: {
      type: Date,
      required: true,
    },

    // Updated whenever refresh token is used
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    // Session revocation status
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Automatically remove expired sessions.
 */
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

/**
 * Fast lookup of a user's sessions.
 */
refreshTokenSchema.index({
  user: 1,
});

/**
 * Fast lookup of active sessions.
 */
refreshTokenSchema.index({
  user: 1,
  isRevoked: 1,
});

/**
 * Optimizes refresh token validation.
 */
refreshTokenSchema.index({
  token: 1,
  isRevoked: 1,
});

export default mongoose.model("RefreshToken", refreshTokenSchema);