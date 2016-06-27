CourseIndex = new EasySearch.Index({
  collection: Course,
  fields: ['name', 'code', 'description'],
  engine: new EasySearch.MongoTextIndex(),
});