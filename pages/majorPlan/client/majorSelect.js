Template.majorSelect.onRendered(function(){
	$('#search-select').dropdown();
  const major = $("#search-select input").val();

})

Template.majorSelect.events({
  "click .js-majorgo": function(){
    event.preventDefault();
    // Router.go('decidemajor');
  },

  "click .js-majorhelp": function(){
    event.preventDefault();
    Router.go('decidemajor');
  },
})


/*
Template.decidemajor.helpers({
  	majors: function(){return Major.find();},
})


Template.decidemajor.events({

})*/
