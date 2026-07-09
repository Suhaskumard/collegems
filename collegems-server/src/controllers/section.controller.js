import Section from '../models/Section.model.js';
import mongoose from 'mongoose';
import Student from '../models/Student.model.js'; 
import Attendance from '../models/Attendance.model.js';
import Timetable from '../models/Timetable.model.js';
export const bulkRenameSections = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { updates } = req.body; // Expects: [{ oldName: 'A', newName: 'A1' }, ...]

        for (const { oldName, newName } of updates) {
            // 1. Update the section name itself
            const updated = await Section.findOneAndUpdate(
                { name: oldName }, 
                { name: newName }, 
                { session, new: true }
            );
            
            if (!updated) throw new Error(`Section ${oldName} not found`);

            // 2. Cascade update all related collections
            // Adjust models (Student, Attendance, etc.) as per your schema
            await Student.updateMany({ section: oldName }, { section: newName }, { session });
            await Attendance.updateMany({ section: oldName }, { section: newName }, { session });
            await Timetable.updateMany({ section: oldName }, { section: newName }, { session });
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, message: "Sections renamed successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};