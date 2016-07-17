//Global reactive-dict
homeDict = new ReactiveDict();
homeDict.set('showTable', false);
homeDict.set('majorDetail', []);
homeDict.set('sectionDetail', []);
homeDict.set("sectionIndex", 0);
homeDict.set('courseData');



Template.home.onRendered(function(){
	$('#multi-select').dropdown();
	$('#search-select').dropdown();
	$('#search-select-start-time').dropdown();
	$('#search-select-end-time').dropdown();
	$('#multi-select-days').dropdown();
	$('.ui.checkbox').checkbox();
	$('body').keydown(function (e){
    	if(e.keyCode == 13){
        	homeDict.set('showTable', false);
    		homeDict.set('majorDetail', []);
			homeDict.set('sectionDetail', []);
			homeDict.set('courseData');
			homeDict.set('termName');
			homeDict.set('noResult', false);

			const keyword = $(".js-submit-search").val();
			const term = $(".js-term").val();
			const req_array = $(".js-req .ui.label.transition.visible").toArray();
			const req_names_array = [];
			for(let item of req_array){
				req_names_array.push(item.innerText);
			};
			const days_array = $(".js-days .ui.label.transition.visible").toArray();
			const days_names_array = [];
			for(let item of days_array){
				days_names_array.push($(item).attr("data-value"));
			};
			const start_time = $(".js-start-time input").val();
			const end_time = $(".js-end-time input").val();
			const time_and_date = {
				days: days_names_array,
				start: start_time,
				end: end_time
			};
			const dept = $("#search-select input").val();//""for no option and "all" for all departments
			const instructor = $(".js-prof input").val();
			const if_indept = $(".js-if-indep").is(':checked');
			const if_not_sure = $(".js-if-not-sure").is(':checked');

			Meteor.call("searchCourse", keyword, term, req_names_array, dept, instructor, time_and_date, if_indept, if_not_sure,
				function(err, result){
					if(result.length == 0){
						homeDict.set('noResult', true);
					} else {
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

    					if(parseInt(a.term) < parseInt(b.term)){
        					return 1;  
    					}else if(parseInt(a.term) > parseInt(b.term)){
        					return -1;
    					}else{
        					const major_comp = course_dep_a.localeCompare(course_dep_b);
        					if(major_comp != 0){
        						return major_comp;
        					} else {
        						return comp_string_a.localeCompare(comp_string_b);
        					}
    					}
					});
						for(let i = 0; i < sorted_result.length; i++){
							sorted_result[i].index = i;
						};
						homeDict.set('courseData', sorted_result);
						homeDict.set('noResult',false);
					}

    				homeDict.set('showTable', true);
				}
			);
    	}
	})
	Meteor.call("getProfData", function(err, result){
		$('#prof-search').search({
    		source : result,
    		searchFields   : [
      			'title'
    		],
  		});
	})
})

Template.home.helpers ({
	showTable: function(){
		return homeDict.get('showTable');
	},
})

