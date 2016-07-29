Template.majorSelect.onCreated(function(){
	this.majorSelectDict = new ReactiveDict();
	this.majorSelectDict.set("clickedGo", false);
	this.majorSelectDict.set("clickedHelp", false);
})

Template.majorSelect.onRendered(function(){
	$('#search-select').dropdown();
  	const major = $("#search-select input").val();

});

Template.majorSelect.helpers({
	clickedGo: function(dict){
		if(!$("#search-select input").val()){
			window.alert("Please choose a major. \n Or click the button below.");
			return;
		};
		dict.set("pageName", "chooseCourse");
		dict.set("chosenMajor", $("#search-select input").val());
	},

	hasClickedGo: function(){
		return Template.instance().majorSelectDict.get("clickedGo");
	},

	clickedHelp: function(dict){
		
		dict.set("pageName", "helpChooseMajor");
		dict.set("chosenMajor", $("#search-select input").val());
	},

	hasClickedHelp: function(){
		return Template.instance().majorSelectDict.get("clickedHelp");
	},

	setMasterDict: function(dict){//this saves the master dict to the template
		Template.instance().masterDict = dict;
	},
})

Template.majorSelect.events({
  	"click .js-majorGo": function(){
    	event.preventDefault();
    	if(!$("#search-select input").val()){
			window.alert("Please choose a major. \nOr click the button below.");
			return;
		};
		Template.instance().majorSelectDict.set("clickedGo", true);
  	},

  	"click .js-majorBulletin": function(){
    	event.preventDefault();
		Template.instance().majorSelectDict.set("clickedHelp", true);
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
		return Major.findOne({name: homeDict.get('majorName')});
	},	
});


Template.majorList.events({
	"click .bulletin-overlay,.js-close-popup": function(event){
		$(".bulletin-overlay, .popup-bulletin").fadeToggle();
	},
});

Template.science.events({
	"click .js-popup": function(event) {
		const name = event.target.innerText;
		console.log(name);
		homeDict.set('majorName', name);
		let popup = $(".popup-bulletin");
		popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
		$(".bulletin-overlay, .popup-bulletin").fadeToggle();
	},
});