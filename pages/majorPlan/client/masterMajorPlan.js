Template.masterMajorPlan.onCreated(function(){
	this.masterPageDict = new ReactiveDict();

	if(this.data){
		const data = this.data["plan_obj"];

		if(!data){
	   		window.alert("No such plan.");
	    	Router.go('/');
	    	return;
		}

		const chosenCourse = data.chosenCourse;
		const chosenMajor = data.majorId;
		this.masterPageDict.set("chosenCourse", chosenCourse);
		this.masterPageDict.set("chosenMajor", chosenMajor);
		this.masterPageDict.set("courseList", chosenCourse);
		
		this.masterPageDict.set("planStartSemester", data.start_term);
	    this.masterPageDict.set("planEndSemester", data.end_term);
	    this.masterPageDict.set("isModify", true);


	    const current_plan_id = Router.current().params._id;
        const scheduleList = MajorPlansPnc.findOne(current_plan_id).scheduleList;
        const masterDict = this.masterPageDict;

        Meteor.call("fetchScheduleList", scheduleList, function(err, result) {
            if (err) {
                window.alert(err.message);
                return;
            };
            const fetched_scheduleList = {};
            for (let term in result) { //go through each term in the result
                const courseList = [];
                const term = term;
                for (let section in result[term]) {
                    const result_obj = result[term][section];
                    const section_obj = result_obj.object;
                    const chosen = result_obj.chosen;
                    const course_code = result_obj.courseCode;
                    const events_array = [];
                    for (let time of section_obj.times) {
                        for (let day of time.days) {
                            //turn time from minuets form into a real time form (HH:MM:SS)
                            function convertTime(time) {
                                var min = Math.floor(time % 60);
                                if (min < 10) {
                                    min = "0" + min;
                                }

                                var hr = Math.floor(time / 60);
                                if (hr < 10) {
                                    hr = "0" + hr;
                                }

                                var time = hr + ":" + min + ":00";
                                return time;
                            };

                            //turns day names into date
                            function dayNum(day) {
                                if (day === "m") {
                                    return "03";
                                } else if (day === "tu") {
                                    return "04";
                                } else if (day === "w") {
                                    return "05";
                                } else if (day === "th") {
                                    return "06";
                                } else if (day === "f") {
                                    return "07";
                                }
                            };

                            const event_obj = {
                                id: section, //this holds the section id so events at different tiems are associated
                                title: course_code,
                                start: "2000-01-" + dayNum(day) + "T" + convertTime(time.start) + "-05:00",
                                end: "2000-01-" + dayNum(day) + "T" + convertTime(time.end) + "-05:00",
                                section_obj: section_obj //this hold the actual section object for later use
                            };

                            events_array.push(event_obj);
                        }
                    }

                    const source = {
                        chosen: chosen,
                        id: section,
                        events: events_array
                    }

                    courseList.push(source);
                }

                fetched_scheduleList[term] = {
                    term: term,
                    courseList: courseList
                }
            }

            
            const futureList = MajorPlansPnc.findOne(current_plan_id).futureList;
            for(let future_schedule of futureList){
            	fetched_scheduleList[future_schedule.term] = {
            		term: future_schedule.term,
            		courseList: future_schedule.courseList
            	}
            }

            masterDict.set("scheduleList", fetched_scheduleList);
            masterDict.set("pageName", "makeSchedule");
        });
	} else {
		this.masterPageDict.set("pageName", "typeMajor");
	}
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

	"changeTerm": function(){
		return Template.instance().masterPageDict.get("pageName") === "changeTerm";
	},

	masterDict: function(){
		return Template.instance().masterPageDict
	},
})
