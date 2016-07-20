Template.skelSched.onCreated(function() {
  //default the term to fall 2016
  Session.set("selectedTerm", "fall16");
  schedDict = new ReactiveDict();
  schedDict.setDefault({
    "sectToCourse": new Map(),
  })
})

Template.skelSched.onRendered(function () {
  $('.top.menu .item').tab({
    'onLoad': function(){
      var term = $(".item.active")[0].id;
      // console.log(term);
      Session.set("selectedTerm", term);
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

Template.skelSched.helpers({
  fillCourses: function(){
    const theTerm = Session.get("selectedTerm");
    return UserTerms.findOne({term: theTerm});
  },
})

// $('#courseList').checkbox({
  // 'onChange': function(){
  //   console.log("yay");
  //   var checked = $('#courseList input:checkbox:checked.id');
  //   console.log(checked);
  //   UserTerms.insert({term:Session.get("selectedTerm"), course:checked})
  // }
// });

// Template.courseChecklist.onRendered(function(){
//   //enable checkboxes
//  $('.ui.checkbox').checkbox();
// })
//
//
// Template.courseChecklist.helpers({
//   pickedCourses: function(){
//     //returns courses user has picked on previous major planning pages
//     return UserPicks.find();
//   },
//
//   theTerm: function(){
//     //tracks term currently selected by user
//     return Session.get("selectedTerm");
//   },
//
//   theSections: function(){
//
//     //ARRAY OF COURSES TO ARRAY OF THEIR SECTIONS
//
//     var sectOpts = [];
//
//     var cursor = UserPicks.find();
//
//     // combo = schedDict.get("sectToCourse");
//     combo = {};
//
//     combo2 = {};
//
//     cursor.forEach(function(course){
//
//       combo2[course.name] = [];
//
//       var sectCursor = Section.find({course: course.id});
//
//       sectCursor.forEach(function(sect) {
//         // console.log(sect);
//         sectOpts.push(sect);
//         combo[sect.id] = course.name;
//         combo2[course.name].push(sect.id);
//       })
//     })
//
//     console.log(sectOpts);
//     console.log(combo);
//     console.log(combo2);
//
//     // theMap = new Map(combo);
//     // console.log(theMap);
//
//     schedDict.set("sectToCourse", combo);
//
//     console.log(sectOpts);
//
//     return sectOpts;
//   },
//
//   sectLink: function(sect){
//     const sectId = sect.hash.sect
//     // console.log(sect.hash.sect);
//     var mapTest = schedDict.get("sectToCourse");
//     // console.log(mapTest);
//     console.log(mapTest[sectId]);
//     return mapTest[sectId];
//   }
// })
//
// Template.courseChecklist.events({
//   "click .js-addCourse": function(event, instance){
//
//     const term = Session.get("selectedTerm");
//     const courseId = event.target.value;
//     const course = Course.findOne({id: courseId});
//
//     if (event.target.checked) {
//       // console.log("checked");
//       Meteor.call("addCourse", {term: term, course: course});
//     }
//     else if (!event.target.checked){
//       // console.log("unchecked")
//       Meteor.call("removeCourse", {term: term, course:course});
//     }
//
//     // console.log(this);
//     //
//     // console.log(event.target.id);
//     // console.log(event.target.checked);
//     // console.log(event.target.value);
//
//     // UserTerms.insert({term: term, course: course});
//   },
//   //
//   // "click .js-pickTerm": function(event,instance){
//   //   Session.set("selectedTerm", $(".js-pickTerm").val());
//   //   console.log(Session.get("selectedTerm"));
//   // },
//
// })
