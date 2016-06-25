Template.searchForm.events ({
  "submit form": function(events) {
    events.preventDefault();
    var keyword = events.target.keyword.value;
    Meteor.call("keywordInsert", keyword);
    events.target.keyword.value = "";
    console.log("submitted!");
  }
});
