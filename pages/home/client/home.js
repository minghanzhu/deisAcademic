Template.home.onCreated(function() {
    this.homeDict = new ReactiveDict();
    this.homeDict.set('showTable', false);
    this.homeDict.set('majorDetail', []);
    this.homeDict.set('sectionDetail', []);
    this.homeDict.set("sectionIndex", 0);
    this.homeDict.set('courseData');
    this.homeDict.set("notTalking", true);
})

Template.voiceButton.onRendered(function() {

  var isChrome = !!window.chrome && !!window.chrome.webstore;
  if (isChrome === false) {
    console.log("Sorry, but only chrome supports our voice search now.");
    $(".js-voice-search").hide();
  }

  $('.js-voice-search')
      .popup({
          title: "Search by voice",
          content: "For example \"Show me COSI courses taught by Timothy Hickey\"",
          position: 'bottom right',
      });
})

Template.home.onRendered(function() {
    const homeDict = Template.instance().homeDict;
    //this monitors the pressing of enter, if so, do a search
    $('body').unbind('keydown');
    $('body').keydown(function(e) {
        if(Router.current().url !== "http://turing.cs-i.brandeis.edu:5000/"
            && Router.current().url !== "/"
            && Router.current().url !== "http://localhost:3000/"){
            return;
        }

        if (e.keyCode == 13 && !$(".reactive-table-navigation input").is(":focus")) {
            //these get all the keywords for search
            const keyword = $(".js-submit-search").val();
            const term = $(".js-term input").val();

            function getValues(f){
                if(!f){
                    return [];
                } else {
                    return f;
                }
            }

            const req_names_array = getValues($(".js-req").dropdown("get values"));
            const days_names_array = getValues($(".js-days").dropdown("get values"));
            const start_time = $(".js-start-time input").val();
            const end_time = $(".js-end-time input").val();
            const time_and_date = {
                days: days_names_array,
                start: start_time,
                end: end_time
            };
            const dept = $("#search-select input").val(); //""for no option and "all" for all departments
            const instructor = $(".js-prof input").val();
            const if_indept = $(".js-if-indep").is(':checked');
            const if_not_sure = $(".js-if-not-sure").is(':checked');

            //make sure there's change before sending new request
            if(homeDict.get("last_time_data")){
                const last_obj = homeDict.get("last_time_data");
                if(
                    last_obj.keyword === keyword &&
                    last_obj.term === term &&
                    last_obj.dept === dept &&
                    last_obj.instructor === instructor &&
                    last_obj.if_indept === if_indept &&
                    last_obj.if_not_sure === if_not_sure &&
                    last_obj.time_and_date.start === time_and_date.start &&
                    last_obj.time_and_date.end === time_and_date.end &&
                    ($(last_obj.time_and_date.days).not(time_and_date.days).length === 0 && 
                        $(time_and_date.days).not(last_obj.time_and_date.days).length === 0) &&
                    ($(last_obj.req_names_array).not(req_names_array).length === 0 && 
                        $(req_names_array).not(last_obj.req_names_array).length === 0)
                ) {
                    return;
                }
            }

            //validate the search
            if(
                !keyword.replace(/ +/ig," ").trim() &&
                !term &&
                (!dept || dept === "all") &&
                !instructor &&
                (!time_and_date.start || time_and_date.start === "all") &&
                (!time_and_date.end || time_and_date.end ==="all") &&
                time_and_date.days.length == 0 &&
                req_names_array.length == 0
            ){
                window.alert("Please don't search nothing.");
                return;
            } else if(
                keyword.replace(/ +/ig," ").trim().length == 1 &&
                !term
            ){
                if(keyword.replace(/ +/ig," ").trim().length == 1){
                    window.alert("Please don't search just one character.");
                    return;
                }
            } else if(
                !keyword.replace(/ +/ig," ").trim() &&
                (!dept || dept === "all") &&
                !instructor &&
                !term && (
                !(!time_and_date.start || time_and_date.start === "all") ||
                !(!time_and_date.end || time_and_date.end ==="all") ||
                time_and_date.days.length != 0) &&
                req_names_array.length == 0
            ){
                window.alert("Please add a keyword, a term, a department, or an instructor.");
                return;
            } else if(
                !keyword.replace(/ +/ig," ").trim() &&
                !instructor &&
                !term &&
                (!dept || dept === "all") &&
                req_names_array.length != 0
            ) {
                window.alert("Please add a keyword, a term, a department, or an instructor.");
                return;
            } 

            //these reset the home dict so that the popup won't read wrong information
            //and also the loading indicators can work
            homeDict.set('showTable', false); //this determines if the table should shows up
            homeDict.set('majorDetail', []); //this shows the major names and notes for a given section
            homeDict.set('sectionDetail', []); //this holds the section objects
            homeDict.set('courseData'); //this holds the course object
            homeDict.set('termName'); //this saves the term name
            homeDict.set('noResult', false); //this determines if showing no results

            const submit_obj = {
                keyword: keyword,
                term: term,
                req_names_array: req_names_array,
                dept: dept,
                instructor: instructor,
                time_and_date: {
                    days: time_and_date.days,
                    start: start_time,
                    end: end_time
                },
                if_indept: if_indept,
                if_not_sure: if_not_sure
            }

            homeDict.set("last_time_data", submit_obj);

            //call the meteor method to do the search and get results
            Meteor.call("searchPnc", keyword, term, req_names_array, dept, instructor, time_and_date, if_indept, if_not_sure,
                function(err, result) {
                    if(err){
                        window.alert(err.message);
                        return;
                    }

                    if (result.length == 0) {
                        homeDict.set('noResult', true);
                    } else if (result[0] == "no params") {
                        window.alert("Please enter some search parameters");
                        return;
                    } else {
                        //sort the results so that the reactive table can read a sorted array
                        const sorted_result = result.sort(function(a, b) {
                            //for a
                            //this turns the course code into a form that the natural sorting can compare
                            //for example cosi 2b is larger than cosi 2a
                            //and cosi 11a is larger than cosi 5b
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
                            //this turns the course code into a form that the natural sorting can compare
                            //for example cosi 2b is larger than cosi 2a
                            //and cosi 11a is larger than cosi 5b
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

                            //first priority: term
                            if (parseInt(a.term) < parseInt(b.term)) {
                                return 1;
                            } else if (parseInt(a.term) > parseInt(b.term)) {
                                return -1;
                            } else { //second priority: major code. For example, COSI, MATH, and MUS
                                const major_comp = course_dep_a.localeCompare(course_dep_b);
                                if (major_comp != 0) {
                                    return major_comp;
                                } else { //thrid priority: course number. For example, 1a, 12b and 131a
                                    return comp_string_a.localeCompare(comp_string_b);
                                }
                            }
                        });
                        //this add an index field to each object so that
                        //the reactive table can read the index as a hidden column
                        //thus won't make the data out of order
                        for (let i = 0; i < sorted_result.length; i++) {
                            sorted_result[i].index = i;
                        };
                        homeDict.set('courseData', sorted_result);
                        homeDict.set('noResult', false);
                    }

                    homeDict.set('showTable', true);
                }
            );
        }

    })

    //these initialize the semantic ui components
    $('.js-req').dropdown();
    $('.js-days').dropdown();
    $('#search-select').dropdown();
    $('#search-select-start-time').dropdown();
    $('#search-select-end-time').dropdown();
    $('#multi-select-days').dropdown();
    $('.js-term').dropdown();
    const now_term = GlobalParameters.findOne().current_term;
    $('.js-term').dropdown("set selected", now_term);
    $('.ui.checkbox').checkbox();
    $('.ui.accordion').accordion();

    //this gets all the professors names and initialize the search selection
    //so that the user can search a professor name
    Meteor.call("getProfData", function(err, result) {
        $('#prof-search').search({
            source: result,
            searchFields: [
                'title'
            ],
        });
    })
})

