Template.majorPlanModify.helpers({
    majors: function(dict) {
      return Major.find({id:dict.get("chosenMajor")});
    },
});