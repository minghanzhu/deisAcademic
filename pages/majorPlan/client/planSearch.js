//Global reactive-dict
planSearchDict = new ReactiveDict();
planSearchDict.set('showTable', false);
planSearchDict.set('majorDetail', []);
planSearchDict.set('sectionDetail', []);
planSearchDict.set("sectionIndex", 0);
planSearchDict.set('courseData');



Template.planSearch.onRendered(function() {
    planSearchDict.set('showTable', false);
    planSearchDict.set('majorDetail', []);
    planSearchDict.set('sectionDetail', []);
    planSearchDict.set('courseData');
    planSearchDict.set('termName');
    planSearchDict.set('noResult', false);

    const dept = planSearchDict.get("majorId"); //""for no option and "all" for all departments

    Meteor.call("searchCourse", "", "", [], dept, "", {
            days: [],
            start: "",
            end: ""
        }, false, false,
        function(err, result) {
            if (result.length == 0) {
                planSearchDict.set('noResult', true);
            } else {
                const sorted_result = result.sort(function(a, b) {
                    //for a
                    let course_num_a = parseInt(a.code.match(/\d+/gi)[0]);
                    if (course_num_a < 10) course_num_a = "00" + course_num_a;
                    if (course_num_a >= 10 && course_num_a < 100) course_num_a = "0" + course_num_a;
                    const course_dep_a = a.code.substring(0, a.code.indexOf(" "));
                    const last_a = a.code.charAt(a.code.length - 1);
                    let comp_string_a;
                    if (/\w/i.test(last_a)) {
                        comp_string_a = course_num_a + last_a;
                    } else {
                        comp_string_a = course_num_a + "0";
                    };

                    //for b
                    let course_num_b = parseInt(b.code.match(/\d+/gi)[0]);
                    if (course_num_b < 10) course_num_b = "00" + course_num_b;
                    if (course_num_b >= 10 && course_num_b < 100) course_num_b = "0" + course_num_b;
                    const course_dep_b = b.code.substring(0, b.code.indexOf(" "));
                    const last_b = b.code.charAt(b.code.length - 1);
                    let comp_string_b;
                    if (/\w/i.test(last_b)) {
                        comp_string_b = course_num_b + last_b;
                    } else {
                        comp_string_b = course_num_b + "0";
                    };


                    const major_comp = course_dep_a.localeCompare(course_dep_b);
                    if (major_comp != 0) {
                        return major_comp;
                    } else {
                        return comp_string_a.localeCompare(comp_string_b);
                    }

                });
                for (let i = 0; i < sorted_result.length; i++) {
                    sorted_result[i].index = i;
                };
                planSearchDict.set('courseData', sorted_result);
                planSearchDict.set('noResult', false);
            }

            planSearchDict.set('showTable', true);
        }
    );
    /*this does the search when user press enter
	$('body').keydown(function (e){
    	if(e.keyCode == 13){
        	planSearchDict.set('showTable', false);
    		planSearchDict.set('majorDetail', []);
			planSearchDict.set('sectionDetail', []);
			planSearchDict.set('courseData');
			planSearchDict.set('termName');
			planSearchDict.set('noResult', false);

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
						planSearchDict.set('noResult', true);
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
						planSearchDict.set('courseData', sorted_result);
						planSearchDict.set('noResult',false);
					}

    				planSearchDict.set('showTable', true);
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
	})*/
})

Template.planSearch.helpers({
    showTable: function() {
        return planSearchDict.get('showTable');
    },
})

Template.planSearch.events({


    /* this does search when user changes the term
  	"change .js-term": function(event){
 		event.preventDefault();
    	planSearchDict.set('showTable', false);
    	planSearchDict.set('majorDetail', []);
		planSearchDict.set('sectionDetail', []);
		planSearchDict.set('courseData');
		planSearchDict.set('termName');
		planSearchDict.set('noResult', false);

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
					planSearchDict.set('noResult', true);
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
					planSearchDict.set('courseData', sorted_result);
					planSearchDict.set('noResult',false);
				}

    			planSearchDict.set('showTable', true);
			}
		);
 	},*/
})

Template.plan_result.helpers({
    detailReady: function() {
        return planSearchDict.get('courseInfo') != null;
    },

    courseDataReady: function() {
        return planSearchDict.get('courseData') != null;
    },

    courseData: function() {
        return planSearchDict.get('courseData');
    },

    courseInfo: function() {
        return planSearchDict.get('courseInfo');
    },

    majorInfo: function() {
        return planSearchDict.get('majorDetail');
    },

    sectionData: function() {
        return planSearchDict.get('sectionDetail');
    },

    noResult: function() {
        return planSearchDict.get('noResult');
    },

    settings_course: function() {
        return {
            rowsPerPage: 10,
            showFilter: false,
            showNavigationRowsPerPage: false,
            multiColumnSort: false,
            fields: [{
                key: 'index',
                hidden: true
            }, {
                key: 'name',
                label: 'Course',
                headerClass: "four wide",
                sortable: false
            }, {
                key: 'code',
                label: 'Code',
                headerClass: "three wide",
                sortable: false
            }, {
                key: 'description',
                label: 'Description',
                tmpl: Template.description_detail,
                headerClass: "five wide",
                sortable: false
            }, {
                key: 'add',
                label: 'Add',
                headerClass: "two wide",

                sortable: false,
                fn: function(key, object) {
                        const courseId = object.continuity_id;
                        console.log(courseId);
                        return new Spacebars.SafeString("<div class=\"ui fitted slider checkbox\" id=\"" + courseId + "\"> <input type='checkbox'> <label></label> </div>");
                    }
                    // fn: function(key, object) {
                    //     Meteor.call("searchTerm", key, function(err, result) {
                    //         planSearchDict.set("termName" + object.id, result);
                    //     });
                    //
                    //     const term_name = planSearchDict.get("termName" + object.id);
                    //     if (!term_name) {
                    //         return new Spacebars.SafeString("<div class=\"ui active inline loader\"></div>");
                    //     } else {
                    //         return term_name;
                    //     }
                    // }
            }, ],
        };
    },
})

Template.plan_result.onRendered(function() {
    $('.ui.accordion').accordion();
})

Template.plan_result.helpers({

})

Template.plan_result.events({
    "click .js-result-table tbody tr": function(event) {
        console.log(this);

    },

    "click .js-addCourse": function(event) {

    }
})