Template.home.helpers({
    showTable: function() {
        return Template.instance().homeDict.get('showTable');
    },

    homeDict: function() {
        return Template.instance().homeDict;
    },

    notTalking: function(){
    	return Template.instance().homeDict.get("notTalking");
    },

    termList: function(){
        return Term.find().fetch().sort(function(a, b){
            return b.id - a.id;
        })
    },
})

Template.home.events({
    "submit #search_main": function(event) {
        event.preventDefault();
    },

    "click .js-voice-search": function() {
        const homeDict = Template.instance().homeDict;
        homeDict.set("notTalking", false);
        homeDict.set('showTable', false);
        homeDict.set('majorDetail', []);
        homeDict.set('sectionDetail', []);
        homeDict.set('courseData');
        homeDict.set('termName');
        homeDict.set('noResult', false);

        const if_clear_params = $(".js-if-clear-params").is(':checked');

        if (if_clear_params) {
            $(".js-submit-search").val("");
            $('.js-term').dropdown('restore defaults');
            $('#search-select').dropdown("clear");
            $('#search-select-start-time').dropdown("clear");
            $('#search-select-end-time').dropdown("clear");
            $('#multi-select-days').dropdown("clear");
            $('#multi-select').dropdown("clear");
            $("#search-select input").val(""); //""for no option and "all" for all departments
            $(".js-prof input").val("");
            $(".js-if-indep").prop("checked", false);
            $(".js-if-not-sure").prop("checked", false);
        }


        var recognition = new webkitSpeechRecognition();

        recognition.onaudioend = function() {
                homeDict.set("notTalking", true);
            },

            recognition.onresult = function(event) {

                const text = event.results[0][0].transcript;

                //sets the user's utterance in homeDict, to show with microphone div
                homeDict.set('userUtterance', text);

                Meteor.call("sendJSONtoAPI_ai", text, { returnStubValue: true },
                    function(error, result) {
                        if (error) {
                            window.alert(error.message);
                            homeDict.set("notTalking", true);
                            return;
                        }

                        const apiRes = result;

                        if (apiRes) {
                            if (apiRes.data.result.parameters) {
                                const dept = apiRes.data.result.parameters.Department;
                                const courseNum = apiRes.data.result.parameters.CourseNumber;
                                const courseName = apiRes.data.result.parameters.CourseName;
                                const termName = apiRes.data.result.parameters.Terms;
                                const instructorName = apiRes.data.result.parameters.Instructor;

                                const apiRes_obj = {
                                    dept: dept,
                                    courseNum: courseNum,
                                    courseName: courseName,
                                    termName: termName,
                                    instructorName: instructorName
                                }

                                homeDict.set("apiResObject", apiRes_obj);

                                const theQuery = dept + " " + courseNum + " " + courseName;

                                homeDict.set("theSearchQuery", theQuery);

                                var term;
                                var instructor;

                                if (apiRes.data.result.parameters.Terms) {
                                    const termString = apiRes.data.result.parameters.Terms;

                                    switch (termString) {
                                        case "Fall 2016":
                                            term = 1163;
                                            break;
                                        case "Fall 2015":
                                            term = 1153;
                                            break;
                                        case "Spring 2016":
                                            term = 1161;
                                            break;
                                        case "Spring 2017":
                                            term = 1171;
                                            break;
                                        case "Summer 2016":
                                            term = 1162;
                                            break;
                                    }
                                    $('.js-term').dropdown('set selected', term);

                                } else {
                                    term = $(".js-term input").val();
                                }

                                if (apiRes.data.result.parameters.Instructor) {
                                    instructor = apiRes.data.result.parameters.Instructor;
                                    $(".js-prof input").val(instructor);
                                } else {
                                    instructor = $(".js-prof input").val();
                                }

                                // if (apiRes.data.result.parameters.Days) {
                                //
                                // 	const daysRes = apiRes.data.result.parameters.Days;
                                //
                                // 	$("select#multi-select-days[multiple][data-value='daysRes']").addClass("active");
                                // }
                                
                                let req_names_array = $(".js-req").dropdown("get values");
                                if(!req_names_array) req_names_array = [];
                                let days_names_array = $(".js-days").dropdown("get values");
                                if(!days_names_array) days_names_array = [];
                                const start_time = $(".js-start-time input").val();
                                const end_time = $(".js-end-time input").val();
                                const time_and_date = {
                                    days: days_names_array,
                                    start: start_time,
                                    end: end_time
                                };
                                const if_indept = $(".js-if-indep").is(':checked');
                                const if_not_sure = $(".js-if-not-sure").is(':checked');

                                if (!/\S/.test(theQuery) && !term && !instructor) {
                                    return;
                                }

                                Meteor.call("searchPnc", theQuery, term, req_names_array, null, instructor, time_and_date, if_indept, if_not_sure,
                                    function(err, result) {
                                        if(err){
                                            window.alert(err.message);
                                            return
                                        }

                                        if (result.length == 0) {
                                            homeDict.set('noResult', true);
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

                                                if (parseInt(a.term) < parseInt(b.term)) {
                                                    return 1;
                                                } else if (parseInt(a.term) > parseInt(b.term)) {
                                                    return -1;
                                                } else {
                                                    const major_comp = course_dep_a.localeCompare(course_dep_b);
                                                    if (major_comp != 0) {
                                                        return major_comp;
                                                    } else {
                                                        return comp_string_a.localeCompare(comp_string_b);
                                                    }
                                                }
                                            });
                                            for (let i = 0; i < sorted_result.length; i++) {
                                                sorted_result[i].index = i;
                                            };
                                            homeDict.set('courseData', sorted_result);
                                            homeDict.set('noResult', false);
                                        }
                                        homeDict.set('showTable', true);
                                        homeDict.set("notTalking", true);
                                    }
                                );
                            } else {
                            	homeDict.set("notTalking", true);
                            }
                        }
                    })
            }
        recognition.start();

    },
})

