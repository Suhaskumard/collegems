import crypto from "crypto";
import mongoose from "mongoose";
import TemporaryLink from "../models/TemporaryLink.model.js";
import Course from "../models/Course.model.js";
import User from "../models/User.model.js";

// Configured valid resource types for security
export const SUPPORTED_RESOURCE_TYPES = ["Resource", "Book", "ExamSchedule", "Assignment"];

/**
 * Verify the requesting user actually has a legitimate relationship to the
 * resource before a shareable link is minted for it. Staff (hod/admin)
 * always pass. Per resource type:
 *  - Assignment: the assignment's own teacher, or a student enrolled in its
 *    course (matched the same way results.controller.js checks eligibility).
 *  - Resource/Book/ExamSchedule: none of these carry a per-user ownership or
 *    enrollment relationship in their schema, so only staff may share them.
 */
const authorizeResourceAccess = async (resourceType, resource, requestingUser) => {
  if (requestingUser.role === "hod" || requestingUser.role === "admin") {
    return;
  }

  if (resourceType === "Assignment") {
    if (requestingUser.role === "teacher" && resource.teacher && resource.teacher.toString() === requestingUser.id) {
      return;
    }
    if (requestingUser.role === "student" && resource.course) {
      const course = await Course.findById(resource.course);
      const student = await User.findById(requestingUser.id);
      const matchesSem = course && student?.semester && course.semester === Number(student.semester);
      const matchesDept = course && student?.course && course.department?.toLowerCase() === student.course.toLowerCase();
      if (matchesSem || matchesDept) {
        return;
      }
    }
  }

  throw new Error("Not authorized to share a link to this resource");
};

/**
 * Generate a new temporary link
 * @param {string} resourceType
 * @param {string} resourceId
 * @param {Object} requestingUser
 * @param {number} expiresInMinutes
 * @returns {Object} The created link
 */
export const generateLink = async (resourceType, resourceId, requestingUser, expiresInMinutes = 60) => {
  if (!SUPPORTED_RESOURCE_TYPES.includes(resourceType)) {
    throw new Error(`Unsupported resource type: ${resourceType}`);
  }

  // Validate that the resource actually exists
  const Model = mongoose.model(resourceType);
  if (!Model) {
    throw new Error(`Model ${resourceType} not found in mongoose schema`);
  }

  const resource = await Model.findById(resourceId);
  if (!resource) {
    throw new Error(`${resourceType} with ID ${resourceId} not found`);
  }

  await authorizeResourceAccess(resourceType, resource, requestingUser);

  const createdBy = requestingUser.id;
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const newLink = await TemporaryLink.create({
    token,
    resourceType,
    resourceId,
    createdBy,
    expiresAt,
  });

  return newLink;
};

/**
 * Validate and retrieve resource from a token
 * @param {string} token 
 * @returns {Object} resource and type
 */
export const validateAndAccessLink = async (token) => {
  const link = await TemporaryLink.findOne({ token }).populate("resourceId");

  if (!link) {
    throw new Error("Invalid access token");
  }

  if (link.isRevoked) {
    throw new Error("This link has been revoked");
  }

  if (new Date() > link.expiresAt) {
    throw new Error("This link has expired");
  }

  return {
    resource: link.resourceId,
    resourceType: link.resourceType,
    expiresAt: link.expiresAt
  };
};

/**
 * Revoke a temporary link
 * @param {string} token 
 * @param {string} userId (to ensure only creator or admin can revoke)
 */
export const revokeLink = async (token, userId, isAdmin = false) => {
  const link = await TemporaryLink.findOne({ token });

  if (!link) {
    throw new Error("Link not found");
  }

  if (!isAdmin && link.createdBy.toString() !== userId.toString()) {
    throw new Error("Unauthorized to revoke this link");
  }

  link.isRevoked = true;
  await link.save();

  return link;
};

/**
 * List active links created by a user
 */
export const listActiveLinks = async (userId) => {
  return TemporaryLink.find({
    createdBy: userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};
