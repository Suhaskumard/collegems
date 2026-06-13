import Alumni from "../models/Alumni.model.js";

export const getAlumni = async (req, res, next) => {
  try {
    const { batch, department, search } = req.query;
    
    let query = {};
    if (batch) query.batch = batch;
    if (department) query.department = department;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { currentCompany: { $regex: search, $options: "i" } }
      ];
    }

    const alumniList = await Alumni.find(query).sort({ batch: -1, name: 1 });
    
    res.json({
      success: true,
      data: alumniList
    });
  } catch (error) {
    next(error);
  }
};

export const seedAlumni = async (req, res, next) => {
  try {
    const count = await Alumni.countDocuments();
    if (count === 0) {
      await Alumni.insertMany([
        {
          name: "John Doe",
          email: "john.doe@example.com",
          batch: "2020",
          department: "Computer Science",
          currentCompany: "Google",
          designation: "Software Engineer",
          linkedInUrl: "https://linkedin.com/in/johndoe"
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          batch: "2021",
          department: "Electrical Engineering",
          currentCompany: "Tesla",
          designation: "Hardware Engineer",
          linkedInUrl: "https://linkedin.com/in/janesmith"
        },
        {
          name: "Alice Johnson",
          email: "alice.j@example.com",
          batch: "2019",
          department: "Computer Science",
          currentCompany: "Microsoft",
          designation: "Senior Developer",
          linkedInUrl: "https://linkedin.com/in/alicej"
        },
        {
          name: "Bob Brown",
          email: "bob.b@example.com",
          batch: "2022",
          department: "Mechanical Engineering",
          currentCompany: "Ford",
          designation: "Design Engineer",
          linkedInUrl: "https://linkedin.com/in/bobbrown"
        }
      ]);
    }
    res.json({ success: true, message: "Mock alumni seeded if not present" });
  } catch (error) {
    next(error);
  }
};
