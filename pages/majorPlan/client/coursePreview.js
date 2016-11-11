Template.coursePreview.onCreated(function() {
    this.previewDict = new ReactiveDict();
    this.previewDict.set("masterDictSet", false);
    this.previewDict.set("allowed_new_terms", 6);
    this.masterDict = this.data["dict"]; 
    this.calendarDict = this.data["calendarDict"];
    const masterDict = this.masterDict;

    const term_list = Term.find().fetch().sort(function(a, b){
        return parseInt(a.id) - parseInt(b.id);
    });

    //never end with summer term
    let summer_term_obj;
    if(!!term_list[term_list.length - 1].name.match("Summer")){
        summer_term_obj = term_list[term_list.length - 1];
        term_list.splice(term_list.length - 1, 1);
    }

    for(let i = 0; i < this.previewDict.get("allowed_new_terms"); i++){
        const lasted_term = parseInt(term_list[term_list.length - 1].id);
        let new_term;
        if(("" + lasted_term).charAt(3) == 1){
            new_term = lasted_term + 2;//from spring to fall
        } else if(("" + lasted_term).charAt(3) == 3){
            new_term = lasted_term + 8;//from fall to spring
        }
        const year = 2000 + parseInt(("" + new_term).substring(0,3)) - 100;
        let season;
        if(("" + new_term).charAt(3) == 1){
            season = "Spring";
        } else if(("" + new_term).charAt(3) == 3) {
            season = "Fall";
        }
        const name = season + " " + year;

        const term_obj = {
            id: "" + new_term,
            name: name
        }
        term_list.push(term_obj);
    }

    if(summer_term_obj){
        term_list.push(summer_term_obj);
    }

    const result = term_list.sort(function(a, b){
        return parseInt(b.id) - parseInt(a.id);
    });
    this.previewDict.set("term_list", result);

    function getData(f){
        if(f){
            return f;
        } else {
            const start_term = masterDict.get("planStartSemester");
            const end_term = masterDict.get("planEndSemester");

            //first group them by majors, continuity id's and terms.
            const sorted_result = masterDict.get("fetched_courseList").sort(function(a, b) {
                //for a
                let course_num_a = parseInt(a.code.match(/\d+/gi)[0]);
                if (course_num_a < 10) course_num_a = "00" + course_num_a;
                if (course_num_a >= 10 && course_num_a < 100) course_num_a = "0" + course_num_a;
                const course_dep_a = a.code.substring(0, a.code.indexOf(" "));
                const last_a = a.code.charAt(a.code.length - 1);
                const secondLast_a = a.code.charAt(a.code.length - 2);
                let comp_string_a;
                if (/\w/i.test(last_a) && !/\w/i.test(secondLast_a)) {
                    comp_string_a = course_num_a + last_a;
                } else if (!/\w/i.test(last_a) && !/\w/i.test(secondLast_a)) {
                    comp_string_a = course_num_a + "0";
                } else {
                    comp_string_a = course_num_a + last_a + secondLast_a;
                }

                //for b
                let course_num_b = parseInt(b.code.match(/\d+/gi)[0]);
                if (course_num_b < 10) course_num_b = "00" + course_num_b;
                if (course_num_b >= 10 && course_num_b < 100) course_num_b = "0" + course_num_b;
                const course_dep_b = b.code.substring(0, b.code.indexOf(" "));
                const last_b = b.code.charAt(b.code.length - 1);
                const secondLast_b = b.code.charAt(b.code.length - 2);
                let comp_string_b;
                if (/\w/i.test(last_b) && !/\w/i.test(secondLast_b)) {
                    comp_string_b = course_num_b + last_b;
                } else if (!/\w/i.test(last_b) && !/\w/i.test(secondLast_b)) {
                    comp_string_b = course_num_b + "0";
                } else {
                    comp_string_b = course_num_b + last_b + secondLast_b;
                }

                const major_comp = course_dep_a.localeCompare(course_dep_b);
                if (major_comp != 0) {
                    return major_comp;
                } else {
                    const num_comp = a.continuity_id.localeCompare(b.continuity_id);
                    if(num_comp != 0){
                        return num_comp
                    } else {
                        return a.term - b.term;
                    }
                }
            });

            //then drop any of them according to terms
            let current_cont = sorted_result[0].continuity_id;
            let course_group = [];
            const final_result = [];
            for(let i = 0; i < sorted_result.length; i++){
                //keep adding courses that have the same cont id
                if(sorted_result[i].continuity_id === current_cont){
                    course_group.push(sorted_result[i]);
                } else {//current one is not the same course
                    const sorted_group = course_group.sort(function(a, b){
                        return a.term - b.term;//increasing order
                    })

                    //all future terms
                    if(sorted_group[sorted_group.length - 1].term < start_term){
                        final_result.push(sorted_group[sorted_group.length - 1]);
                    } else {
                        for(let course of sorted_group){
                            if(course.term >= start_term && course.term <= end_term){
                                final_result.push(course);
                            }
                        }
                    }

                    current_cont = sorted_result[i].continuity_id;
                    course_group = [sorted_result[i]];
                }

                if(i == sorted_result.length - 1){
                    const sorted_group = course_group.sort(function(a, b){
                        return a.term - b.term;//increasing order
                    })

                    //all future terms
                    if(sorted_group[sorted_group.length - 1].term < start_term){
                        final_result.push(sorted_group[sorted_group.length - 1]);
                    } else {
                        for(let course of sorted_group){
                            if(course.term >= start_term && course.term <= end_term){
                                final_result.push(course);
                            }
                        }
                    }
                }
            }

            //finally sort the result by code
            const sorted_final_result = final_result.sort(function(a, b) {
                //for a
                let course_num_a = parseInt(a.code.match(/\d+/gi)[0]);
                if (course_num_a < 10) course_num_a = "00" + course_num_a;
                if (course_num_a >= 10 && course_num_a < 100) course_num_a = "0" + course_num_a;
                const course_dep_a = a.code.substring(0, a.code.indexOf(" "));
                const last_a = a.code.charAt(a.code.length - 1);
                const secondLast_a = a.code.charAt(a.code.length - 2);
                let comp_string_a;
                if (/\w/i.test(last_a) && !/\w/i.test(secondLast_a)) {
                    comp_string_a = course_num_a + last_a;
                } else if (!/\w/i.test(last_a) && !/\w/i.test(secondLast_a)) {
                    comp_string_a = course_num_a + "0";
                } else {
                    comp_string_a = course_num_a + last_a + secondLast_a;
                }

                //for b
                let course_num_b = parseInt(b.code.match(/\d+/gi)[0]);
                if (course_num_b < 10) course_num_b = "00" + course_num_b;
                if (course_num_b >= 10 && course_num_b < 100) course_num_b = "0" + course_num_b;
                const course_dep_b = b.code.substring(0, b.code.indexOf(" "));
                const last_b = b.code.charAt(b.code.length - 1);
                const secondLast_b = b.code.charAt(b.code.length - 2);
                let comp_string_b;
                if (/\w/i.test(last_b) && !/\w/i.test(secondLast_b)) {
                    comp_string_b = course_num_b + last_b;
                } else if (!/\w/i.test(last_b) && !/\w/i.test(secondLast_b)) {
                    comp_string_b = course_num_b + "0";
                } else {
                    comp_string_b = course_num_b + last_b + secondLast_b;
                }

                const major_comp = course_dep_a.localeCompare(course_dep_b);
                if (major_comp != 0) {
                    return major_comp;
                } else {
                    const num_comp = comp_string_a.localeCompare(comp_string_b);
                    if(num_comp != 0){
                        return num_comp
                    } else {
                        return a.term - b.term;
                    }
                }
            });
            
            //delete duplicate names
            let current_course = "";
            for(let i = 0; i < sorted_final_result.length; i++){
                if((sorted_final_result[i].code.trim()) === current_course){
                    sorted_final_result.splice(i, 1);
                    i--;
                };
                current_course = sorted_final_result[i].code.trim();        
            }  
            
            return sorted_final_result;
        }
    }

    const availableCourseList = getData(masterDict.get("fetched_planSearchData"));
    this.previewDict.set("sorted_fetched_data", availableCourseList);
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

    $(".js-not-save-plan").popup({
        content: "Please log in to save the plan",
        position: "top center"
    })
})

