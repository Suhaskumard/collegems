// FILE: collegems-server/src/controllers/announcement.controller.js

import Announcement from "../models/Announcement.model.js";

//  CREATE
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      targetRole,
      targetCourse,
      targetSemester,
      expiresAt,
      priority,
      status,
    } = req.body;

    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'draft' or 'published'",
      });
    }

    const announcementStatus = status || "published";

    const announcement = new Announcement({
      title,
      message,
      postedBy: req.user.id,
      targetRole: targetRole || "all",
      targetCourse: targetCourse || null,
      targetSemester: targetSemester || null,
      expiresAt: expiresAt || null,
      priority: priority || "medium",
      status: announcementStatus,
    });

    await announcement.save();

    const populated = await Announcement.findById(announcement._id).populate(
      "postedBy",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: announcementStatus === "draft"
        ? "Announcement saved as draft"
        : "Announcement published successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET MY ANNOUNCEMENTS
export const getMyAnnouncements = async (req, res) => {
  try {
    const { role, course, semester } = req.user;

    const now = new Date();

    // Build audience filter:
    const filter = {
      isActive: true,
      $and: [
        // Only show published announcements (treat missing status as published)
        { $or: [{ status: "published" }, { status: { $exists: false } }] },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        { $or: [{ targetRole: "all" }, { targetRole: role }] },
        // Course filter
        {
          $or: [
            { targetCourse: null },
            { targetCourse: course || "__none__" },
          ],
        },
        // Semester filter
        {
          $or: [
            { targetSemester: null },
            { targetSemester: semester?.toString() || "__none__" },
          ],
        },
      ],
    };

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role")
      .sort({ priority: -1, createdAt: -1 }); // urgent first, then newest

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET ALL ANNOUNCEMENTS
// TODO: Add targetClub after club/society management (#171) is implemented.
export const getAllAnnouncements = async (req, res) => {
  try {
    const { targetRole, targetCourse, targetSemester, isActive, status } =
      req.query;

    const filter = {};
    if (targetRole) filter.targetRole = targetRole;
    if (targetCourse) filter.targetCourse = targetCourse;
    if (targetSemester) filter.targetSemester = targetSemester;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (status) filter.status = status;

    const visibilityFilter = {
      $or: [
        { status: "published" },
        { status: { $exists: false } },
        { postedBy: req.user.id }
      ]
    };

    const finalFilter = {
      ...filter,
      ...visibilityFilter,
    };

    const announcements = await Announcement.find(finalFilter)
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET SINGLE
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "postedBy",
      "name email role"
    );

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  UPDATE
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    // Teachers can only edit their own announcements
    if (
      req.user.role === "teacher" &&
      announcement.postedBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    // Validate status value
    if (req.body.status && !["draft", "published"].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'draft' or 'published'",
      });
    }

    const allowed = [
      "title",
      "message",
      "targetRole",
      "targetCourse",
      "targetSemester",
      "expiresAt",
      "priority",
      "isActive",
      "status",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) announcement[field] = req.body[field];
    });

    await announcement.save();

    const updated = await Announcement.findById(announcement._id).populate(
      "postedBy",
      "name email role"
    );

    res.status(200).json({
      success: true,
      message: "Announcement updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE 
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    if (
      req.user.role === "teacher" &&
      announcement.postedBy.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
