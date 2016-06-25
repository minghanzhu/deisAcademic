Meteor.methods ({
  keywordInsert: function(keyword) {
    Keyword.insert({
      keyword: keyword,
    });
  }
});
