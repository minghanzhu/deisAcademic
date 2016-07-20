import fullCalendar from 'fullcalendar';

Template.calendarTest.onCreated(function(){
	this.calendarDict = new ReactiveDict();
	/*
	this.calendarDict.set('courseList', [
		"1163-001651", //COSI 11A, 1163
		"1163-005186", //MATH 10a, 1163
		"1163-005363", //MUS 101A, 1163
	]);*/
})

Template.calendarTest.onRendered(function(){
	$('#courseList .fluid.ui.button').each(function() {
		// store data so the calendar knows to render an event upon drop
		$(this).data('event', {
			title: $.trim($(this).text()), // use the element's text as the event title
			stick: true // maintain when user navigates (see docs on the renderEvent method)
		});

		// make the event draggable using jQuery UI
		$(this).draggable({
			zIndex: 999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0,  //  original position after the drag
			cancel: false,
			containment: "window"
		});
	});

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
    	editable: true,
		droppable: true, // this allows things to be dropped onto the calendar
		drop: function() {
			// is the "remove after drop" checkbox checked?
			if ($('#drop-remove').is(':checked')) {
				// if so, remove the element from the "Draggable Events" list
				$(this).remove();
			}
		}                         
    })
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
			console.log("called!")
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


})

Template.calendarTest.events({
	"change .js-term": function(){
		Template.instance().calendarDict.set("chosenTerm", $(".js-term").val());
	}
	/*
	"click .js-create-event": function(event){
		event.preventDefault();
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
					console.log(sorted_result);
				}
		});
	},*/
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
	}
})