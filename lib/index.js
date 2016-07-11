// CourseIndex = new EasySearch.Index({
//   collection: Course,
//   fields: ['code'],
//   engine: new EasySearch.MongoDB(),
// });

CourseIndex = new EasySearch.Index({
  collection: Course,
  fields: ['code'],
  name: "advCourseIndex",
  engine: new EasySearch.MongoDB({
    selector: function (searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation);

      // filter for the brand if set
      if (options.search.props.term) {
        selector.term = options.search.props.term;
      }

      return selector;
    }
  }),
});
