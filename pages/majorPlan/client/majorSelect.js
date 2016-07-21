Template.majorSelect.onRendered(function(){
	$('#search-select').dropdown();
  const major = $("#search-select input").val();

});

Template.majorSelect.events({
  "click .js-majorGo": function(){
    event.preventDefault();
		const majorId = $("#search-select input").val();
		// console.log(majorId);
		planSearchDict.set("majorId", majorId);
		Router.go('majorPlan');
  },

  "click .js-majorBulletin": function(){
    event.preventDefault();
    Router.go('majorList');
  },
});


Template.majorList.helpers({
    scienceMajor: function() {
      return Major.find({school: "School of Science"});
    },

		social: function() {
			return Major.find({school: "School of Social Science"});
		},

		humanities: function() {
			return Major.find({school: "School of Humanities"});
		},

		major: function() {
			// return Major.find({name: homeDict.get('majorName')}).fetch()[0];
			return Major.findOne({name: homeDict.get('majorName')});
		}
});


Template.majorList.events({
	"click .bulletin-overlay,.js-close-popup": function(event){
		$(".bulletin-overlay, .popup-bulletin").fadeToggle();
	},
});

Template.science.events({

	"click .js-popup": function(event) {
		// const name = $(event);
		const name = event.target.innerText;
		console.log(name);
		homeDict.set('majorName', name);
		let popup = $(".popup-bulletin");
		popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
		$(".bulletin-overlay, .popup-bulletin").fadeToggle();
	},


});