Template.home.events ({
  	"submit #search_main": function(event) {
    	event.preventDefault();
    	homeDict.set('showTable', false);
    	homeDict.set('majorDetail', []);
		homeDict.set('sectionDetail', []);
		homeDict.set('courseData');
		homeDict.set('termName');
		homeDict.set('noResult', false);

		const keyword = $(".js-submit-search").val();
		const term = $(".js-term").val();
		const req_array = $(".js-req .ui.label.transition.visible").toArray();
		const req_names_array = [];
		for(let item of req_array){
			req_names_array.push(item.innerText);
		};
		const days_array = $(".js-days .ui.label.transition.visible").toArray();
		const days_names_array = [];
		for(let item of days_array){
			days_names_array.push($(item).attr("data-value"));
		};
		const start_time = $(".js-start-time input").val();
		const end_time = $(".js-end-time input").val();
		const time_and_date = {
			days: days_names_array,
			start: start_time,
			end: end_time
		};
		const dept = $("#search-select input").val();//""for no option and "all" for all departments
		const instructor = $(".js-prof input").val();
		const if_indept = $(".js-if-indep").is(':checked');
		const if_not_sure = $(".js-if-not-sure").is(':checked');

		Meteor.call("searchCourse", keyword, term, req_names_array, dept, instructor, time_and_date, if_indept, if_not_sure,
			function(err, result){
				if(result.length == 0){
					homeDict.set('noResult', true);
				} else {
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

    					if(parseInt(a.term) < parseInt(b.term)){
        					return 1;  
    					}else if(parseInt(a.term) > parseInt(b.term)){
        					return -1;
    					}else{
        					const major_comp = course_dep_a.localeCompare(course_dep_b);
        					if(major_comp != 0){
        						return major_comp;
        					} else {
        						return comp_string_a.localeCompare(comp_string_b);
        					}
    					}
					});
					for(let i = 0; i < sorted_result.length; i++){
						sorted_result[i].index = i;
					};
					homeDict.set('courseData', sorted_result);
					homeDict.set('noResult',false);
				}

    			homeDict.set('showTable', true);
			}
		);
  	},

  	"change .js-term": function(event){
 		event.preventDefault();
    	homeDict.set('showTable', false);
    	homeDict.set('majorDetail', []);
		homeDict.set('sectionDetail', []);
		homeDict.set('courseData');
		homeDict.set('termName');
		homeDict.set('noResult', false);

		const keyword = $(".js-submit-search").val();
		const term = $(".js-term").val();
		const req_array = $(".js-req .ui.label.transition.visible").toArray();
		const req_names_array = [];
		for(let item of req_array){
			req_names_array.push(item.innerText);
		};
		const days_array = $(".js-days .ui.label.transition.visible").toArray();
		const days_names_array = [];
		for(let item of days_array){
			days_names_array.push($(item).attr("data-value"));
		};
		const start_time = $(".js-start-time input").val();
		const end_time = $(".js-end-time input").val();
		const time_and_date = {
			days: days_names_array,
			start: start_time,
			end: end_time
		};
		const dept = $("#search-select input").val();
		const instructor = $(".js-prof input").val();
		const if_indept = $(".js-if-indep").is(':checked');
		const if_not_sure = $(".js-if-not-sure").is(':checked');

		Meteor.call("searchCourse", keyword, term, req_names_array, dept, instructor, time_and_date, if_indept, if_not_sure,
			function(err, result){
				if(result.length == 0){
					homeDict.set('noResult', true);
				} else {
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

    					if(parseInt(a.term) < parseInt(b.term)){
        					return 1;  
    					}else if(parseInt(a.term) > parseInt(b.term)){
        					return -1;
    					}else{
        					const major_comp = course_dep_a.localeCompare(course_dep_b);
        					if(major_comp != 0){
        						return major_comp;
        					} else {
        						return comp_string_a.localeCompare(comp_string_b);
        					}
    					}
					});
					for(let i = 0; i < sorted_result.length; i++){
						sorted_result[i].index = i;
					};
					homeDict.set('courseData', sorted_result);
					homeDict.set('noResult',false);
				}

    			homeDict.set('showTable', true);
			}
		);
 	},
})

Template.search_result.helpers({
	detailReady: function(){
		return homeDict.get('courseInfo') != null;
	},

	courseDataReady: function(){
		return homeDict.get('courseData') != null;
	},

	courseData: function(){
		return homeDict.get('courseData');
	},

	courseInfo: function(){
		return homeDict.get('courseInfo');
	},

	majorInfo: function(){
		return homeDict.get('majorDetail');
	},

	sectionData: function(){
		return homeDict.get('sectionDetail');
	},

	noResult: function(){
		return homeDict.get('noResult');
	},

	settings_course: function(){
		return {
			rowsPerPage: 10,
			showFilter: false,
			showNavigationRowsPerPage: false,
			multiColumnSort: false,
			fields:[
				{key:'index', hidden:true},
				{key:'name', label: 'Course',headerClass: "four wide", sortable: false},
				{key:'code', label:'Code', headerClass: "three wide", sortable: false},
				{key:'requirements', label:'Requirements', headerClass: "two wide", sortable: false},
				{key:'description', label:'Description', tmpl:Template.description_detail, headerClass: "five wide", sortable: false},
				{key:'term', label:'Term', headerClass: "two wide", sortable: false, fn: function(key, object){
					Meteor.call("searchTerm", key, function(err, result){
						homeDict.set("termName" + object.id, result);
					});

					const term_name = homeDict.get("termName" + object.id);
					if(!term_name){
						return new Spacebars.SafeString("<div class=\"ui active inline loader\"></div>");
					} else {
						return term_name;
					}
				}},
			],
		};
	},
})

Template.search_result.onRendered(function(){
	$('#popup-tab .item').tab();
})

