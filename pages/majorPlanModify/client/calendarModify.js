import fullCalendar from 'fullcalendar';

Template.calendarModify.onCreated(function() {
    this.calendarDict = new ReactiveDict();
    this.calendarDict.set("masterDictSet", false);
})

Template.calendarModify.onRendered(function() {
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
        header: false, //http://fullcalendar.io/docs/display//
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
        eventClick: function(calEvent, jsEvent, view) {
            $('#popup-tab .item').tab(); //this initialize the tabs for the popup
            dict.set("courseId"); //this holds the course id of the current chosen event
            dict.set("courseObj"); //this holds the actual course object for the current chosen event
            dict.set("sectionObj"); //this holds the actual section object for the current chosen event
            dict.set("majorDetail"); //this holds the major names and notes for the current chosen event
            dict.set("instructorsName"); //this hold the instructor names and emails for the current chosen event
            dict.set("sectionChosen") //this hold the boolean value if this section is decided to take by the user
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
            //this makes sure that the popup in the center of the screen
            setTimeout(function() {
                popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
            }, 400);
            $(".overlay-calendar, .popup-calendar").fadeToggle();
        },
    });

    if (Template.instance().masterDict.get("scheduleReady")) {
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
        $(".ui.active.dimmer").attr("class", ".ui.dimmer");
    } else {
        Template.instance().masterDict.set("chosenTerm", $(".js-term").val());
    }
})

