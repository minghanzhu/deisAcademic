import fullCalendar from 'fullcalendar';

Template.calendarTest.onCreated(function(){
	this.calendarDict = new ReactiveDict();
})

Template.calendarTest.onRendered(function(){
	const dict = Template.instance().calendarDict;
	$('#calendar').fullCalendar({
        // put your options and callbacks here
        defaultView: 'agendaWeek',
        weekends: false,
        columnFormat: 'dddd', //http://fullcalendar.io/docs/text/columnFormat/
		businessHours: {
			start: '7:00',
			end: '22:30',
			dow: [1, 2, 3, 4, 5]
		}, //http://fullcalendar.io/docs/display/businessHours/
		slotDuration: '00:30:00',
		allDaySlot: false,
		header:false, //http://fullcalendar.io/docs/display/header/
    	minTime: '7:30:00', //http://fullcalendar.io/docs/agenda/minTime/
    	maxTime: '22:30:00', //http://fullcalendar.io/docs/agenda/maxTime/
    	height: 'auto', //http://fullcalendar.io/docs/display/height/
    	contentHeight: 'auto', //http://fullcalendar.io/docs/display/contentHeight/
    	defaultDate: '2000-1-3', //http://fullcalendar.io/docs/current_date/defaultDate/
    	                         //Monday:   2000-1-3
    	                         //Tuesday:  2000-1-4
    	                         //Wednesday:2000-1-5
    	                         //Thursday: 2000-1-6
    	                         //Friday:   2000-1-7
    	editable: false, 
    	eventClick: function(calEvent, jsEvent, view){
    		$('#popup-tab .item').tab();//this initialize the tabs for the popup
    		dict.set("courseId");//this holds the course id of the current chosen event
    		dict.set("courseObj");//this holds the actual course object for the current chosen event
    		dict.set("sectionObj");//this holds the actual section object for the current chosen event
    		dict.set("majorDetail");//this holds the major names and notes for the current chosen event
    		dict.set("instructorsName");//this hold the instructor names and emails for the current chosen event
    		dict.set("sectionChosen")//this hold the boolean value if this section is decided to take by the user
    		dict.set("courseId", calEvent.section_obj.course);
    		dict.set("sectionObj", calEvent.section_obj);
    		dict.set("sectionChosen", calEvent.chosen);
    		//reset the default detail choice to be the second tab. which is the section detail tab
			$("#popup-tab .item.active").attr("class", "item");
			$("#popup-tab [data-tab=first]").attr("class", "item active");
			$(".ui.container.popup-calendar .segment.active").attr("class", "ui bottom attached tab segment");
			$(".ui.container.popup-calendar [tab-num=1]").attr("class", "ui bottom attached tab segment active");

			//then pops up the popup window
			let popup = $(".popup-calendar");
			//this makes sure that the popup in the center of the screen
			popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
			$(".overlay-calendar, .popup-calendar").fadeToggle();
    	},                  
    })
	//this saves the current chosen term
	Template.instance().calendarDict.set("chosenTerm", $(".js-term").val());
})

