import Visitor from "../models/Visitors.model.js";

// Register Visitor
export const addVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);

    res.status(201).json({
      success: true,
      visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Visitors
export const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();

    res.status(200).json({
      success: true,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark Exit
export const markExit = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { exitTime: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};