Template.search_result.helpers({
	sectionDetail: function(){
		return homeDict.get("sectionDetail")[homeDict.get("sectionIndex")];
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

	getProfName: function(prof_list, section_id){
		Meteor.call("searchInstructorArray", prof_list, function(err, result){
			if(result.includes("Staff")){
				homeDict.set("instructorsName" + section_id, "Staff - This information will be updated once Brandeis posts the professor names for this section\n");
			} else {
				homeDict.set("instructorsName" + section_id, result);
			}
		});

		return homeDict.get("instructorsName" + section_id);
	},

	profNameLoading: function(section_id){
		return !homeDict.get("instructorsName" + section_id);
	},

	sectionNum: function(section_num){
		if(section_num < 10){
			return "0" + section_num;
		} else {
			return section_num;
		}
	},

	limitNum: function(limit){
		if(!limit){
			return "999";
		} else {
			return limit;
		}
	},

	notFirstTime: function(index){
		return index != 0;
	},
})

Template.search_result.events({
	"click .reactive-table tbody tr": function(event){
		homeDict.set('courseInfo');
		homeDict.set('sectionDetail', []);
		homeDict.set('majorDetail', []);
		homeDict.set('instructors');
		homeDict.set('courseInfo', this);
		homeDict.set('courseCode', this.code);
		homeDict.set("sectionIndex", 0);
		//reset the default detail choice to be the first tab
		$("#popup-tab .item.active").attr("class", "item");
		$("#popup-tab [data-tab=first]").attr("class", "item active");
		$(".ui.container.popup .segment.active").attr("class", "ui bottom attached tab segment");
		$(".ui.container.popup [tab-num=1]").attr("class", "ui bottom attached tab segment active");

		let popup = $(".popup");
		popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
		$(".overlay, .popup").fadeToggle();



		if(!homeDict.get('courseInfo')){//continue only if the data is ready
			return;
		};

		//get major details
		Meteor.call("getMajorDetails", homeDict.get('courseInfo'),
			function(err, result){
				homeDict.set('majorDetail', result);
			}
		);

		//get section details
		Meteor.call("getSectionDetails", homeDict.get('courseInfo'),
			function(err, result){
				homeDict.set('sectionDetail', _.sortBy(result,
					function(section){
						return parseInt(section.section);
					}
				));
			}
		);
	},

	"click .overlay,.js-close-popup" :function(event){
		$(".overlay, .popup").fadeToggle();
	},

	"change .js-section": function(event){
		event.preventDefault();
		homeDict.set("sectionIndex", $(".js-section").val());
		homeDict.set("instructorsName");
	},

	"click .js-textbook": function(event){
		event.preventDefault();
		const course_id = $(event)[0].target.attributes[1].value;
		const course_code = homeDict.get("courseCode");
		const section_num = $(event)[0].target.attributes[2].value;

		window.open("http://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet?bookstore_id-1=1391&term_id-1=" +
			course_id.substring(0, course_id.indexOf("-")) + "&div-1=&dept-1=" +
			course_code.substring(0, course_code.indexOf(" ")) + "&course-1=" +
			course_code.substring(course_code.indexOf(" ") + 1) + "&sect-1=" + section_num);
	},
})

Template.description_detail.onRendered(function(){
	$('.ui.accordion').accordion();
})

Template.description_detail.helpers({
	showDescription: function(text){
		if (text.length > 50){
			return text.substring(0, 50) + "...";
		} else {
			return text;
		};
	},
})

Template.search_result_time_table.helpers({
	sectionData: function(){
		return homeDict.get('sectionDetail');
	},

	settings_result: function(){
		return {
			rowsPerPage: 5,
			showFilter: false,
			showNavigationRowsPerPage: false,
			fields:[
				{key:'section', label: 'Section', fn: function(key){
					var section = key;
					if(section < 10){
						section = "0" + section;
					};

					return "Section " + section;
				}},
				{key:'enrolled', label:'Enrolled', fn: function(key, object){
					var limit = object.limit;
					if(!limit){
						limit = 999;
					};

					return key + "/" + limit;
				}},
				{key:'status_text', label:'Status'},
				{key:'times', label:'Times', fn:function(key){
					var result = "";
					for(var item of key){
						//get days
						days = "";
						const day1 = "m";
						const day2 = "tu";
						const day3 = "w";
						const day4 = "th";
						const day5 = "f";
						if($.inArray(day1,item.days) != -1){
							days = days + day1.toUpperCase() + " ";
						}
						if($.inArray(day2,item.days) != -1){
							days = days + day2.toUpperCase() + " ";
						}
						if($.inArray(day3,item.days) != -1){
							days = days + day3.toUpperCase() + " ";
						}
						if($.inArray(day4,item.days) != -1){
							days = days + day4.toUpperCase() + " ";
						}
						if($.inArray(day5,item.days) != -1){
							days = days + day5.toUpperCase() + " ";
						}

						//get times
						const start = item.start;
						const end = item.end;
						var start_min = Math.floor(start % 60);
						if(start_min < 10){
							start_min = "0" + start_min;
						}

						var end_min = Math.floor(end % 60);
						if(end_min < 10){
							end_min = "0" + end_min;
						}

						var start = Math.floor(start / 60) + ":" + start_min;
						var end = Math.floor(end / 60) + ":" + end_min;
						const time = start + "-" + end;

						result = result + days + ": " + time + "<br>";
					};

					if(result){
						return new Spacebars.SafeString(result);
					} else {
						return "TBA";
					};
				}},
				{key:'instructors', label:'Instructor', fn: function(key, object){
					Meteor.call("searchInstructorArray", key, function(err, result){
						homeDict.set("instructors" + object.id, result);
					});

					const instructors = homeDict.get("instructors" + object.id);
					if(!instructors){
						return new Spacebars.SafeString("<div class=\"ui active inline loader\"></div>");
					} else {
						return new Spacebars.SafeString(instructors);
					};
				}},
			],
		};
	},
})
