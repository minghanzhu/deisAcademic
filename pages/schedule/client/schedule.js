Template.schedule.onCreated(function(){
	this.masterPageDict = new ReactiveDict();
	this.masterPageDict.set("dataReady", false);
})

Template.schedule.helpers({
	"makeSchedule": function(){
		return Template.instance().masterPageDict.get("pageName") === "makeSchedule";
	},

	masterDict: function(){
		return Template.instance().masterPageDict
	},

	setData: function(data){
		Template.instance().masterPageDict.set("pageName", "makeSchedule");
		Template.instance().masterPageDict.set("dataReady", true);
	},

	dataReady: function(){
		return Template.instance().masterPageDict.get("dataReady");
	},

	notLogin: function(){
		window.alert("Please login to see your schedule");
		Router.go('/')
	},
})