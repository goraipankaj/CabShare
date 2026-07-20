/**
 * Wraps a Mongoose Query with chainable filter / sort / field-limit / pagination / search
 * helpers driven by req.query. Usage:
 *
 *   const features = new ApiFeatures(Ride.find(), req.query)
 *     .filter()
 *     .search(['source.address', 'destination.address'])
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const results = await features.query;
 *   const total = await features.countTotal(Ride);
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excluded = ['page', 'sort', 'limit', 'fields', 'search', 'keyword'];
    const queryObj = { ...this.queryString };
    excluded.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = []) {
    const keyword = this.queryString.search || this.queryString.keyword;
    if (keyword && fields.length) {
      const regex = new RegExp(keyword, 'i');
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  async countTotal(Model) {
    const filterQuery = this.query.getFilter ? this.query.getFilter() : {};
    const total = await Model.countDocuments(filterQuery);
    const limit = this.pagination?.limit || 10;
    return {
      total,
      page: this.pagination?.page || 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = ApiFeatures;
