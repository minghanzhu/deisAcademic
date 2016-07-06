CourseIndex = new EasySearch.Index({
  collection: Course,
  fields: ['code'],
  engine: new EasySearch.MongoDB(),
});