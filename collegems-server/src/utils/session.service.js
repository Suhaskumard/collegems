import RefreshToken from "../models/RefreshToken.model.js";

/**
 * Creates a new session in the database.
 */
export const createSession = async ({ userId, tokenHash, deviceInfo, ipAddress, expiresAt }) => {
  return await RefreshToken.create({
    user: userId,
    token: tokenHash,
    deviceInfo,
    ipAddress,
    expiresAt,
  });
};

/**
 * Revokes a single session by setting isRevoked = true.
 */
export const revokeSession = async (tokenHash) => {
  return await RefreshToken.findOneAndUpdate(
    { token: tokenHash },
    { isRevoked: true },
    { new: true }
  );
};

/**
 * Revokes all sessions for a specific user by deleting their documents.
 */
export const revokeAllSessions = async (userId) => {
  return await RefreshToken.deleteMany({ user: userId });
};

/**
 * Finds an active or inactive session by its hashed token.
 */
export const findSession = async (tokenHash) => {
  return await RefreshToken.findOne({ token: tokenHash });
};

/**
 * Rotates a session: creates a new one and marks the old one as revoked.
 * Marking as revoked (instead of deleting) is critical for Token Reuse Detection.
 */
export const rotateSession = async ({ oldTokenHash, newTokenHash, newExpiresAt, deviceInfo, ipAddress }) => {
  const oldSession = await RefreshToken.findOne({ token: oldTokenHash });
  if (!oldSession) return null;

  // Create new session
  const newSession = await RefreshToken.create({
    user: oldSession.user,
    token: newTokenHash,
    deviceInfo: deviceInfo || oldSession.deviceInfo,
    ipAddress: ipAddress || oldSession.ipAddress,
    expiresAt: newExpiresAt,
  });

  // Mark old session as revoked
  oldSession.isRevoked = true;
  await oldSession.save();

  return newSession;
};
