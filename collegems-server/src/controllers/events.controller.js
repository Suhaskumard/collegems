import Event from "../models/Events.model.js";
import User from "../models/User.model.js";


// CREATE
export const createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// /get all event - read only
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });

        res.json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get single event by id - when click on any event - view in dialog box
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// update event - admin only
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({
            success: true,
            message: "Event updated",
            data: event,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// delete event - admin 
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
};

export const markEventAsRead = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        const userId = req.user.id;

        if (!event.readBy.some(id => id.toString() === userId)) {
            event.readBy.push(userId);
            await event.save();
        }

        res.status(200).json({
            success: true,
            message: "Event marked as read",
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const markEventAsUnread = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        const userId = req.user.id;

        event.readBy = event.readBy.filter(
            id => id.toString() !== userId
        );

        await event.save();

        res.status(200).json({
            success: true,
            message: "Event marked as unread",
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getReadCount = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.status(200).json({
            success: true,
            readCount: event.readBy.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const getReaders = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("readBy", "name email studentId");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.status(200).json({
            success: true,
            count: event.readBy.length,
            data: event.readBy,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getUnreadStudents = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        const students = await User.find({
            role: "student",
        });

        const unreadStudents = students.filter(
            student =>
                !event.readBy.some(
                    id => id.toString() === student._id.toString()
                )
        );

        res.status(200).json({
            success: true,
            count: unreadStudents.length,
            data: unreadStudents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};