Template.majorPlan.helpers({
    majors: function() {
      return Major.find({id:planSearchDict.get("majorId")});
      // return Major.find({id:"1400"});
    },
});
