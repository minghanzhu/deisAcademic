Template.coursePreview.onCreated(function() {
    this.previewDict = new ReactiveDict();
    this.previewDict.set("masterDictSet", false);
    this.masterDict = this.data["dict"]; 
})

Template.coursePreview.onRendered(function() {
    const masterDict = this.masterDict;
    $('.ui.dropdown').dropdown({
        action: 'hide',
    });
    
    if(masterDict.get("chosenTerm")){
    	const term = masterDict.get("chosenTerm");
    	$(".ui.four.cards .checkbox[id='" + term + "']").checkbox("set checked");
    } else {
    	$($(".ui.four.cards .checkbox")[0]).checkbox("toggle");
    	const term = $(".ui.four.cards .checkbox.checked")[0].attributes[1].nodeValue;
    	masterDict.set("chosenTerm", term);
    }

    setTimeout(function() {
    	$('.ui.four.cards .ui.checkbox').checkbox({
    		beforeChecked: function(){
    			$(".ui.four.cards .checkbox.checked").checkbox("set unchecked");
    		},

    		onChecked: function(){
    			const term = $(".ui.four.cards .checkbox.checked")[0].attributes[1].nodeValue;
    			masterDict.set("chosenTerm", term);
    		},

    		uncheckable: false,
    	});
    }, 100);
})

Template.coursePreview.helpers({
    termList: function() {
        const termList = Term.find().fetch().sort(function(a, b) {
            return parseInt(a.id) - parseInt(b.id);
        });

        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        for (let i = 0; i < termList.length; i++) {
            if (termList[i].id > end_semester || termList[i].id < start_semester) {
                termList.splice(i, 1);
                i--;
            }
        }

        return termList;
    },

    getAllChosenCourses: function() {
        const availableCourseList = Template.instance().masterDict.get("fetched_courseList");
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        const courseList = []
        let currentCourse = ""
        for (let course of availableCourseList) {
            if (course.continuity_id !== currentCourse && course.term >= start_semester && course.term <= end_semester) {
                courseList.push(course);
                currentCourse = course.continuity_id;
            }
        }

        return courseList;
    },

    courseReady: function(){
    	return Template.instance().masterDict.get("fetched_courseList");
    },

    hasCourse: function(term){
    	const masterDict = Template.instance().masterDict;
    	if(!masterDict.get("scheduleList")[term]){
    		return false
    	}
    	const courseList = masterDict.get("scheduleList")[term].courseList;
    	return courseList.length != 0;
    },

    termCourseList: function(term){
    	const masterDict = Template.instance().masterDict;
    	const courseList = masterDict.get("scheduleList")[term].courseList;
    	const result = [];
    	for(let course of courseList){
    		const events_array = course.events;
    		const course_id = events_array[0].section_obj.course;
    		const course_code = events_array[0].title;
    		const section_id = course.id;
    		const course_obj = {
    			id: course_id,
    			code: course_code,
    			section_id: section_id,
    			section_obj: events_array[0].section_obj
    		}
    		result.push(course_obj);
    	}

    	return result;
    },
})

Template.coursePreview.events({
	"click .js-clear-termCourse": function(event){
		const term = event.target.parentElement.parentElement.parentElement.parentElement.attributes[1].nodeValue;
		const schedule_list = Template.instance().masterDict.get("scheduleList");
		schedule_list[term] = {
			term: term,
			courseList: []
		};
		Template.instance().masterDict.set("scheduleList", schedule_list);
	},

	"click .js-view-termCourse": function(event){
		const term = event.target.parentElement.parentElement.parentElement.parentElement.attributes[1].nodeValue;
		Template.instance().masterDict.set("chosenTerm", term);
		const current_state = Template.instance().data["calendarDict"].get("viewCalendar");
		Template.instance().data["calendarDict"].set("viewCalendar", !current_state);
	},

	"click .js-remove-course": function(event){
		const section_id = event.target.attributes[1].nodeValue;
		const term = event.target.attributes[2].nodeValue;
		const term_schedule = Template.instance().masterDict.get("scheduleList")[term];
		const courseList = term_schedule.courseList;
		for(var i = 0; i < courseList.length; i++){
			if(courseList[i].id === section_id){
				courseList.splice(i, 1);
				break;
			}
		}
		term_schedule.courseList = courseList;
		const previous_schedule = Template.instance().masterDict.get("scheduleList");
		previous_schedule[term] = term_schedule;
		Template.instance().masterDict.set("scheduleList", previous_schedule);
	}
})