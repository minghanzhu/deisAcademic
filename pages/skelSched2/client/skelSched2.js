planDict = new ReactiveDict();
planDict.setDefault({
  "chosenCourse": ["001651","001722"],
  "selectedTerm": "fall16",
})


Template.skelSched2.onCreated(function() {
  //default the term to fall 2016
  Session.set("selectedTerm", "fall16");
  schedDict = new ReactiveDict();
  schedDict.setDefault({
    "sectToCourse": new Map(),
  })




})

Template.skelSched2.onRendered(function () {
  $('.top.menu .item').tab({
    'onLoad': function(){
      var term = $(".item.active")[0].id;
      // console.log(term);
      planDict.set("selectedTerm", term);
    },

    //
    // 'onVisible': function(){
    //   var term = $(".item.active")[0].id;
    //   // console.log(term);
    //   for (checkbox in "#courseList") {
    //     console.log(checkbox.value);
    //   }
    // }
  })
})

Template.skelSched2.helpers({

  theCourse: function(){
    const currCourse = planDict.get("chosenCourse");
    return currCourse[0];
  },

  getSects: function(){
    const term = "1163";
    // console.log(planDict.get("chosenCourse"));
    const courseCursor = planDict.get("chosenCourse");
    // console.log(courseCursor);
    var tempSects = [];
    courseCursor.forEach(function(item) {
      tempSects.push(Section.find({course: term + "-" + item}).fetch());
    })
    // const tempSects = Section.find({course: term + "-" + currCourse[0]});

    // console.log(tempSects);

    return tempSects;
  },

  fillCourses: function(){
    const theTerm = planDict.get("selectedTerm");
    return UserTerms.findOne({term: theTerm});
  },

  termCourses: function(){
    var cursor;
  }
})

// $('#courseList').checkbox({
// 'onChange': function(){
//   console.log("yay");
//   var checked = $('#courseList input:checkbox:checked.id');
//   console.log(checked);
//   UserTerms.insert({term:Session.get("selectedTerm"), course:checked})
// }
// });

Template.courseChecklist.onRendered(function(){
  //enable checkboxes
  $('.ui.checkbox').checkbox();
})


Template.courseChecklist.helpers({
  pickedCourses: function(){
    //returns courses user has picked on previous major planning pages
    return UserPicks.find();
  },

  theTerm: function(){
    //tracks term currently selected by user
    return planDict.get("selectedTerm");
  },

  getSects: function(cid){
    // console.log(cid);
    const courseContId = cid.hash.cid;
    // console.log(courseContId);
    const term = "1163";
    const cursor = Section.find({course: term + "-" + courseContId});
    return cursor;
  },

  getCourseName: function(theId){
    const courseContId = theId.hash.theId;
    const courseObj = Course.findOne({continuity_id: courseContId});
    if (courseObj){
      const courseName = courseObj.name;
      return courseName;
    }
  },

  courseDiv: function(){
    return planDict.get("chosenCourse");
  },

  // theSections: function(){
  //
  //   //ARRAY OF COURSES TO ARRAY OF THEIR SECTIONS
  //
  //
  //   const term = "1163";
  //   console.log(planDict.get("chosenCourse"));
  //
  //   // var tempSects = [];
  //   // courseCursor.forEach(function(item) {
  //   //   tempSects.push(Section.find({course: term + "-" + item}).fetch());
  //   // })
  //   // // const tempSects = Section.find({course: term + "-" + currCourse[0]});
  //   //
  //   // console.log(tempSects);
  //   //
  //   // return tempSects;
  //
  //   var sectOpts = [];
  //
  //   const courseCursor = planDict.get("chosenCourse");
  //
  //   // combo = schedDict.get("sectToCourse");
  //   combo = {};
  //
  //   combo2 = {};
  //
  //   courseCursor.forEach(function(courseContId){
  //
  //     const courseName = "Cont. ID: " + courseContId;
  //
  //     combo2[courseName] = [];
  //
  //     var sectCursor = Section.find({course: term + "-" + courseContId});
  //
  //     sectCursor.forEach(function(sect) {
  //       // console.log(sect);
  //       sectOpts.push(sect);
  //       combo[sect.id] = courseContId;
  //       combo2[courseName].push(sect);
  //     })
  //   })
  //
  //   // console.log(sectOpts);
  //   // console.log(combo);
  //   console.log(combo2);
  //
  //   // theMap = new Map(combo);
  //   // console.log(theMap);
  //
  //   planDict.set("sectToCourse", combo2);
  //
  //   // console.log(sectOpts);
  //
  //   return combo2;
  // },
  // secid:function(){
  //   console.log(this);
  //   return this;
  // },
  // sectLink: function(sect){
  //   const sectId = sect.hash.sect
  //   // console.log(sect.hash.sect);
  //   var mapTest = schedDict.get("sectToCourse");
  //   // console.log(mapTest);
  //   console.log(mapTest[sectId]);
  //   return mapTest[sectId];
  // },
  //
  // testing: function(){
  //
  //   //ARRAY OF COURSES TO ARRAY OF THEIR SECTIONS
  //
  //   var sectOpts = [];
  //
  //   var cursor = UserPicks.find();
  //
  //   // combo = schedDict.get("sectToCourse");
  //   combo = {};
  //
  //   combo2 = {};
  //
  //   cursor.forEach(function(course){
  //
  //     combo2[course.name] = [];
  //
  //     var sectCursor = Section.find({course: course.id});
  //
  //     sectCursor.forEach(function(sect) {
  //       // console.log(sect);
  //       sectOpts.push(sect);
  //       combo[sect.id] = course.name;
  //       combo2[course.name].push(sect.id);
  //     })
  //   })
  //
  //   console.log(sectOpts);
  //   console.log(combo);
  //   console.log(combo2);
  // }
})

Template.courseChecklist.events({
  "click .js-addCourse": function(event, instance){

    const term = planDict.get("selectedTerm");
    const courseId = event.target.value;
    const course = Course.findOne({id: courseId});

    if (event.target.checked) {
      // console.log("checked");
      Meteor.call("addCourse", {term: term, course: course});
    }
    else if (!event.target.checked){
      // console.log("unchecked")
      Meteor.call("removeCourse", {term: term, course:course});
    }

    // console.log(this);
    //
    // console.log(event.target.id);
    // console.log(event.target.checked);
    // console.log(event.target.value);

    // UserTerms.insert({term: term, course: course});
  },
  //
  // "click .js-pickTerm": function(event,instance){
  //   Session.set("selectedTerm", $(".js-pickTerm").val());
  //   console.log(Session.get("selectedTerm"));
  // },

})