Template.coursePreview.helpers({
    termList: function() {
        const all_term_list = Template.instance().previewDict.get("term_list");
        const termList = all_term_list.sort(function(a, b) {
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
        const calendarDict = Template.instance().calendarDict;
    	const courseList = masterDict.get("scheduleList")[term].courseList;
    	const result = [];
        if(!Term.findOne({id: term})){
            const availableCourseList = Template.instance().previewDict.get("sorted_fetched_data");
            for(let course of courseList){
                if(calendarDict.get("courseFetchInfo")[course]){
                    const course_info_obj = calendarDict.get("courseFetchInfo")[course];
                    if(course_info_obj){
                        result.push(course_info_obj);
                    }
                } else {
                    for(let course_data_obj of availableCourseList.reverse()){
                        if(course_data_obj.continuity_id === course){
                            const course_continuity_id = course_data_obj.continuity_id;
                            const course_code = course_data_obj.code;
                            const course_id = course_data_obj.id;
                            const course_obj = {
                                code: course_code,
                                continuity_id: course,
                                course_id: course_id
                            }
                            result.push(course_obj);

                            if(!calendarDict.get("courseFetchInfo")){
                                const courseFetch_obj = {}
                                courseFetch_obj[course] = course_obj;
                                calendarDict.set("courseFetchInfo", courseFetch_obj);
                            } else {
                                const currentFetch_obj = calendarDict.get("courseFetchInfo");
                                currentFetch_obj[course] = course_obj;
                                calendarDict.set("courseFetchInfo", currentFetch_obj);
                            }
                            break;
                        }
                    }
                }
            }
        } else {
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
        }

    	return result;
    },

    isFutureTerm: function(term){
        return !Term.findOne({id: term});
    },

    getPercentage:function(continuity_id, term){
        if(!Template.instance().masterDict.get("predictionData")[continuity_id]){
            return "N/A"
        }

        const prediction_obj = Template.instance().masterDict.get("predictionData")[continuity_id][term];
        if(!prediction_obj){
            return "N/A";
        }

        const percentage = prediction_obj.percentage;
        if(percentage == 1){
            return "99%"
        } else if(percentage == 0){
            return "1%"
        } else {
            if(Math.round(prediction_obj.percentage * 100) == 100){
                return "99%"
            } else if(Math.round(prediction_obj.percentage * 100) == 0){
                return "1%"
            } else {
                return Math.round(prediction_obj.percentage * 100) + "%";
            }
        }
    },

    sameUser: function(){
        if(!MajorPlansPnc.findOne()){
            return false;
        }
        
        return MajorPlansPnc.findOne().userId === Meteor.userId();
    },

    isNewPlan: function(){
        return !Template.instance().masterDict.get("isModify");
    },

    unavailableSection: function(section_id){
        return $.inArray(section_id, Template.instance().masterDict.get("unavailableSections")) == -1;
    },

    getSageCode: function(section_id){
        return section_id.substring(section_id.indexOf("-") + 1, section_id.lastIndexOf("-"));
    },
})

Template.coursePreview.events({
	"click .js-clear-termCourse": function(event){
		const term = event.target.parentElement.parentElement.parentElement.parentElement.attributes[1].nodeValue;
		const schedule_list = Template.instance().masterDict.get("scheduleList");
        const courseList = schedule_list[term]["courseList"];

        if(typeof courseList[0] === "string"){//future courses
            for(let continuity_id of courseList){
                const addedCourses = Template.instance().masterDict.get("addedCourses");
                addedCourses.splice($.inArray(continuity_id, addedCourses), 1);
                Template.instance().masterDict.set("addedCourses", addedCourses);
            }
        } else {
            for(let section of courseList){
                const section_obj = section.events[0].section_obj;
                const course_id = section_obj.course;
                const continuity_id = course_id.substring(course_id.indexOf("-") + 1);
                const addedCourses = Template.instance().masterDict.get("addedCourses");
                addedCourses.splice($.inArray(continuity_id, addedCourses), 1);
                Template.instance().masterDict.set("addedCourses", addedCourses);
            }
        }

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
        const course_id = event.target.attributes[3].nodeValue;
        const continuity_id = course_id.substring(course_id.indexOf("-") + 1);
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

        const addedCourses = Template.instance().masterDict.get("addedCourses");
        addedCourses.splice($.inArray(continuity_id, addedCourses), 1);
        Template.instance().masterDict.set("addedCourses", addedCourses);
	},

    "click .js-remove-future-course": function(event){
        const continuity_id = event.target.attributes[1].nodeValue;
        const term = event.target.attributes[2].nodeValue;
        const term_schedule = Template.instance().masterDict.get("scheduleList")[term];
        const courseList = term_schedule.courseList;
        for(var i = 0; i < courseList.length; i++){
            if(courseList[i] === continuity_id){
                courseList.splice(i, 1);
                break;
            }
        }
        term_schedule.courseList = courseList;
        const previous_schedule = Template.instance().masterDict.get("scheduleList");
        previous_schedule[term] = term_schedule;
        Template.instance().masterDict.set("scheduleList", previous_schedule);

        const addedCourses = Template.instance().masterDict.get("addedCourses");
        addedCourses.splice($.inArray(continuity_id, addedCourses), 1);
        Template.instance().masterDict.set("addedCourses", addedCourses);
    },

	"click .js-view-detail": function(event){
		//make sure it's not the remove icon gets clicked
		if(event.target.nodeName === "DIV"){
			const dict = Template.instance().calendarDict;
            dict.set("isFutureTerm", false);
			const term = event.currentTarget.parentElement.parentElement.parentElement.attributes[1].nodeValue;
			const section_id = event.currentTarget.children[0].attributes[1].nodeValue;
			const term_schedule = Template.instance().masterDict.get("scheduleList")[term];
			const courseList = term_schedule.courseList;
			let course_id, section_obj, is_chosen;
			for(let course of courseList){
				if(course.id === section_id){
					course_id = course.events[0].section_obj.course;
					section_obj = course.events[0].section_obj;
					is_chosen = course.chosen;
					break;
				}
			}

			$('#popup-tab .item').tab(); //this initialize the tabs for the popup
            dict.set("courseId"); //this holds the course id of the current chosen event
            dict.set("courseObj"); //this holds the actual course object for the current chosen event
            dict.set("sectionObj"); //this holds the actual section object for the current chosen event
            dict.set("majorDetail"); //this holds the major names and notes for the current chosen event
            dict.set("instructorsName"); //this hold the instructor names and emails for the current chosen event
            dict.set("sectionChosen") //this hold the boolean value if this section is decided to take by the user
            dict.set("historyReady", false);
            dict.set("courseId", course_id);
            dict.set("sectionObj", section_obj);
            dict.set("sectionChosen", is_chosen);
            //reset the default detail choice to be the second tab. which is the section detail tab
            $("#popup-tab .item.active").attr("class", "item");
            $("#popup-tab [data-tab=first]").attr("class", "item active");
            $(".ui.container.popup-calendar .segment.active").attr("class", "ui bottom attached tab segment");
            $(".ui.container.popup-calendar [tab-num=1]").attr("class", "ui bottom attached tab segment active");

            //then pops up the popup window
            let popup = $(".popup-calendar");
            $('.popup-calendar').css("top", 40 + $(window).scrollTop());
            if($(window).width() < 768){
                $('.popup-calendar').css("left", -55);
            } else {
                $('.popup-calendar').css("left", (($(".move").width() - $('.popup-calendar').width()) / 2) - 80);
            }
            $(".overlay-calendar, .popup-calendar").fadeToggle();
		}
	},

    "click .js-view-future-detail": function(event){
        //make sure it's not the remove icon gets clicked
        if(event.target.nodeName === "DIV"){
            const dict = Template.instance().calendarDict;
            dict.set("isFutureTerm", true);
            const continuity_id = event.currentTarget.attributes[1].nodeValue; 

            let courseId;
            if(dict.get("courseFetchInfo")[continuity_id]){
                courseId = dict.get("courseFetchInfo")[continuity_id].course_id;
            } else {
                const availableCourseList = Template.instance().masterDict.get("fetched_courseList");
                for(let course of availableCourseList){
                    if(course.continuity_id === continuity_id){
                        courseId = course.id;
                        break;
                    }
                }
            }

            $('#popup-tab .item').tab(); //this initialize the tabs for the popup
            dict.set("courseId"); //this holds the course id of the current chosen event
            dict.set("courseObj"); //this holds the actual course object for the current chosen event
            dict.set("sectionObj"); //this holds the actuazl section object for the current chosen event
            dict.set("majorDetail"); //this holds the major names and notes for the current chosen event
            dict.set("instructorsName"); //this hold the instructor names and emails for the current chosen event
            dict.set("sectionChosen") //this hold the boolean value if this section is decided to take by the user
            dict.set("historyReady", false);
            dict.set("courseId", courseId);
            
            //reset the default detail choice to be the second tab. which is the section detail tab
            $("#popup-tab .item.active").attr("class", "item");
            $("#popup-tab [data-tab=second]").attr("class", "item active");
            $(".ui.container.popup-calendar .segment.active").attr("class", "ui bottom attached tab segment");
            $(".ui.container.popup-calendar [tab-num=2]").attr("class", "ui bottom attached tab segment active");

            //then pops up the popup window
            let popup = $(".popup-calendar");
            $('.popup-calendar').css("top", 40 + $(window).scrollTop());
            if($(window).width() < 768){
                $('.popup-calendar').css("left", -55);
            } else {
                $('.popup-calendar').css("left", (($(".move").width() - $('.popup-calendar').width()) / 2) - 80);
            }
            $(".overlay-calendar, .popup-calendar").fadeToggle();
        }
    },
})