Template.calendarModify.helpers({
    setMasterDict: function(dict) {
        if (!dict.get("scheduleReady")) {
            Template.instance().masterDict = dict;
            Template.instance().masterDict.set("hasCourseList", false);
            Template.instance().masterDict.set("fetched_courseList");
            Template.instance().calendarDict.set("masterDictSet", true);
            Template.instance().masterDict.set("clickedChange", false);
            const current_plan_id = Router.current().params._id;
            const scheduleList = MajorPlansPnc.findOne(current_plan_id).scheduleList;
            const masterDict = Template.instance().masterDict;

            Meteor.call("fetchScheduleList", scheduleList, function(err, result) {
                if (err) {
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

                masterDict.set("scheduleList", fetched_scheduleList);
                const chosenTerm = masterDict.get("chosenTerm");
                $(".js-term").val(chosenTerm);
                const currentTerm_sources = masterDict.get("scheduleList")[chosenTerm];
                if (currentTerm_sources) {
                    if (currentTerm_sources["courseList"].length != 0) {
                        for (let source of currentTerm_sources["courseList"]) {
                            $("#calendar").fullCalendar("addEventSource", source);
                        }
                    }
                }
                masterDict.set("scheduleReady", true);
                $(".ui.active.dimmer").attr("class", ".ui.dimmer");
            });
        } else {
            Template.instance().masterDict = dict;
            Template.instance().masterDict.set("hasCourseList", false);
            Template.instance().masterDict.set("fetched_courseList");
            Template.instance().calendarDict.set("masterDictSet", true);
            Template.instance().masterDict.set("clickedChange", false);
        }

        if (!Template.instance().masterDict.get("includeWishlist")) {
            Template.instance().masterDict.set("includeWishlist", false);
        }
    },

    masterDictSet: function() {
        return !!Template.instance().calendarDict.get("masterDictSet");
    },

    calendarDict: function() {
        return Template.instance().calendarDict;
    },

    hasCourseList: function() {
        return Template.instance().masterDict.get("hasCourseList");
    },

    getCourseList: function() {
        const availableCourseList = Template.instance().masterDict.get("fetched_courseList");
        const courseList = [];
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

        return courseList;
    },

    pullUserCourseList: function() {
        const dict = Template.instance().masterDict;
        const courseList = dict.get('courseList');
        const sectionList = UserProfilePnc.findOne().wishlist;

        if (typeof courseList[0] === "string") { //prevent unexpected request
            Meteor.call("fetchCourseList", courseList,
                function(err, result) {
                    if (result.length != 0) {
                        if (dict.get("includeWishlist")) {
                            Meteor.call("fetchSectionList", sectionList, function(err, section_result) {
                                if (err) {
                                    return;
                                }

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
        return !!Template.instance().calendarDict.get('sectionObj');
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
})

Template.calendarModify.events({
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
        $("#calendar").fullCalendar('removeEventSource', section_id);
        $(".overlay-calendar, .popup-calendar").fadeToggle();
        $("#calendar").fullCalendar('refetchEvents');
        dict.set("courseId");
        dict.set("courseObj");
        dict.set("sectionObj");
        dict.set("majorDetail");
        dict.set("instructorsName");
    },

    "click .js-take": function(event) {
        const section_id = event.target.attributes[1].value;
        const source = $("#calendar").fullCalendar('getEventSourceById', section_id);
        source.chosen = !source.chosen;
        Template.instance().calendarDict.set("sectionChosen", source.chosen);
        $("#calendar").fullCalendar("refetchEvents");
    },

    "click .js-save-plan": function() {
        $(".js-save-plan").attr("class", "ui loading disabled button js-save-plan");
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
        ////////////////////////////////////////////

        //turn the dict data into user data to save
        const masterDict = Template.instance().masterDict;
        const major_code = masterDict.get("chosenMajor");
        const availableCourseList = masterDict.get("courseList");
        const major_plan_object = {
            majorId: major_code,
            chosenCourse: availableCourseList,
        }

        //this gets the current saved schedule list
        //{"<term>":{term:"<term>",courseList:[<courses>]}}
        const final_schedule_list = Template.instance().masterDict.get("scheduleList");

        const schedule_list = [];
        for (let term in final_schedule_list) { //access each {term="<term>", courseList:[<courses>]}
            const user_schedule_array = [];
            const source = final_schedule_list[term];
            const chosenCourse = source.courseList;
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
        //[{term:<term>, courseList:[{}]}]
        const current_plan_id = Router.current().params._id;
        Meteor.call("updateSchedule_MajorPlan", schedule_list, major_code, availableCourseList, current_plan_id, function(err) {
            if (err) {
                return;
            }
            window.onbeforeunload = function(e) {};
            Router.go('/myMajorPlan');
        });
    },

    "click .js-change-course": function() {
        event.preventDefault();
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
        //then go back to the previous page
        Template.instance().masterDict.set("clickedChange", true);
    },

    "click .js-add-wishlist": function() {
        const current_status = Template.instance().masterDict.get("includeWishlist");
        Template.instance().masterDict.set("includeWishlist", !current_status);
        Template.instance().masterDict.set("hasCourseList", false);
    },
})

Template.scheduleCourseListView.onRendered(function() {
    $('.accordion').accordion();
    const sticky_height = $(".ui.sticky").height();
    const target_height = $("#courseList").height();
    if (sticky_height < target_height) {
        $('.ui.sticky').sticky({
            context: '#courseList'
        });
    }
    $(".ui.checkbox").checkbox();
})

Template.scheduleCourseListView.helpers({
    setMasterDict: function(masterDict) {
        Template.instance().masterDict = masterDict;
    },

    getSections: function(courseContId, dict, masterDict) {
        if (!masterDict.get("chosenTerm") || !courseContId) { //continue only if the data is ready
            return;
        };

        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        Meteor.call("getSections", courseId, function(err, result) {
            if (err) {
                window.alert(err);
                return;
            }
            if (result.length == 0) {
                dict.set("sectionInfo" + courseId, "NR");
                return;
            }

            const sorted_result = result.sort(function(a, b) {
                return a.section - b.section;
            });

            dict.set("sectionInfo" + courseId, sorted_result);
        });
    },

    hasSectionInfo: function(courseContId, dict, masterDict) {
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        return !!dict.get("sectionInfo" + courseId);
    },

    sectionInfo: function(courseContId, dict, masterDict) {
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        return dict.get("sectionInfo" + courseId);
    },

    noResult: function(courseContId, dict, masterDict) {
        const courseId = masterDict.get("chosenTerm") + "-" + courseContId;
        return dict.get("sectionInfo" + courseId) === "NR";
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
})

Template.scheduleCourseListView.events({
    "click .js-add-section": function(event) {
        const section_id = event.target.attributes[1].nodeValue;
        const course_code = event.target.attributes[2].nodeValue;
        //start  : '2010-01-09T12:30:00-5:00',this is the format of the time
        Meteor.call("getSection", section_id, function(err, result) {
            if (err) {
                return;
            };

            if (result.times.length != 0) {
                const events_array = [];
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
                //check if the course has been added
                const event_sources = $("#calendar").fullCalendar('getEventSources')
                for (let source of event_sources) {
                    for (let event_obj of source.events) {
                        if (event_obj.id == section_id) {
                            return;
                        }
                    }
                }
                //add the source which contains all the events at different times for the same section into the calendar
                $("#calendar").fullCalendar("addEventSource", {
                    events: events_array,
                    id: result.id,
                    chosen: false
                })
            }
        });
    },

    "click .js-title": function() {
        //reads the term when the user click a course to view
        if (!Template.instance().masterDict.get("chosenTerm")) {
            Template.instance().masterDict.set("chosenTerm", $(".js-term").val());
        };

        const sticky_height = $(".ui.sticky").height();
        const target_height = $("#courseList").height();
        if (sticky_height < target_height) {
            setTimeout(function() {
                $('.ui.sticky').sticky({
                    context: '#courseList'
                });
            }, 1000);
        }
    },
})
