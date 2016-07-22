Template.masterMajorPlan.onCreated(function(){
	this.masterPageDict = new ReactiveDict();
	this.masterPageDict.set("pageName", "typeMajor");
})

Template.masterMajorPlan.helpers({
	"typeMajor": function(){
		return Template.instance().masterPageDict.get("pageName") === "typeMajor";
	},

	"helpChooseMajor": function(){
		return Template.instance().masterPageDict.get("pageName") === "helpChooseMajor";
	},

	"chooseCourse": function(){
		return Template.instance().masterPageDict.get("pageName") === "chooseCourse";
	},

	"makeSchedule": function(){
		return Template.instance().masterPageDict.get("pageName") === "makeSchedule";
	},

	masterDict: function(){
		return Template.instance().masterPageDict
	},
})

Template.masterMajorPlan.events({

})