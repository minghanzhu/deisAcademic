Template.majorPlan.helpers({
    majors: function(dict) {
      return Major.find({id:dict.get("chosenMajor")});
      // return Major.find({id:"1400"});
    },
});
