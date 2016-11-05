import fullCalendar from 'fullcalendar';

Template.calendarTest.onCreated(function() {
    this.calendarDict = new ReactiveDict();
    this.calendarDict.set("viewCalendar", false);

    this.masterDict = this.data["dict"];
    this.masterDict.set("hasCourseList", false);
    this.masterDict.set("fetched_courseList");
    this.masterDict.set("clickedChange", false);
    this.masterDict.set("predictionDataReady", false);
    this.masterDict.set("hideAdded", true);
    this.masterDict.set("fetched", false);
    
    if(!this.masterDict.get("noTimeSections")){
        this.masterDict.set("noTimeSections", {});
    }

    if (!this.data["dict"].get("scheduleList")) {
        this.data["dict"].set("scheduleList", {});
    } 

    if(this.data["dict"].get("courseFetchInfo")){//it's plan view/modify
        this.calendarDict.set("courseFetchInfo", this.data["dict"].get("courseFetchInfo"));
    } else {//it's a new plan
        this.calendarDict.set("courseFetchInfo", {});
    }

    if(!this.data["dict"].get("addedCourses")){//it's a new plan
        this.masterDict.set("addedCourses", []);
    }

    if(this.data["dict"].get("predictionData")){
        this.masterDict.set("predictionData", this.data["dict"].get("predictionData"));
    }

    if (!this.masterDict.get("includeWishlist")) {
        Template.instance().masterDict.set("includeWishlist", false);
    }
})

Template.calendarTest.onRendered(function() {
    $(".js-not-save-plan").popup({
        content: "Please login to save the plan",
        position: "top center"
    })
})

