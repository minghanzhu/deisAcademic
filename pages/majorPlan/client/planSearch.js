Template.planSearch.onCreated(function(){
    this.masterDict = this.data["dict"];
    this.planSearchDict = this.data["dict"];
    this.planSearchDict.set('majorId', this.data["dict"].get('chosenMajor'));
    this.planSearchDict.set('showTable', false);
    this.planSearchDict.set('courseData');
    this.planSearchDict.set('clickedNext', false);
    this.planSearchDict.set('clickedTerm', false);
})

Template.planSearch.onRendered(function(){
    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });
})

Template.planSearch.helpers({
    showTable: function() {
        const planDict = Template.instance().planSearchDict;
        return Template.instance().planSearchDict.get('showTable');
    },

    planSearchDict: function(){
        return Template.instance().planSearchDict;
    },

    hasClickedNext: function(){
        return Template.instance().planSearchDict.get('clickedNext');
    },

    clickedNext: function(){
        const dict = Template.instance().masterDict;
        dict.set("pageName", 'makeSchedule');
    },

    hasClickedTerm: function(){
        return Template.instance().planSearchDict.get('clickedTerm');
    },

    clickedTerm: function(){
        const dict = Template.instance().masterDict;
        dict.set("pageName", 'changeTerm');
    },

    hasMajor: function(){
        return !!Template.instance().planSearchDict.get('majorId');
    },

    getData: function(){
        const planDict = Template.instance().planSearchDict;
        const masterDict = Template.instance().masterDict;
        if(masterDict.get("fetched_planSearchData")){
            planDict.set("courseData", masterDict.get("fetched_planSearchData"));
            planDict.set('noResult', false);
            planDict.set('showTable', true);
            return;
        } 
        
        planDict.set('showTable', false);
        planDict.set('courseData');
        planDict.set('noResult', false);

        const dept = planDict.get('majorId'); //""for no option and "all" for all departments
        const start_term = Template.instance().masterDict.get("planStartSemester");
        const end_term = Template.instance().masterDict.get("planEndSemester");

        Meteor.call("planSearch", dept,
            function(err, result) {
                if(err){
                    window.alert(err.message);
                    return;
                }

                if (result.length == 0) {
                    planDict.set('noResult', true);
                } else {
                    //first group them by majors, continuity id's and terms.
                    const sorted_result = result.sort(function(a, b) {
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

                    for (let i = 0; i < sorted_final_result.length; i++) {
                        sorted_final_result[i].index = i;
                    };
                    planDict.set('courseData', sorted_final_result);
                    masterDict.set("fetched_planSearchData", sorted_final_result);
                    planDict.set('noResult', false);
                }

                planDict.set('showTable', true);
            }
        );
    },

    isNewPlan: function(){
        return !Template.instance().masterDict.get("isModify");
    },
})

Template.planSearch.events({
    "click .js-makeSchedule": function(event){
        event.preventDefault();
        const courseList = Template.instance().masterDict.get("chosenCourse");
        if(!courseList){
            window.alert("You haven't chosen any course yet!");
            return;
        } else {
            if(courseList.length == 0) {
                window.alert("You haven't chosen any course yet!");
                return;
            } 
        };

        Template.instance().planSearchDict.set('clickedNext', true);
    },

    "click .js-changeMajor": function(event){
        event.preventDefault();
        window.location.reload();
    },

    "click .js-changeTerm": function(event){
        event.preventDefault();
        Template.instance().planSearchDict.set('clickedTerm', true);
    },
})

Template.plan_result.onCreated(function(){
    this.filter_code = new ReactiveTable.Filter('planSearch_filter_code', ['code']);
    this.filter_name = new ReactiveTable.Filter('planSearch_filter_name', ['name']);
    this.masterDict = this.data["dict"];//save the dict to the template
    this.planResultDict = this.data["dict"];
})

Template.plan_result.onRendered(function() {
    $('.ui.accordion').accordion();
    //clean all filters first
    Template.instance().filter_code.set("");
    Template.instance().filter_name.set("");

    const sticky_height = $("#planSearch_result").height();
    const target_height = $("#major_info").height();
    if(sticky_height < target_height){
        $('#planSearch_result').sticky({
            context: '#major_info',
            observeChanges: true
        });
    } else {
        $('#planSearch_result').sticky({
            context: false,
            observeChanges: true
        });
    }
})

Template.plan_result.helpers({
    detailReady: function() {
        const planDict = Template.instance().planResultDict;
        return planDict.get('courseInfo') != null;
    },

    courseDataReady: function() {
        const planDict = Template.instance().planResultDict;
        return planDict.get('courseData') != null;
    },

    courseData: function() {
        const planDict = Template.instance().planResultDict;
        return planDict.get('courseData');
    },

    settings_course: function() {
        const chosen_course = Template.instance().planResultDict.get('chosenCourse');
        return {
            rowsPerPage: 10,
            showFilter: false,
            filters: ["planSearch_filter_code", "planSearch_filter_name"],
            showNavigationRowsPerPage: false,
            multiColumnSort: false,
            filterOperator: "$or",
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
                    if($.inArray(courseId, chosen_course) != -1){
                        return new Spacebars.SafeString("<div class=\"ui fitted slider checkbox\"> <input type='checkbox' id=\"" + courseId + "\" checked='checked'> <label></label> </div>");
                    } else {
                        return new Spacebars.SafeString("<div class=\"ui fitted slider checkbox\"> <input type='checkbox' id=\"" + courseId + "\"> <label></label> </div>");
                    }  
                }
            }],
        };
    },
})

Template.plan_result.events({
    "click .js-result-table tbody tr": function(event) {
        if (event.target.nodeName == "INPUT") {
            let chosen_array = Template.instance().planResultDict.get('chosenCourse');
            if(!chosen_array){
                chosen_array = [];
            };
            const isChecked = $("#" + this.continuity_id).is(":checked");
            const id = this.continuity_id;
            if(isChecked){//put the course code to the array
                chosen_array.push(id);
            } else {//remove the course code from the array
                const id_index = $.inArray(id, chosen_array);
                chosen_array.splice(id_index, 1);
            }
            Template.instance().planResultDict.set('chosenCourse', chosen_array);
        }
    },

    "keyup #planSearchFilter, input #planSearchFilter": function(event){
        let keyword = $(event.target).val();
        keyword = keyword.replace(/[^a-z0-9 ]/gi, "\\$&");
        //first clean all the filter settings
        Template.instance().filter_code.set("");
        Template.instance().filter_name.set("");

        //then add corresponding regex's
        const regex_code = new RegExp("^" + keyword, "i");
        const regex_name = new RegExp(keyword, "i");
        Template.instance().filter_code.set(regex_code);
        Template.instance().filter_name.set(regex_name);
    },
})