Template.search_result.onCreated(function() {
    this.searchResultDict = new ReactiveDict();
    this.searchResultDict.set("homeDictSet", false);
})

Template.search_result.onRendered(function() {
    $('#popup-tab .item').tab();
})

Template.search_result.helpers({
    setHomeDict: function(homeDict) {
        Template.instance().homeDict = homeDict;
        Template.instance().searchResultDict.set("homeDictSet", true);
    },

    homeDictSet: function() {
        return Template.instance().searchResultDict.get("homeDictSet");
    },

    detailReady: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('courseInfo') != null;
    },

    courseDataReady: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('courseData') != null;
    },

    courseData: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('courseData');
    },

    courseInfo: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('courseInfo');
    },

    majorInfo: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('majorDetail');
    },

    sectionData: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('sectionDetail');
    },

    notAvailable: function(){
        return Template.instance().homeDict.get("notAvailable");
    },

    noResult: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get('noResult');
    },

    settings_course: function() {
        const homeDict = Template.instance().homeDict;
        return {
            rowsPerPage: 10,
            showFilter: false,
            showNavigationRowsPerPage: false,
            multiColumnSort: false,
            fields: [
                { key: 'index', hidden: true },
                { key: 'name', label: 'Course', headerClass: "four wide", sortable: false },
                { key: 'code', label: 'Code', headerClass: "three wide", sortable: false }, {
                    key: 'requirements',
                    label: 'Requirements',
                    headerClass: "two wide",
                    sortable: false,
                    fn: function(key) {
                        if (key.length != 0) {
                            let result = "";
                            for (let req of key) {
                                result = result + req + " ";
                            };
                            return result;
                        } else {
                            return "/";
                        };
                    }
                },
                { key: 'description', label: 'Description', tmpl: Template.description_detail, headerClass: "five wide", sortable: false }, {
                    key: 'term',
                    label: 'Term',
                    headerClass: "two wide",
                    sortable: false,
                    fn: function(key) {
                        return Term.findOne({ id: key }).name;
                    }
                },
            ],
        };
    },

    sectionDetail: function() {
        const homeDict = Template.instance().homeDict;
        return homeDict.get("sectionDetail")[homeDict.get("sectionIndex")];
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

    getProfInfo: function(prof_list, section_id) {
        const homeDict = Template.instance().homeDict;
        //check if the info is already there
        if(homeDict.get("instructorsName" + section_id)){
            return homeDict.get("instructorsName" + section_id);
        }

        Meteor.call("getProfInfo", prof_list, function(err, result) {
            if(err){
                window.alert(err.message);
                return;
            }

            if (result.includes("Staff")) {
                homeDict.set("instructorsName" + section_id, "Staff - This information will be updated once Brandeis posts the professor names for this section\n");
            } else {
                homeDict.set("instructorsName" + section_id, result);
            }
        });

        return homeDict.get("instructorsName" + section_id);
    },

    profNameLoading: function(section_id) {
        const homeDict = Template.instance().homeDict;
        return !homeDict.get("instructorsName" + section_id);
    },

    sectionNum: function(section_num) {
        if (section_num < 10) {
            return "0" + section_num;
        } else {
            return section_num;
        }
    },

    limitNum: function(limit) {
        if (!limit) {
            return "999";
        } else {
            return limit;
        }
    },

    notFirstTime: function(index) {
        return index != 0;
    },

    getReq: function(req_array) {
        if (req_array.length == 0) {
            return ["/"];
        } else {
            return req_array;
        };
    },

    addedToWishlist: function(event) {
        const homeDict = Template.instance().homeDict;
        const theUserProfile = UserProfilePnc.findOne();
        const currSectionData = homeDict.get("sectionDetail")[homeDict.get("sectionIndex")];

        if (theUserProfile && currSectionData) {
            const theWishlist = theUserProfile.wishlist;
            const section = currSectionData.id;
            return _.contains(theWishlist, section);
        }
    },

    userIsLoggedIn: function(event) {
        const theUserProfile = UserProfilePnc.findOne();
        return theUserProfile;
    },

    getOfferedHistory: function() {
        return Template.instance().homeDict.get("courseOfferings");
    },

    historyReady: function(){
        return Template.instance().homeDict.get("historyReady");
    },

    fetchHistory: function(){
        const homeDict = Template.instance().homeDict;
        const currCourseData = homeDict.get("courseInfo");
        if(!currCourseData) return;

        Meteor.call("getCourseHistory", currCourseData.continuity_id,
            function(err, result) {
                if (err) {
                    window.alert(err.message);
                    return;
                }

                homeDict.set("courseOfferings", result);
                homeDict.set("historyReady", true);
            }
        );
    }
})