Template.calendarTest.helpers({
	calendarDict: function(){
		return Template.instance().calendarDict;
	},

	getCourseList: function(){
		return Template.instance().calendarDict.get('courseList');
	},

	pullUserCourseList: function(event){
		const dict = Template.instance().calendarDict;
		if(dict.get("courseList")){
			return;
		};

		Meteor.call("searchCourseWithP", "", "", [], "1400", "", {
            days: [],
            start: "",
            end: ""
        }, false, false,
			function(err, result){
				if(result.length != 0){
					const sorted_result = result.sort(function(a, b) {
    					//for a
        				let course_num_a = parseInt(a.code.match(/\d+/gi)[0]);
						if(course_num_a < 10) course_num_a = "00" + course_num_a;
						if(course_num_a >= 10 && course_num_a < 100) course_num_a = "0" + course_num_a;
						const course_dep_a = a.code.substring(0, a.code.indexOf(" "));
						const last_a = a.code.charAt(a.code.length - 1);
						let comp_string_a;
						if(/\w/i.test(last_a)){
							comp_string_a = course_num_a + last_a;
						} else{
							comp_string_a = course_num_a + "0";
						};

						//for b
						let course_num_b = parseInt(b.code.match(/\d+/gi)[0]);
						if(course_num_b < 10) course_num_b = "00" + course_num_b;
						if(course_num_b >= 10 && course_num_b < 100) course_num_b = "0" + course_num_b;
						const course_dep_b = b.code.substring(0, b.code.indexOf(" "));
						const last_b = b.code.charAt(b.code.length - 1);
						let comp_string_b;
						if(/\w/i.test(last_b)){
							comp_string_b = course_num_b + last_b;
						} else{
							comp_string_b = course_num_b + "0";
						};

        				const major_comp = course_dep_a.localeCompare(course_dep_b);
        				if(major_comp != 0){
        					return major_comp;
        				} else {
        					return comp_string_a.localeCompare(comp_string_b);
        				}
					});
					let current_course = "";
					for(let i = 0; i < sorted_result.length; i++){
						if((sorted_result[i].code) === current_course){
							current_course = sorted_result[i].code;
							sorted_result.splice(i, 1);
							i--;
						};
						current_course = sorted_result[i].code;					
					}
					for(let i = 0; i < sorted_result.length; i++){
						sorted_result[i].index = i;
					};
					dict.set("courseList", sorted_result);
				}
		});
	},

	getContId: function(courseId){
		return Course.findOne({id: courseId}).continuity_id;
	},

	getCode: function(courseId){
		return Course.findOne({id: courseId}).code;
	},

	getCourseInfo: function(){
		const dict = Template.instance().calendarDict;
		const courseId = dict.get("courseId");
		Meteor.call("getCourse", courseId, function(err, result){
			if(err){
				return;
			}

			dict.set("courseObj", result);
		})
	},

	courseInfo: function(){
		return Template.instance().calendarDict.get("courseObj");
	},

	detailReady: function(){
		return !!Template.instance().calendarDict.get("courseObj");
	},

	hasMajorInfo: function(){
		return !!Template.instance().calendarDict.get('majorDetail');
	},

	majorInfo: function(){
		return Template.instance().calendarDict.get('majorDetail');
	},

	getMajorDetails: function(){
		const dict = Template.instance().calendarDict;
		Meteor.call("getMajorDetails", dict.get('courseObj'),
			function(err, result){
				if(err){
					return;
				}
				dict.set('majorDetail', result);
			}
		);
	},

	getReq: function(req_array){
		if(req_array.length == 0){
			return ["/"];
		} else {
			return req_array;
		};
	},

	sectionObj: function(){
		return Template.instance().calendarDict.get('sectionObj');
	},

	profNameLoading: function(section_id){
		return !Template.instance().calendarDict.get("instructorsName");
	},

	getProfInfo: function(prof_list){
		const dict = Template.instance().calendarDict; 
		Meteor.call("getProfInfo", prof_list, function(err, result){
			if(result.includes("Staff")){
				dict.set("instructorsName", "Staff - This information will be updated once Brandeis posts the professor names for this section\n");
			} else {
				dict.set("instructorsName", result);
			}
		});

		return dict.get("instructorsName");
	},

	notFirstTime: function(index){
		return index != 0;
	},

	getSectionDays: function(days_array){
		days = "";
		const day1 = "m";
		const day2 = "tu";
		const day3 = "w";
		const day4 = "th";
		const day5 = "f";
		if($.inArray(day1, days_array) != -1){
			days = days + day1.toUpperCase() + " ";
		}
		if($.inArray(day2, days_array) != -1){
			days = days + day2.toUpperCase() + " ";
		}
		if($.inArray(day3, days_array) != -1){
			days = days + day3.toUpperCase() + " ";
		}
		if($.inArray(day4, days_array) != -1){
			days = days + day4.toUpperCase() + " ";
		}
		if($.inArray(day5, days_array) != -1){
			days = days + day5.toUpperCase() + " ";
		}
		return days;
	},

	convertTime: function(time){
		var min = Math.floor(time % 60);
		if(min < 10){
			min = "0" + min;
		}

		var time = Math.floor(time / 60) + ":" + min;
		return time;
	},

	limitNum: function(limit){
		if(!limit){
			return "999";
		} else {
			return limit;
		}
	},

	sectionReady: function(){
		return !!Template.instance().calendarDict.get('sectionObj');
	},

	isSectionChosen: function(){
		return Template.instance().calendarDict.get('sectionChosen');
	},

	getSageCode: function(sectionId){
		return sectionId.substring(sectionId.indexOf("-") + 1, sectionId.lastIndexOf("-"));
	},
})

Template.calendarTest.events({
	"change .js-term": function(){
		Template.instance().calendarDict.set("chosenTerm", $(".js-term").val());
	},

	"click .overlay-calendar,.js-close-popup" :function(event){
		$(".overlay-calendar, .popup-calendar").fadeToggle();
	},

	"click .js-textbook": function(event){
		event.preventDefault();
		console.log(event);
		const course_id = $(event)[0].target.attributes[1].value;
		const course_code = $(event)[0].target.attributes[3].value;
		const section_num = $(event)[0].target.attributes[2].value;

		window.open("http://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet?bookstore_id-1=1391&term_id-1=" +
			course_id.substring(0, course_id.indexOf("-")) + "&div-1=&dept-1=" +
			course_code.substring(0, course_code.indexOf(" ")) + "&course-1=" +
			course_code.substring(course_code.indexOf(" ") + 1) + "&sect-1=" + section_num);
	},

	"click .js-delete-section": function(event){
		event.preventDefault();
		const dict = Template.instance().calendarDict;
		const section_id = $(event)[0].target.attributes[1].value;
		$("#calendar").fullCalendar('removeEventSource', section_id);
		$(".overlay-calendar, .popup-calendar").fadeToggle();
		$("#calendar").fullCalendar('refetchEvents');
		dict.set("courseId");
    	dict.set("courseObj");
    	dict.set("sectionObj");
    	dict.set("majorDetail");
    	dict.set("instructorsName");
	},

	"click .js-take": function(event){
		const section_id = event.target.attributes[1].value;
		const event_obj = $("#calendar").fullCalendar('clientEvents', [section_id])[0]
		event_obj.chosen = !event_obj.chosen;
		$("#calendar").fullCalendar('updateEvent', event_obj);
		Template.instance().calendarDict.set("sectionChosen", event_obj.chosen);
		$("#calendar").fullCalendar('refetchEvents');
	},
})

