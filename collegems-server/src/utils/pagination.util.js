export const getPaginatedData = async (Model, query, options = {}) => {
  const {
    searchFields = [],
    populate = [],
    select = "",
    defaultSort = { createdAt: -1 },
    baseFilter = {},
    defaultLimit = 10,
  } = options;

  // 1. Pagination
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || defaultLimit;
  const skip = (page - 1) * limit;

  // 2. Sorting
  let sort = defaultSort;
  if (query.sortBy) {
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    sort = { [query.sortBy]: sortOrder };
  }

  // 3. Filtering
  // Start with the base filter (e.g. { role: "student" })
  const filterQuery = { ...baseFilter };

  // Parse `filter` query param, e.g. ?filter[course]=BCA
  if (query.filter && typeof query.filter === "object") {
    Object.keys(query.filter).forEach((key) => {
      // Ignore 'all' or empty strings
      if (query.filter[key] !== "all" && query.filter[key] !== "") {
        // Simple exact match, could be expanded to support $in, etc.
        filterQuery[key] = query.filter[key];
      }
    });
  }

  // 4. Searching
  if (query.search && searchFields.length > 0) {
    // If there's an existing $or from baseFilter, we need to handle it carefully. 
    // In MongoDB, you can use $and to combine multiple conditions.
    const searchConditions = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));

    if (filterQuery.$and) {
       filterQuery.$and.push({ $or: searchConditions });
    } else {
       filterQuery.$and = [{ $or: searchConditions }];
    }
  }

  // Execute query and count concurrently
  const [data, totalRecords] = await Promise.all([
    Model.find(filterQuery)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate),
    Model.countDocuments(filterQuery),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    success: true,
    data,
    meta: {
      totalRecords,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    },
  };
};
