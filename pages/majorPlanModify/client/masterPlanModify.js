Template.masterPlanModify.onCreated(function(){
	this.masterPageDict = new ReactiveDict();
	this.masterPageDict.set("dataReady", false);
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

	setData: function(data){
		const chosenCourse = data.chosenCourse;
		const chosenMajor = data.majorId;
		Template.instance().masterPageDict.set("chosenCourse", chosenCourse);
		Template.instance().masterPageDict.set("chosenMajor", chosenMajor);
		Template.instance().masterPageDict.set("courseList", chosenCourse);
		Template.instance().masterPageDict.set("pageName", "makeSchedule");
		Template.instance().masterPageDict.set("dataReady", true);
		Template.instance().masterPageDict.set("planStartSemester", data.start_term);
        Template.instance().masterPageDict.set("planEndSemester", data.end_term);
	},

	dataReady: function(){
		return Template.instance().masterPageDict.get("dataReady");
	}
})