Template.search_result.events({
    "click .js-result-table tbody tr": function(event) {
        if (event.target.nodeName === "DIV" || event.target.nodeName === "I" || event.target.className === "description") {
            return;
        }

        const homeDict = Template.instance().homeDict;
        homeDict.set('courseInfo');
        homeDict.set('sectionDetail', []);
        homeDict.set('notAvailable', false);
        homeDict.set('majorDetail', []);
        homeDict.set('instructors');
        homeDict.set('courseInfo', this);
        homeDict.set('courseCode', this.code);
        homeDict.set("sectionIndex", 0);
        homeDict.set("historyReady", false);
        //reset the default detail choice to be the first tab
        $("#popup-tab .item.active").attr("class", "item");
        $("#popup-tab [data-tab=first]").attr("class", "item active");
        $(".ui.container.popup .segment.active").attr("class", "ui bottom attached tab segment");
        $(".ui.container.popup [tab-num=1]").attr("class", "ui bottom attached tab segment active");

        let popup = $(".popup");
        $('.popup').css("top", 40 + $(window).scrollTop());
        if($(window).width() < 768){
            $('.popup').css("left", -55);
        } else {
            $('.popup').css("left", (($(".move").width() - $('.popup').width()) / 2) - 80);
        }
        $(".overlay, .popup").fadeToggle();

        if (!homeDict.get('courseInfo')) { //continue only if the data is ready
            return;
        };

        //get major details
        Meteor.call("getMajorDetails", homeDict.get('courseInfo'),
            function(err, result) {
                if(err){
                    window.alert(err.message);
                    return;
                }

                homeDict.set('majorDetail', result);
            }
        );

        //get section details
        Meteor.call("getSectionDetails", homeDict.get('courseInfo'),
            function(err, result) {
                if(err){
                    window.alert(err.message);
                    return
                }

                homeDict.set('sectionDetail', _.sortBy(result,
                    function(section) {
                        return parseInt(section.section);
                    }
                ));

                if(result.length == 0) homeDict.set("notAvailable", true);
            }
        );
    },

    "click .overlay,.js-close-popup": function(event) {
        $(".overlay, .popup").fadeToggle();
    },

    "change .js-section": function(event) {
        const homeDict = Template.instance().homeDict;
        event.preventDefault();
        homeDict.set("sectionIndex", $(".js-section").val());
        homeDict.set("instructorsName");
    },

    "click .js-add-to-list": function(event) {
        const homeDict = Template.instance().homeDict;
        event.preventDefault();

        const currSectionData = homeDict.get("sectionDetail")[homeDict.get("sectionIndex")];
        Meteor.call("addToWishlist", currSectionData.id, function(err){
            if(err){
                window.alert(err.message);
                return;
            }
        });
    },

    "click .js-section-up": function(event) {
        const homeDict = Template.instance().homeDict;
        event.preventDefault();

        const currSection = homeDict.get("sectionIndex");
        if (currSection !== 0) {
            homeDict.set("sectionIndex", currSection - 1);
            $(".js-section").val(currSection - 1);
        }
        homeDict.set("instructorsName");
    },

    "click .js-section-down": function(event) {
        const homeDict = Template.instance().homeDict;
        event.preventDefault();

        const currSection = homeDict.get("sectionIndex");
        const numOfSections = homeDict.get("sectionDetail").length;
        if (currSection < numOfSections - 1) {
            homeDict.set("sectionIndex", currSection + 1);
            $(".js-section").val(currSection + 1);
        }
        homeDict.set("instructorsName");
    },

    "click .js-textbook": function(event) {
        const homeDict = Template.instance().homeDict;
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

Template.description_detail.onRendered(function() {
    $('.ui.accordion').accordion();
})

Template.description_detail.helpers({
    showDescription: function(text) {
        if (text.length > 50) {
            return text.substring(0, 50) + "...";
        } else {
            return text;
        };
    },
})

Template.search_result_time_table.onCreated(function() {
    this.timeTableDict = new ReactiveDict();
    this.timeTableDict.set("homeDictSet", false);
})

Template.search_result_time_table.helpers({
    setHomeDict: function(homeDict) {
        Template.instance().homeDict = homeDict;
        Template.instance().timeTableDict.set("homeDictSet", true)
    },

    homeDictSet: function() {
        return Template.instance().timeTableDict.get("homeDictSet");
    },

    sectionData: function() {
        const homeDict = Template.instance().homeDict;
        const data = homeDict.get('sectionDetail').sort(function(a, b){return a.section - b.section});

        for(let i = 0; i < data.length; i++){
            data[i].index = i;
        }
        return data;
    },

    settings_result: function() {
        const homeDict = Template.instance().homeDict;
        return {
            rowsPerPage: 5,
            showFilter: false,
            showNavigationRowsPerPage: false,
            multiColumnSort: false,
            fields: [{
                    key: 'section',
                    label: 'Section',
                    sortable: false,
                    fn: function(key) {
                        var section = key;
                        if (section < 10) {
                            section = "0" + section;
                        };

                        return "Section " + section; //section 01,02,...,09,10,11 so that reactive table can sort correctly
                    }
                }, {
                    key: 'enrolled',
                    label: 'Enrolled',
                    sortable: false,
                    fn: function(key, object) {
                        var limit = object.limit;
                        if (!limit) {
                            limit = 999;
                        };

                        return key + "/" + limit; //shows enrollment as enrolled/limit
                    }
                },
                { key: 'status_text', label: 'Status', sortable: false }, {
                    key: 'times',
                    label: 'Times',
                    sortable: false,
                    fn: function(key) {
                        var result = "";
                        for (var item of key) {
                            //get days
                            days = "";
                            const day1 = "m";
                            const day2 = "tu";
                            const day3 = "w";
                            const day4 = "th";
                            const day5 = "f";
                            if ($.inArray(day1, item.days) != -1) {
                                days = days + day1.toUpperCase() + " ";
                            }
                            if ($.inArray(day2, item.days) != -1) {
                                days = days + day2.toUpperCase() + " ";
                            }
                            if ($.inArray(day3, item.days) != -1) {
                                days = days + day3.toUpperCase() + " ";
                            }
                            if ($.inArray(day4, item.days) != -1) {
                                days = days + day4.toUpperCase() + " ";
                            }
                            if ($.inArray(day5, item.days) != -1) {
                                days = days + day5.toUpperCase() + " ";
                            }

                            //get times
                            const start = item.start;
                            const end = item.end;
                            var start_min = Math.floor(start % 60);
                            if (start_min < 10) {
                                start_min = "0" + start_min;
                            }

                            var end_min = Math.floor(end % 60);
                            if (end_min < 10) {
                                end_min = "0" + end_min;
                            }

                            var start = Math.floor(start / 60) + ":" + start_min;
                            var end = Math.floor(end / 60) + ":" + end_min;
                            const time = start + "-" + end;

                            result = result + days + ": " + time + "<br>";
                        };

                        if (result) {
                            return new Spacebars.SafeString(result);
                        } else {
                            return "TBA";
                        };
                    }
                }, {
                    key: 'instructors',
                    label: 'Instructor',
                    sortable: false,
                    fn: function(key, object) {
                        //check if the info is already there
                        if(homeDict.get("instructors" + object.id)){
                            return new Spacebars.SafeString(homeDict.get("instructors" + object.id));
                        }

                        Meteor.call("searchInstructorArray", key, function(err, result) {
                            if(err){
                                window.alert(err.message);
                                return;
                            }

                            homeDict.set("instructors" + object.id, result);
                        });

                        const instructors = homeDict.get("instructors" + object.id);
                        if (!instructors) {
                            return new Spacebars.SafeString("<div class=\"ui active inline loader\"></div>");
                        } else {
                            return new Spacebars.SafeString(instructors);
                        };
                    }
                }, {
                    key: 'index',
                    hidden: true
                },
            ],
        };
    },
})
