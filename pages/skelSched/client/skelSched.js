Template.skelSched.onCreated(function() {
  //default the term to fall 2016
  Session.set("selectedTerm", "fall16");
  // checkList = new ReactiveDict();
  // checkList.setDefault({
  //   fall16: [],
  // })
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
    return Session.get("selectedTerm");
  },
})

Template.courseChecklist.events({
  "click .js-addCourse": function(event, instance){

    const term = Session.get("selectedTerm");
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