Template.calendarTest.helpers({
    viewCalendar: function(){
        return Template.instance().calendarDict.get("viewCalendar");
    },

    termList: function(){
        const termList = Term.find().fetch().sort(function(a, b){
            return parseInt(a.id) - parseInt(b.id);
        });

        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        for(let i = 0; i < termList.length; i++){
            if(termList[i].id > end_semester || termList[i].id < start_semester){
                termList.splice(i, 1);
                i--;
            }
        }

        return termList;
    },

    calendarDict: function() {
        return Template.instance().calendarDict;
    },

    hasCourseList: function() {
        return Template.instance().masterDict.get("hasCourseList");
    },

    getCourseList: function() {
        const availableCourseList = Template.instance().masterDict.get("fetched_courseList");
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        const is_calendarView = Template.instance().calendarDict.get("viewCalendar");
        const courseList = [];
        if(is_calendarView){
            for (let course of availableCourseList) {
                let current_term;
                if (Template.instance().masterDict.get("chosenTerm")) {
                    current_term = Template.instance().masterDict.get("chosenTerm");
                } else {
                    current_term = $(".js-term").val();
                }

                if (course.id.substring(0, course.id.indexOf("-")) === current_term) {
                    courseList.push(course);
                }
            }
        } else {
            const chosenCourse = [];
            for (let course of availableCourseList.reverse()) {
                if ($.inArray(course.continuity_id, chosenCourse) == -1) {
                    courseList.push(course);
                    chosenCourse.push(course.continuity_id);
                }
            }
        }
        
        return courseList.reverse();
    },

    pullUserCourseList: function() {
        const dict = Template.instance().masterDict;
        const courseList = dict.get('chosenCourse');
        
        let sectionList = [];
        if(UserProfilePnc.findOne()){
            sectionList = UserProfilePnc.findOne().wishlist;
        }

        if (typeof courseList[0] === "string") { //prevent unexpected request
            Meteor.call("fetchCourseList", courseList,
                function(err, result) {
                    if(err){
                        window.alert(err.message);
                        dict.set("hasCourseList", true);
                        dict.set("includeWishlist", !dict.get("includeWishlist"));
                        return;
                    }

                    if (result.length != 0) {
                        if (dict.get("includeWishlist") && sectionList.length != 0) {
                            Meteor.call("fetchSectionList", sectionList, function(err, response) {
                                if (err) {
                                    window.alert(err.message);
                                    return;
                                }
                                const section_result = response.data;
                                if (section_result.length != 0) {
                                    const wishlist_course = section_result;
                                    const new_course = [];
                                    for(let course_wish of wishlist_course){
                                        let isChosen = false
                                        for(let course_major of result){
                                            if(course_major.id === course_wish.id){
                                                isChosen = true;
                                                break;
                                            }
                                        }
                                        if(!isChosen){
                                            new_course.push(course_wish)
                                        }
                                    }
                                    const combined_list = result.concat(new_course);

                                    const sorted_result = combined_list.sort(function(a, b) {
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
                                    
                                    dict.set("fetched_courseList", sorted_result);
                                    dict.set("hasCourseList", true);
                                }
                            })
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
                            
                            dict.set("fetched_courseList", sorted_result);
                            dict.set("hasCourseList", true);
                        }
                    }
                }
            );
        }
    },

    getCourseInfo: function() {
        const dict = Template.instance().calendarDict;
        const courseId = dict.get("courseId");
        Meteor.call("getCourse", courseId, function(err, result) {
            if (err) {
                window.alert(err.message);
                return;
            }

            dict.set("courseObj", result);
        })
    },

    courseInfo: function() {
        return Template.instance().calendarDict.get("courseObj");
    },

    detailReady: function() {
        return !!Template.instance().calendarDict.get("courseObj");
    },

    hasMajorInfo: function() {
        return !!Template.instance().calendarDict.get('majorDetail');
    },

    majorInfo: function() {
        return Template.instance().calendarDict.get('majorDetail');
    },

    getMajorDetails: function() {
        const dict = Template.instance().calendarDict;
        Meteor.call("getMajorDetails", dict.get('courseObj'),
            function(err, result) {
                if (err) {
                    window.alert(err.message);
                    return;
                }
                dict.set('majorDetail', result);
            }
        );
    },

    getReq: function(req_array) {
        if (req_array.length == 0) {
            return ["/"];
        } else {
            return req_array;
        };
    },

    sectionObj: function() {
        return Template.instance().calendarDict.get('sectionObj');
    },

    profNameLoading: function(section_id) {
        return !Template.instance().calendarDict.get("instructorsName");
    },

    getProfInfo: function(prof_list) {
        const dict = Template.instance().calendarDict;
        Meteor.call("getProfInfo", prof_list, function(err, result) {
            if(err){
                window.alert(err.message);
                return;
            }

            if (result.includes("Staff")) {
                dict.set("instructorsName", "Staff - This information will be updated once Brandeis posts the professor names for this section\n");
            } else {
                dict.set("instructorsName", result);
            }
        });

        return dict.get("instructorsName");
    },

    notFirstTime: function(index) {
        return index != 0;
    },

    getSectionDays: function(days_array) {
        days = "";
        const day1 = "m";
        const day2 = "tu";
        const day3 = "w";
        const day4 = "th";
        const day5 = "f";
        if ($.inArray(day1, days_array) != -1) {
            days = days + day1.toUpperCase() + " ";
        }
        if ($.inArray(day2, days_array) != -1) {
            days = days + day2.toUpperCase() + " ";
        }
        if ($.inArray(day3, days_array) != -1) {
            days = days + day3.toUpperCase() + " ";
        }
        if ($.inArray(day4, days_array) != -1) {
            days = days + day4.toUpperCase() + " ";
        }
        if ($.inArray(day5, days_array) != -1) {
            days = days + day5.toUpperCase() + " ";
        }
        return days;
    },

    convertTime: function(time) {
        var min = Math.floor(time % 60);
        if (min < 10) {
            min = "0" + min;
        }

        var time = Math.floor(time / 60) + ":" + min;
        return time;
    },

    limitNum: function(limit) {
        if (!limit) {
            return "999";
        } else {
            return limit;
        }
    },

    sectionReady: function() {
        const unavailableSections = Template.instance().masterDict.get("unavailableSections");
        const section_obj = Template.instance().calendarDict.get('sectionObj');
        if(!section_obj) return false;
        
        if($.inArray(section_obj.id, unavailableSections) != -1){
            return false;
        } else {
            return true;
        }
    },

    isSectionChosen: function() {
        return Template.instance().calendarDict.get('sectionChosen');
    },

    getSageCode: function(sectionId) {
        if (!sectionId) {
            return;
        }
        return sectionId.substring(sectionId.indexOf("-") + 1, sectionId.lastIndexOf("-"));
    },

    clickedChange: function() {
        Template.instance().masterDict.set("pageName", "chooseCourse");
    },

    hasClickedChange: function() {
        return Template.instance().masterDict.get("clickedChange");
    },

    hasWishlist: function() {
        return Template.instance().masterDict.get("includeWishlist");
    },

    getOfferedHistory: function() {
        return Template.instance().calendarDict.get("courseOfferings")
    },

    historyReady: function(){
        return Template.instance().calendarDict.get("historyReady");
    },

    fetchHistory: function(){
        const calendarDict = Template.instance().calendarDict;
        const currCourseData = calendarDict.get("courseObj");
        if(!currCourseData) return;

        Meteor.call("getCourseHistory", currCourseData.continuity_id,
            function(err, result) {
                if (err) {
                    console.log(err.message);
                    return;
                }

                calendarDict.set("courseOfferings", result);
                calendarDict.set("historyReady", true);
            }
        );
    },

    hasFutureTerm: function(){
        const latest_term = parseInt(Term.find().fetch().sort(function(a, b){return a.id - b.id;})[Term.find().count() - 1].id);
        const allowed_term = GlobalParameters.findOne().allowed_terms;//global parameter, to be changed to a method call
        const end_term = Template.instance().masterDict.get("planEndSemester");

        return end_term > latest_term && end_term <= (latest_term + 30);
    },

    pullPredictionData: function(){
        const masterDict = Template.instance().masterDict;
        const chosen_course_list = masterDict.get("chosenCourse");
        Meteor.call("getCoursePrediction", chosen_course_list, Router.current().params._id, function(err, result){
            if(err){
                window.alert(err.message);
                return;
            }

            masterDict.set("predictionData", result);
            masterDict.set("predictionDataReady", true);
        })
    },

    predictionDataReady: function(){
        const latest_term = parseInt(Term.find().fetch().sort(function(a, b){return a.id - b.id;})[Term.find().count() - 1].id);
        const allowed_term = GlobalParameters.findOne().allowed_terms;//global parameter, to be changed to a method call
        const end_term = Template.instance().masterDict.get("planEndSemester");

        if(end_term > latest_term && end_term <= (latest_term + 30)){
            return Template.instance().masterDict.get("predictionDataReady");
        } else{
            return true;
        }
    },

    isFutureTerm: function(){
        return Template.instance().calendarDict.get("isFutureTerm");
    },

    isFuture: function(){
        return !Term.findOne({id: Template.instance().masterDict.get("chosenTerm")});
    },

    initializeTab: function(){
        setTimeout(function() {
            $('#popup-tab .item').tab();
        }, 400);
    },

    sameUser: function(){
        //if it's a new plan, allow it since there's no plan object to get yet
        if(!Template.instance().masterDict.get("isModify")) return true;

        if(!MajorPlansPnc.findOne()){
            return false;
        }
        return MajorPlansPnc.findOne().userId === Meteor.userId();
    },

    isNewPlan: function(){
        return !Template.instance().masterDict.get("isModify");
    },

    getUsername: function(){
        if(Template.instance().calendarDict.get("planDeleted")) return;
        const plan_id = MajorPlansPnc.findOne()._id;
        const dict = Template.instance().masterDict;
        Meteor.call("getUsername", plan_id, function(err, result){
            if(err){
                return "Unknown user"
            }

            dict.set("username", result);
        })

        return dict.get("username");
    },

    showsUp: function(continuity_id){
        const shouldShowUp = !Template.instance().masterDict.get("hideAdded");
        if(shouldShowUp){
            return true;
        } else {
            return $.inArray(continuity_id, Template.instance().masterDict.get("addedCourses")) == -1;
        }
    },

    hideAdded: function(){
        return Template.instance().masterDict.get("hideAdded");
    },

    and: function(a, b){
        return a && b;
    }
})

Template.calendarTest.events({
    "change .js-term": function() {
        //save the previous term's schedule to the dict
        const previous_term = Template.instance().masterDict.get("chosenTerm");
        const previous_schedule_sources = $("#calendar").fullCalendar("getEventSources");
        //this removes all the additional properties created by fullCalendar
        const previous_cleaned_sources = [];
        for (let source of previous_schedule_sources) {
            const cleaned_source = {
                events: source.origArray,
                id: source.id,
                chosen: source.chosen
            };

            previous_cleaned_sources.push(cleaned_source);
        }
        const current_schedule_list = Template.instance().masterDict.get("scheduleList");
        current_schedule_list[previous_term] = {
            term: previous_term,
            courseList: previous_cleaned_sources
        };
        Template.instance().masterDict.set("scheduleList", current_schedule_list);

        //for the new term
        Template.instance().masterDict.set("chosenTerm", $(".js-term").val());
        //check if there's an existing schedule for the current semester
        const current_term = $(".js-term").val();
        const current_schedule_sources = Template.instance().masterDict.get("scheduleList")[current_term];
        $("#calendar").fullCalendar("removeEventSources", previous_schedule_sources);
        if (current_schedule_sources) {
            if (current_schedule_sources["courseList"].length != 0) {
                for (let source of current_schedule_sources["courseList"]) {
                    $("#calendar").fullCalendar("addEventSource", source);
                }
            }
        }
    },

    "click .overlay-calendar,.js-close-popup": function(event) {
        $(".overlay-calendar, .popup-calendar").fadeToggle();
    },

    "click .js-textbook": function(event) {
        event.preventDefault();
        const course_id = $(event)[0].target.attributes[1].value;
        const section_num = $(event)[0].target.attributes[2].value;
        const course_code = $(event)[0].target.attributes[3].value;

        window.open("http://www.bkstr.com/webapp/wcs/stores/servlet/booklookServlet?bookstore_id-1=1391&term_id-1=" +
            course_id.substring(0, course_id.indexOf("-")) + "&div-1=&dept-1=" +
            course_code.substring(0, course_code.indexOf(" ")) + "&course-1=" +
            course_code.substring(course_code.indexOf(" ") + 1) + "&sect-1=" + section_num);
    },

    "click .js-delete-section": function(event) {
        event.preventDefault();
        const dict = Template.instance().calendarDict;
        const section_id = $(event)[0].target.attributes[1].value;
        const course_id = $(event)[0].target.attributes[2].value;
        const is_calendarView = Template.instance().calendarDict.get("viewCalendar");
        if(is_calendarView){
            $("#calendar").fullCalendar('removeEventSource', section_id);
            $(".overlay-calendar, .popup-calendar").fadeToggle();
            $("#calendar").fullCalendar('refetchEvents');
            
        } else {
            const term = section_id.substring(0, section_id.indexOf("-"));
            const term_schedule = Template.instance().masterDict.get("scheduleList")[term];
            const courseList = term_schedule.courseList;
            for(var i = 0; i < courseList.length; i++){
                if(courseList[i].id === section_id){
                    courseList.splice(i, 1);
                    break;
                }
            }

            term_schedule.courseList = courseList;
            const current_schedule = Template.instance().masterDict.get("scheduleList");
            current_schedule[term] = term_schedule;
            Template.instance().masterDict.set("scheduleList", current_schedule);
            $(".overlay-calendar, .popup-calendar").fadeToggle();
        }

        const addedCourses = Template.instance().masterDict.get("addedCourses");
        const continuity_id = course_id.substring(course_id.indexOf("-") + 1)
        addedCourses.splice($.inArray(continuity_id, addedCourses), 1);
        Template.instance().masterDict.set("addedCourses", addedCourses);

        dict.set("courseId");
        dict.set("courseObj");
        dict.set("sectionObj");
        dict.set("majorDetail");
        dict.set("instructorsName");
    },

    "click .js-take": function(event) {
        event.preventDefault();
        const section_id = event.target.attributes[1].value;
        const is_calendarView = Template.instance().calendarDict.get("viewCalendar");
        if(is_calendarView){
            const source = $("#calendar").fullCalendar('getEventSourceById', section_id);
            source.chosen = !source.chosen;
            Template.instance().calendarDict.set("sectionChosen", source.chosen);
            $("#calendar").fullCalendar("refetchEvents");
        } else {
            const term = section_id.substring(0, section_id.indexOf("-"));
            const term_schedule = Template.instance().masterDict.get("scheduleList")[term];
            const courseList = term_schedule.courseList;
            for(var i = 0; i < courseList.length; i++){
                if(courseList[i].id === section_id){
                    const current_state = courseList[i].chosen;
                    courseList[i].chosen = !current_state;
                }
            }

            term_schedule.courseList = courseList;
            const current_schedule = Template.instance().masterDict.get("scheduleList");
            current_schedule[term] = term_schedule;
            Template.instance().masterDict.set("scheduleList", current_schedule);
            const current_state = Template.instance().calendarDict.get("sectionChosen");
            Template.instance().calendarDict.set("sectionChosen", !current_state);
        }
    },

    "click .js-save-plan": function() {
        $(".js-save-plan").attr("class", "ui loading disabled button js-save-plan pull-right");
        $(".js-change-course").attr("class", "ui disabled button js-change-course");
        const is_calendarView = Template.instance().calendarDict.get("viewCalendar");
        if(is_calendarView){
            //save the current term's schedule to the dict
            const current_term = $(".js-term").val() || Template.instance().masterDict.get("chosenTerm");
            Template.instance().masterDict.set("chosenTerm", current_term);
            const current_schedule_sources = $("#calendar").fullCalendar("getEventSources");
            //this removes all the additional properties created by fullCalendar
            const current_cleaned_sources = [];
            for (let source of current_schedule_sources) {
                const cleaned_source = {
                    events: source.origArray,
                    id: source.id,
                    chosen: source.chosen
                };

                current_cleaned_sources.push(cleaned_source);
            }
            const current_schedule_list = Template.instance().masterDict.get("scheduleList");
            current_schedule_list[current_term] = {
                term: current_term,
                courseList: current_cleaned_sources
            };
            Template.instance().masterDict.set("scheduleList", current_schedule_list);
        }
        
        ////////////////////////////////////////////

        //turn the dict data into user data to save
        const masterDict = Template.instance().masterDict;
        const major_code = masterDict.get("chosenMajor");
        const availableCourseList = masterDict.get("chosenCourse");
        const major_plan_object = {
            majorId: major_code,
            chosenCourse: availableCourseList,
        }

        //this gets the current saved schedule list
        //{"<term>":{term:"<term>",courseList:[<courses>]}}
        const final_schedule_list = Template.instance().masterDict.get("scheduleList");
        const schedule_list = [];
        for (let term in final_schedule_list) { //access each {term="<term>", courseList:[<courses>]}
            const chosenCourse = final_schedule_list[term].courseList;

            if(!Term.findOne({id: term})){
                const schedule_obj = {
                    term: term,
                    chosenCourse: chosenCourse
                }
                schedule_list.push(schedule_obj);
            } else {
                const user_schedule_array = [];
                
                for (let source of chosenCourse) {
                    const section_obj = {
                        section_id: source.id,
                        chosen: source.chosen
                    }
                    user_schedule_array.push(section_obj); //only save sections id's for each chosen course
                }
                const schedule_obj = {
                    term: term,
                    chosenCourse: user_schedule_array
                }
                schedule_list.push(schedule_obj);
            }   
        }
        //[{term:<term>, courseList:[{}]}]
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        const term_range = {
            start_term: start_semester,
            end_term: end_semester
        };

        Meteor.call("checkValidPlan", term_range, major_code, function(err, result){
            if(err){
                window.alert(err.message);
                $(".js-save-plan").attr("class", "ui primary button js-save-plan pull-right");
                $(".js-change-course").attr("class", "ui button js-change-course");
                return;
            }

            if(!result){//same major & time range
                window.alert("You already have a plan for this major during the same time range");
                $(".js-save-plan").attr("class", "ui primary button js-save-plan pull-right");
                $(".js-change-course").attr("class", "ui button js-change-course");
                return;
            } 

            Meteor.call("saveSchedule_MajorPlan", schedule_list, major_code, availableCourseList, term_range, function(err) {
                if (err) {
                    window.alert(err.message);
                    $(".js-save-plan").attr("class", "ui primary button js-save-plan pull-right");
                    $(".js-change-course").attr("class", "ui button js-change-course");
                    return;
                }

                Router.go('/myMajorPlan');
            });
        })
    },

    "click .js-update-plan": function() {
        $(".js-save-plan").attr("class", "ui loading disabled button js-save-plan");
        $(".js-delete-plan").attr("class", "ui disabled red button js-delete-plan pull-right");
        $(".js-change-course").attr("class", "ui disabled button js-change-course");
        const is_calendarView = Template.instance().calendarDict.get("viewCalendar");
        const current_plan_id = Router.current().params._id;
        if(is_calendarView){
            //save the current term's schedule to the dict
            const current_term = $(".js-term").val() || Template.instance().masterDict.get("chosenTerm");
            Template.instance().masterDict.set("chosenTerm", current_term);
            const current_schedule_sources = $("#calendar").fullCalendar("getEventSources");
            //this removes all the additional properties created by fullCalendar
            const current_cleaned_sources = [];
            for (let source of current_schedule_sources) {
                const cleaned_source = {
                    events: source.origArray,
                    id: source.id,
                    chosen: source.chosen
                };

                current_cleaned_sources.push(cleaned_source);
            }
            const current_schedule_list = Template.instance().masterDict.get("scheduleList");
            current_schedule_list[current_term] = {
                term: current_term,
                courseList: current_cleaned_sources
            };
            Template.instance().masterDict.set("scheduleList", current_schedule_list);
        }
        
        ////////////////////////////////////////////

        //turn the dict data into user data to save
        const masterDict = Template.instance().masterDict;
        const major_code = masterDict.get("chosenMajor");
        const availableCourseList = masterDict.get("chosenCourse");
        const major_plan_object = {
            majorId: major_code,
            chosenCourse: availableCourseList,
        }

        //this gets the current saved schedule list
        //{"<term>":{term:"<term>",courseList:[<courses>]}}
        const final_schedule_list = Template.instance().masterDict.get("scheduleList");
        const schedule_list = [];
        for (let term in final_schedule_list) { //access each {term="<term>", courseList:[<courses>]}
            const chosenCourse = final_schedule_list[term].courseList;

            if(!Term.findOne({id: term})){
                const schedule_obj = {
                    term: term,
                    chosenCourse: chosenCourse
                }
                schedule_list.push(schedule_obj);
            } else {
                const user_schedule_array = [];
                
                for (let source of chosenCourse) {
                    const section_obj = {
                        section_id: source.id,
                        chosen: source.chosen
                    }
                    user_schedule_array.push(section_obj); //only save sections id's for each chosen course
                }
                const schedule_obj = {
                    term: term,
                    chosenCourse: user_schedule_array
                }
                schedule_list.push(schedule_obj);
            }   
        }
        //[{term:<term>, courseList:[{}]}]
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        const term_range = {
            start_term: start_semester,
            end_term: end_semester
        };

        Meteor.call("updateSchedule_MajorPlan", schedule_list, major_code, availableCourseList, current_plan_id, term_range, function(err) {
            if (err) {
                window.alert(err.message);
                $(".js-save-plan").attr("class", "ui primary button js-save-plan");
                $(".js-delete-plan").attr("class", "ui red button js-delete-plan pull-right");
                $(".js-change-course").attr("class", "ui button js-change-course");
                return;
            }

            Router.go('/myMajorPlan');
        });
    },

    "click .js-change-course": function(event) {
        event.preventDefault();
        const is_calendarView = Template.instance().data["dict"].get("viewCalendar");

        if(is_calendarView){
            //save the current term's schedule to the dict
            const current_term = $(".js-term").val();
            Template.instance().masterDict.set("chosenTerm", $(".js-term").val());
            const current_schedule_sources = $("#calendar").fullCalendar("getEventSources");
            //this removes all the additional properties created by fullCalendar
            const current_cleaned_sources = [];
            for (let source of current_schedule_sources) {
                const cleaned_source = {
                    events: source.origArray,
                    id: source.id,
                    chosen: source.chosen
                };

                current_cleaned_sources.push(cleaned_source);
            }
            const current_schedule_list = Template.instance().masterDict.get("scheduleList");
            current_schedule_list[current_term] = {
                term: current_term,
                courseList: current_cleaned_sources
            };
            Template.instance().masterDict.set("scheduleList", current_schedule_list);
        }

        //then go back to the previous page
        Template.instance().data["dict"].set("courseFetchInfo", Template.instance().calendarDict.get("courseFetchInfo"));
        Template.instance().masterDict.set("clickedChange", true);
    },

    "click .js-add-wishlist": function() {
        const current_status = Template.instance().masterDict.get("includeWishlist");
        Template.instance().masterDict.set("includeWishlist", !current_status);
        Template.instance().calendarDict.set("sectionInfo");
        Template.instance().masterDict.set("hasCourseList", false);
        Template.instance().masterDict.set("fetched", false);
    },

    "click .js-hide-addedCourses": function() {
        const current_status = Template.instance().masterDict.get("hideAdded");
        Template.instance().masterDict.set("hideAdded", !current_status);
    },

    "click .js-add-course": function(){
        const course_cont_id = event.target.attributes[1].nodeValue;
        const masterDict = Template.instance().masterDict;
        const availableCourseList = masterDict.get("fetched_courseList");
        
        //make sure there's only one term to add courses
        const chosen_term = $(".checkbox.checked");
        if(chosen_term.length == 0){
            window.alert("Please check a term before adding courses");
            return
        } else if(chosen_term.length > 1){
            window.alert("Please check only one term");
            return
        }
        const term = chosen_term[0].attributes[1].nodeValue;

        //make sure the course has not been added yet
        const courseList = masterDict.get("termCourse" + term);
        for(let course of courseList){
            if(course.continuity_id === course_cont_id){
                return
            }
        }

        //add the course
        for(let course of availableCourseList){
            if(course.continuity_id === course_cont_id){
                if(course.term === term){
                    courseList.push(course);
                    masterDict.set("termCourse" + term, courseList);
                }
            }
        }
    },

    "click .js-view-change": function(){
        const current_state = Template.instance().calendarDict.get("viewCalendar");
        const masterDict = Template.instance().masterDict;
        if(!current_state){
            //make sure there's only one term to add courses
            const chosen_term = $(".checkbox.checked");
            if(chosen_term.length == 0){
                window.alert("Please check a term before going to the calendar");
                return
            } else if(chosen_term.length > 1){
                window.alert("Please check only one term");
                return
            }
            const term = chosen_term[0].attributes[1].nodeValue;
            masterDict.set("chosenTerm", term);
        } else {
            //save the current term's schedule to the dict
            const current_term = $(".js-term").val();
            masterDict.set("chosenTerm", $(".js-term").val());
            const current_schedule_sources = $("#calendar").fullCalendar("getEventSources");
            //this removes all the additional properties created by fullCalendar
            const current_cleaned_sources = [];
            for (let source of current_schedule_sources) {
                const cleaned_source = {
                    events: source.origArray,
                    id: source.id,
                    chosen: source.chosen
                };

                current_cleaned_sources.push(cleaned_source);
            }
            const current_schedule_list = masterDict.get("scheduleList");
            current_schedule_list[current_term] = {
                term: current_term,
                courseList: current_cleaned_sources
            };

            masterDict.set("scheduleList", current_schedule_list);
        }
        
        Template.instance().calendarDict.set("viewCalendar", !current_state);
    },

    "click .js-show-dict": function(event){
        event.preventDefault();
        console.log(Template.instance().masterDict);
        console.log(Template.instance().calendarDict)
    },

    "click .js-delete-plan": function(){
        const dict = Template.instance().calendarDict;
        //this is the first click
        if(!Template.instance().calendarDict.get("deleteClicked")){
            Template.instance().calendarDict.set("deleteClicked", true);
            $('.js-delete-plan').popup({
                content: "Click again to delete this plan",
                position: 'right center',
            });
            $('.js-delete-plan').popup('show');
        } else {//this is the second click
            $(".js-delete-plan").attr("class", "ui loading disabled red button js-delete-plan pull-right");
            $(".js-save-plan").attr("class", "ui disabled button js-save-plan");
            $(".js-change-course").attr("class", "ui disabled button js-change-course");
            const current_plan_id = Router.current().params._id;
            
            Meteor.call("deletePlan", current_plan_id, function(err, result){
                if(err){
                    window.alert(err.message);
                    $(".js-delete-plan").attr("class", "ui red button js-delete-plan pull-right");
                    $(".js-save-plan").attr("class", "ui primary button js-save-plan");
                    $(".js-change-course").attr("class", "ui button js-change-course");
                    return;
                }
                
                dict.set("deleteClicked", false);
                dict.set("planDeleted", true);
                Router.go("/myMajorPlan");
            })   
        }
    },
})

Template.scheduleCourseList.onCreated(function(){
    this.masterDict = this.data["masterDict"];
    this.calendarDict = this.data["dict"];
})

Template.scheduleCourseList.onRendered(function() {
    $('.accordion').accordion();
    const sticky_height = $(".ui.sticky").height();
    const target_height = $("#courseList").height();
    if (sticky_height < target_height) {
        $('.ui.sticky').sticky({
            context: '#courseList',
            observeChanges: true
        });
    } else {
        $('.ui.sticky').sticky({
            context: false,
            observeChanges: true
        });
    }
    $(".ui.slider.checkbox").checkbox();
})

Template.scheduleCourseList.helpers({
    getSections: function(courseContId, index) {
        const dict = Template.instance().calendarDict;
        const masterDict = Template.instance().masterDict;

        if (!masterDict.get("chosenTerm") || !courseContId) { //continue only if the data is ready
            return;
        };

        //do it only once
        if(masterDict.get("fetched")){
            return;
        }

        masterDict.set("fetched", !masterDict.get("fetched"));
        //check if the info is already there
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        if(dict.get("sectionInfo")){
            if(dict.get("sectionInfo")[courseId]){
                return;
            }
        }
        

        let courseList = [];
        const availableCourseList = Template.instance().masterDict.get("fetched_courseList");
        const is_calendarView = dict.get("viewCalendar");
        courseList = [];
        if(is_calendarView){
            for (let course of availableCourseList) {
                let current_term;
                if (Template.instance().masterDict.get("chosenTerm")) {
                    current_term = Template.instance().masterDict.get("chosenTerm");
                } else {
                    current_term = $(".js-term").val();
                }

                if (course.id.substring(0, course.id.indexOf("-")) === current_term) {
                    courseList.push(course);
                }
            }
        } else {
            //get all distinct courses and make sure they are the newest within the term range
            //if the terms are all future terms, get only the follwing info using a new meteor call
            //1. course name
            //2. course offering prediction
            //
            //at the same time, if the user wants to see detailed information, make only course tag 
            //available using the course data of the newest one in the dict.
            //and also hide "decide to take button"
            //
            //create a new field in major plan object that saves chosen cont_id's for different semesters
            let currentCourse = "";
            for (let course of availableCourseList) {
                if (course.continuity_id !== currentCourse) {
                    courseList.push(course.continuity_id);
                    currentCourse = course.continuity_id;
                }
            }
        }

        const term_range = {
            start: masterDict.get("planStartSemester"),
            end: masterDict.get("planEndSemester")
        }
        Meteor.call("getSections", courseList, term_range, function(err, result) {
            if (err) {
                window.alert(err.message);
                return;
            }
            if (result.length == 0) {
                return;
            }

            const sorted_result = result.sort(function(a, b) {
                return a.section - b.section;
            });

            for(let section_info_obj of result){
                if(section_info_obj.sections.length == 0){
                    if(!dict.get("sectionInfo")){
                        const sectionInfo_obj = {};
                        sectionInfo_obj[section_info_obj.courseId] = "NR";
                        dict.set("sectionInfo", sectionInfo_obj);
                    } else {
                        const current_info_obj = dict.get("sectionInfo");
                        current_info_obj[section_info_obj.courseId] = "NR";
                        dict.set("sectionInfo", current_info_obj);
                    }
                } else {
                    dict.set("sectionInfo" + section_info_obj.courseId);
                    if(!dict.get("sectionInfo")){
                        const sectionInfo_obj = {};
                        sectionInfo_obj[section_info_obj.courseId] = section_info_obj.sections.sort(function(a, b){
                            return a.section - b.section;
                        });
                        dict.set("sectionInfo", sectionInfo_obj);
                    } else {
                        const current_info_obj = dict.get("sectionInfo");
                        current_info_obj[section_info_obj.courseId] = section_info_obj.sections.sort(function(a, b){
                            return a.section - b.section;
                        });
                        dict.set("sectionInfo", current_info_obj);
                    }
                }
            }
        });
    },

    hasSectionInfo: function(courseContId) {
        const dict = Template.instance().calendarDict;
        const masterDict = Template.instance().masterDict;
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        if(!Term.findOne({id: masterDict.get("chosenTerm")})){
            if(!dict.get("sectionInfo")){
                const sectionInfo_obj = {};
                sectionInfo_obj[courseId] = "NR";
                dict.set("sectionInfo", sectionInfo_obj);
            } else {
                const current_info_obj = dict.get("sectionInfo");
                current_info_obj[courseId] = "NR";
                dict.set("sectionInfo", current_info_obj);
            }
            return true;
        } else {
            if(!dict.get("sectionInfo")){
                return false;
            } else {
                return !!dict.get("sectionInfo")[courseId];
            }
        }
    },

    sectionInfo: function(courseContId) {
        const dict = Template.instance().calendarDict;
        const masterDict = Template.instance().masterDict;
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        return dict.get("sectionInfo")[courseId];
    },

    noResult: function(courseContId) {
        const dict = Template.instance().calendarDict;
        const masterDict = Template.instance().masterDict;
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        if(!dict.get("sectionInfo")){
            return true;
        }
        return dict.get("sectionInfo")[courseId] === "NR";
    },

    hasTimes: function(times) {
        return times.length != 0;
    },

    getSectionDays: function(days_array) {
        days = "";
        const day1 = "m";
        const day2 = "tu";
        const day3 = "w";
        const day4 = "th";
        const day5 = "f";
        if ($.inArray(day1, days_array) != -1) {
            days = days + day1.toUpperCase() + " ";
        }
        if ($.inArray(day2, days_array) != -1) {
            days = days + day2.toUpperCase() + " ";
        }
        if ($.inArray(day3, days_array) != -1) {
            days = days + day3.toUpperCase() + " ";
        }
        if ($.inArray(day4, days_array) != -1) {
            days = days + day4.toUpperCase() + " ";
        }
        if ($.inArray(day5, days_array) != -1) {
            days = days + day5.toUpperCase() + " ";
        }
        return days;
    },

    convertTime: function(time) {
        var min = Math.floor(time % 60);
        if (min < 10) {
            min = "0" + min;
        }

        var time = Math.floor(time / 60) + ":" + min;
        return time;
    },

    getPredictionData: function(continuity_id){
        const masterDict = Template.instance().masterDict;

        if(!Template.instance().masterDict.get("predictionData")[continuity_id]){
            return "N/A"
        }

        const term = masterDict.get("chosenTerm");
        const prediction_obj = Template.instance().masterDict.get("predictionData")[continuity_id][term];
        if(!prediction_obj){
            return "N/A";
        } else {
            if(prediction_obj.percentage == 1){
                return "99%"
            } else if(prediction_obj.percentage == 0){
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
        }       
    },

    isFutureTerm: function(){
        const latest_term = parseInt(Term.find().fetch().sort(function(a, b){return a.id - b.id;})[Term.find().count() - 1].id);
        const allowed_term = GlobalParameters.findOne().allowed_terms;//global parameter, to be changed to a method call
        const end_term = Template.instance().masterDict.get("chosenTerm");

        return end_term > latest_term && end_term <= (latest_term + 30);
    },

    color: function(continuity_id){
        const term = Template.instance().masterDict.get("chosenTerm");
        if(!Template.instance().masterDict.get("predictionData")[continuity_id][term]) return "grey";
        const percentage = Template.instance().masterDict.get("predictionData")[continuity_id][term].percentage;

        if(percentage >= 0.85){
            return "blue";
        } else if(percentage <= 0.2){
            return "orange";
        } else {
            return "rgba(0,0,0,0.87)";
        }
    },

    inList: function(continuity_id){
        const addedCourses = Template.instance().masterDict.get("addedCourses");
        return $.inArray(continuity_id, addedCourses) != -1;
    },
})

Template.scheduleCourseList.events({
    "click .js-add-section": function(event) {
        const section_id = event.target.attributes[1].nodeValue;
        const course_code = event.target.attributes[2].nodeValue;
        const is_calendarView = Template.instance().data["dict"].get("viewCalendar");
        const masterDict = Template.instance().masterDict;
        const calendar_source = masterDict.get("scheduleList");
        const specialTimes = {
            start1: "2000-01-03T07:30:00-05:00",
            start2: "2000-01-04T07:30:00-05:00",
            start3: "2000-01-05T07:30:00-05:00",
            start4: "2000-01-06T07:30:00-05:00",
            start5: "2000-01-07T07:30:00-05:00",
            end1: "2000-01-03T08:00:00-05:00",
            end2: "2000-01-04T08:00:00-05:00",
            end3: "2000-01-05T08:00:00-05:00",
            end4: "2000-01-06T08:00:00-05:00",
            end5: "2000-01-07T08:00:00-05:00"
        }
        const term = section_id.substring(0, section_id.indexOf("-"));
        const noTimeSections = Template.instance().masterDict.get("noTimeSections");
        if(!noTimeSections[term]){
            noTimeSections[term] = 0
        } 

        //start  : '2010-01-09T12:30:00-5:00',this is the format of the time

        //check if the section is added
        if(is_calendarView){
            if($("#calendar").fullCalendar( 'getEventSourceById', section_id )){
                return;
            }
        } else {
            const term = $(".ui.four.cards .checkbox.checked")[0].attributes[1].nodeValue;
            const term_schedule = calendar_source[term];
            if(term_schedule){
                const courseList = term_schedule.courseList;
                for(let source of courseList){
                    if(source.id === section_id){
                        return
                    }
                }
            } else {
                calendar_source[term] = {
                    term: term,
                    courseList: []
                }
                masterDict.set("scheduleList", calendar_source);
            } 
        }
        
        Meteor.call("getSection", section_id, function(err, result) {
            if (err) {
                window.alert(err.message);
                return;
            };

            const events_array = [];

            const addedCourses = masterDict.get("addedCourses");
            addedCourses.push(result.course.substring(result.course.indexOf("-") + 1));
            masterDict.set("addedCourses", addedCourses);

            for (let time of result.times) {
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
                        id: result.id, //this holds the section id so events at different tiems are associated
                        title: course_code,
                        start: "2000-01-" + dayNum(day) + "T" + convertTime(time.start) + "-05:00",
                        end: "2000-01-" + dayNum(day) + "T" + convertTime(time.end) + "-05:00",
                        section_obj: result //this hold the actual section object for later use
                    };

                    events_array.push(event_obj);
                }
            }

            if(events_array.length == 0){
                noTimeSections[term]++
                if(noTimeSections[term] > 5) noTimeSections[term] = 1;

                const event_obj = {
                    id: result.id, //this holds the section id so events at different tiems are associated
                    title: course_code,
                    start: specialTimes["start" + noTimeSections[term]],
                    end: specialTimes["end" + noTimeSections[term]],
                    section_obj: result, //this hold the actual section object for later use,
                    color: '#87cefa'
                };

                masterDict.set("noTimeSections", noTimeSections);
                events_array.push(event_obj);
            }
            
            if(is_calendarView){
                //add the source which contains all the events at different times for the same section into the calendar
                $("#calendar").fullCalendar("addEventSource", {
                    events: events_array,
                    id: result.id,
                    chosen: false
                })
            } else {
                const term = $(".ui.four.cards .checkbox.checked")[0].attributes[1].nodeValue;
                const has_term = $(".ui.four.cards .checkbox.checked").length != 0;
                const courseList = calendar_source[term].courseList;

                if(!has_term){
                    window.alert("Please check a term before adding courses");
                    return
                }

                const term_array = $(".ui.four.cards .checkbox.checked");
                if(term_array.length != 1){
                    window.alert("Please check only one term");
                    return
                }
                
                if(calendar_source[term]){
                    const new_sourse = {
                        events: events_array,
                        id: result.id,
                        chosen: false
                    }
                    courseList.push(new_sourse)
                    masterDict.set("scheduleList", calendar_source);
                } 
            } 
        });
    },

    "click .js-title": function() {
        const is_calendarView = Template.instance().data["dict"].get("viewCalendar");

        //reads the term when the user click a course to view
        if (!Template.instance().masterDict.get("chosenTerm") && is_calendarView) {
            Template.instance().masterDict.set("chosenTerm", $(".js-term").val());
        };

        setTimeout(function() {
            const sticky_height = $(".ui.sticky").height();
            const target_height = $("#courseList").height();

            if (sticky_height < target_height) {
                $('.ui.sticky').sticky({
                    context: '#courseList',
                    observeChanges: true
                });
            } else {
                $('.ui.sticky').sticky({
                    context: false,
                    observeChanges: true
                });
            }
        }, 600);
    },

    "click .js-add-future-course": function(){
        const is_calendarView = Template.instance().masterDict.get("viewCalendar");

        if(!is_calendarView){
            const term = $(".ui.four.cards .checkbox.checked")[0].attributes[1].nodeValue;
            const continuity_id = event.target.attributes[1].nodeValue; 
            const masterDict = Template.instance().masterDict;
            const calendar_source = masterDict.get("scheduleList");
            if(!calendar_source[term]){
                const new_term_schedule = {
                    term: term,
                    courseList: [continuity_id]
                }

                calendar_source[term] = new_term_schedule;
                masterDict.set("scheduleList", calendar_source);
            } else {
                //check if the course has been added
                const course_list = calendar_source[term].courseList;
                if($.inArray(continuity_id, course_list) != -1){
                    return;
                } else {
                    course_list.push(continuity_id);
                    masterDict.set("scheduleList", calendar_source);
                }
            }

            const addedCourses = masterDict.get("addedCourses");
            addedCourses.push(continuity_id);
            masterDict.set("addedCourses", addedCourses);
        }
    },
})

Template.calendar.onCreated(function(){
    this.calendarDivDict = new ReactiveDict();
    this.calendarDivDict.set("masterDictSet", false);
    this.masterDict = this.data["dict"];
    this.calendarDict = this.data["calendarDict"];
})

Template.calendar.onRendered(function(){
    const dict = this.data["calendarDict"];
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
        header: false, //http://fullcalendar.io/docs/display//
        minTime: '7:30:00', //http://fullcalendar.io/docs/agenda/minTime/
        maxTime: '22:30:00', //http://fullcalendar.io/docs/agenda/maxTime/
        height: 'auto', //http://fullcalendar.io/docs/display/height/
        contentHeight: 'auto', //http://fullcalendar.io/docs/display/contentHeight/
        defaultDate: '2000-01-03', //http://fullcalendar.io/docs/current_date/defaultDate/
        //Monday:   2000-1-3
        //Tuesday:  2000-1-4
        //Wednesday:2000-1-5
        //Thursday: 2000-1-6
        //Friday:   2000-1-7
        editable: false,
        eventClick: function(calEvent, jsEvent, view) {
            $('#popup-tab .item').tab(); //this initialize the tabs for the popup
            dict.set("courseId"); //this holds the course id of the current chosen event
            dict.set("courseObj"); //this holds the actual course object for the current chosen event
            dict.set("sectionObj"); //this holds the actual section object for the current chosen event
            dict.set("majorDetail"); //this holds the major names and notes for the current chosen event
            dict.set("instructorsName"); //this hold the instructor names and emails for the current chosen event
            dict.set("sectionChosen") //this hold the boolean value if this section is decided to take by the user
            dict.set("historyReady", false);
            dict.set("courseId", calEvent.section_obj.course);
            dict.set("sectionObj", calEvent.section_obj);
            dict.set("sectionChosen", $("#calendar").fullCalendar("getEventSourceById", calEvent.section_obj.id).chosen);
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
        },
    });

    const chosenTerm = Template.instance().masterDict.get("chosenTerm");
    $(".js-term").val(chosenTerm);
    const currentTerm_sources = Template.instance().masterDict.get("scheduleList")[chosenTerm];
    if (currentTerm_sources) {
        if (currentTerm_sources["courseList"].length != 0) {
            for (let source of currentTerm_sources["courseList"]) {
                $("#calendar").fullCalendar("addEventSource", source);
            }
        }
    }  
})