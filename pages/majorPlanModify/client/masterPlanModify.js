Template.masterPlanModify.onCreated(function(){
	this.masterPageDict = new ReactiveDict();
	this.masterPageDict.set("pageName", "makeSchedule");
	window.onbeforeunload = function (e) {
        var e = e || window.event;
        var msg = "If you leave this page, you'll lose all the major plan data"

        // For IE and Firefox
        if (e) {
            e.returnValue = msg;
        }

        // For Safari / chrome
        return msg;
    };
})

Template.masterPlanModify.helpers({
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