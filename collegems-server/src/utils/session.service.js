import RefreshToken from "../models/RefreshToken.model.js";

/**
 * Creates a new refresh token session.
 */
export const createSession = async ({
  userId,
  tokenHash,
  deviceInfo,
  ipAddress,
  expiresAt,
}) => {
  return await RefreshToken.create({
    user: userId,
    token: tokenHash,
    deviceInfo,
    ipAddress,
    expiresAt,
  });
};

/**
 * Revokes a single session.
 */
export const revokeSession = async (tokenHash) => {
  return await RefreshToken.findOneAndUpdate(
    {
      token: tokenHash,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
      },
    },
    {
      new: true,
    }
  );
};

/**
 * Revokes all sessions for a user.
 *
 * NOTE:
 * Do NOT delete sessions.
 * Keep them until TTL removes them so
 * token reuse detection still works.
 */
export const revokeAllSessions = async (userId) => {
  return await RefreshToken.updateMany(
    {
      user: userId,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
      },
    }
  );
};

/**
 * Finds a session by hashed refresh token.
 *
 * We intentionally do NOT filter revoked sessions here
 * because auth.controller.js uses them for
 * Token Reuse Detection.
 */
export const findSession = async (tokenHash) => {
  return await RefreshToken.findOne({
    token: tokenHash,
    expiresAt: {
      $gt: new Date(),
    },
  });
};

/**
 * Updates session activity timestamp.
 *
 * Call this after every successful refresh.
 */
export const updateSessionUsage = async (tokenHash) => {
  return await RefreshToken.findOneAndUpdate(
    {
      token: tokenHash,
    },
    {
      $set: {
        lastUsedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );
};

/**
 * Rotates refresh token session.
 *
 * Creates a new session and revokes
 * the previous session.
 */
export const rotateSession = async ({
  oldTokenHash,
  newTokenHash,
  newExpiresAt,
  deviceInfo,
  ipAddress,
}) => {
  const oldSession = await RefreshToken.findOne({
    token: oldTokenHash,
  });

  if (!oldSession) {
    return null;
  }

  const newSession = await RefreshToken.create({
    user: oldSession.user,
    token: newTokenHash,
    deviceInfo: deviceInfo || oldSession.deviceInfo,
    ipAddress: ipAddress || oldSession.ipAddress,
    expiresAt: newExpiresAt,
  });

  oldSession.isRevoked = true;
  await oldSession.save();

  return newSession;
};