Template.scheduleCourseList.onCreated(function(){
	this.schCourseDict = new ReactiveDict();
})

Template.scheduleCourseList.onRendered(function(){
	$('.accordion').accordion();
})

Template.scheduleCourseList.helpers({
	getSections: function(courseContId, dict){
		const courseId = dict.get("chosenTerm") + "-" + courseContId;
		return Meteor.call("getSections", courseId, function(err, result){
			if(err){
				window.alert(err);
				return;
			}
			if(result.length == 0){
				dict.set("sectionInfo" + courseId, "NR");
				return;
			}

			const sorted_result = result.sort(function(a, b) {
    			return a.section - b.section;
			});

			dict.set("sectionInfo" + courseId, sorted_result);
		});
	},

	hasSectionInfo: function(courseContId, dict){
		const courseId = dict.get("chosenTerm") + "-" + courseContId;
		return !!dict.get("sectionInfo" + courseId);
	},

	sectionInfo: function(courseContId, dict){
		const courseId = dict.get("chosenTerm") + "-" + courseContId;
		return dict.get("sectionInfo" + courseId);
	},

	noResult: function(courseContId, dict){
		const courseId = dict.get("chosenTerm") + "-" + courseContId;
		return dict.get("sectionInfo" + courseId) === "NR";
	},

	hasTimes: function(times){
		return times.length != 0;
	},

	getSectionDays: function(days_array){
		days = "";
		const day1 = "m";
		const day2 = "tu";
		const day3 = "w";
		const day4 = "th";
		const day5 = "f";
		if($.inArray(day1, days_array) != -1){
			days = days + day1.toUpperCase() + " ";
		}
		if($.inArray(day2, days_array) != -1){
			days = days + day2.toUpperCase() + " ";
		}
		if($.inArray(day3, days_array) != -1){
			days = days + day3.toUpperCase() + " ";
		}
		if($.inArray(day4, days_array) != -1){
			days = days + day4.toUpperCase() + " ";
		}
		if($.inArray(day5, days_array) != -1){
			days = days + day5.toUpperCase() + " ";
		}
		return days;
	},

	convertTime: function(time){
		var min = Math.floor(time % 60);
		if(min < 10){
			min = "0" + min;
		}

		var time = Math.floor(time / 60) + ":" + min;
		return time;
	},
})

Template.scheduleCourseList.events({
	"click .js-add-section": function(event){
		const section_id = event.target.attributes[1].nodeValue;
		const course_code = event.target.attributes[2].nodeValue;
		const course_name = event.target.attributes[3].nodeValue;
		//start  : '2010-01-09T12:30:00-5:00',this is the format of the time
		Meteor.call("getSection", section_id, function(err, result){
			if(err){
				return;
			};

			if(result.times.length != 0){
				const events_array = [];
				for(let time of result.times){
					for(let day of time.days){
						//turn time from minuets form into a real time form (HH:MM:SS)
						function convertTime(time){
							var min = Math.floor(time % 60);
							if(min < 10){
								min = "0" + min;
							}

							var hr = Math.floor(time / 60);
							if(hr < 10){
								hr = "0" + hr;
							}

							var time = hr + ":" + min + ":00";
							return time;
						};

						//turns day names into date
						function dayNum(day){
							if(day === "m"){
								return "03";
							} else if (day === "tu"){
								return "04";
							} else if (day === "w"){
								return "05";
							} else if (day === "th"){
								return "06";
							} else if (day === "f"){
								return "07";
							}
						};

						const event_obj = {
							id: result.id,//this holds the section id so events at different tiems are associated
							title: course_code,
							start: "2000-01-" + dayNum(day) + "T" + convertTime(time.start) + "-05:00",
							end: "2000-01-" + dayNum(day) + "T" + convertTime(time.end) + "-05:00",
							chosen: false,
							section_obj: result//this hold the actual section object for later use
						};

						events_array.push(event_obj);
					}
				}
				//check if the course has been added
				const event_sources = $("#calendar").fullCalendar('getEventSources')
				for(let source of event_sources){
					for(let event_obj of source.events){
						if(event_obj.id == section_id){
							return;
						}
					}
				}
				//add the source which contains all the events at different times for the same section into the calendar
				$("#calendar").fullCalendar("addEventSource", {
					events: events_array,
					id: result.id
				})

				//this read the current sources and re-render it on the calendar
				$("#calendar").fullCalendar('refetchEvents');
			}
		});
	},

})