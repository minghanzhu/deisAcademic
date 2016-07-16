Template.skelSched.onRendered(function () {
  $('.top.menu .item').tab({
    'onLoad': function(){
      var act = $(".item.active")[0].id;
      console.log(act);
      Session.set("selectedTerm", act);
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
})

Template.courseChecklist.onRendered(function(){
 $('.ui.checkbox').checkbox();
})


Template.courseChecklist.helpers({
  pickedCourses: function(){
    return UserPicks.find();
  },

  theTerm: function(){
    return Session.get("selectedTerm");
  }
})

Template.courseChecklist.events({
  "click .js-addCourse": function(event, instance){

    console.log(event.target.id);
  },
  //
  // "click .js-pickTerm": function(event,instance){
  //   Session.set("selectedTerm", $(".js-pickTerm").val());
  //   console.log(Session.get("selectedTerm"));
  // },


})
