Template.planSearch.onCreated(function(){
    this.planSearchDict = new ReactiveDict();
    this.planSearchDict.set('showTable', false);
    this.planSearchDict.set('majorDetail', []);
    this.planSearchDict.set('sectionDetail', []);
    this.planSearchDict.set("sectionIndex", 0);
    this.planSearchDict.set('courseData');
    this.planSearchDict.set('clickedNext', false);
})

Template.planSearch.onRendered(function() {
    
})

Template.planSearch.helpers({
    showTable: function(planDict) {
        return Template.instance().planSearchDict.get('showTable');
    },

    planSearchDict: function(){
        return Template.instance().planSearchDict;
    },

    hasClickedNext: function(){
        return Template.instance().planSearchDict.get("clickedNext");
    },

    clickedNext: function(dict){
        dict.set("pageName", "makeSchedule");
    },

    passMajor: function(dict){
        Template.instance().planSearchDict.set("majorId", dict.get("chosenMajor"));
    },

    hasMajor: function(){
        return !!Template.instance().planSearchDict.get("majorId");
    },

    getData: function(){
        const planDict = Template.instance().planSearchDict;
        planDict.set('showTable', false);
        planDict.set('majorDetail', []);
        planDict.set('sectionDetail', []);
        planDict.set('courseData');
        planDict.set('termName');
        planDict.set('noResult', false);

        const dept = planDict.get("majorId"); //""for no option and "all" for all departments

        Meteor.call("searchCourse", "", "", [], dept, "", {
            days: [],
            start: "",
            end: ""
        }, false, false,
            function(err, result) {
                if (result.length == 0) {
                    planDict.set('noResult', true);
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
                    planDict.set('courseData', sorted_result);
                    planDict.set('noResult', false);
                }

                planDict.set('showTable', true);
            }
        );
    }
})

Template.planSearch.events({
    "click .js-makeSchedule": function(event){
        event.preventDefault();
        Template.instance().planSearchDict.set("clickedNext", true);
    },
})

Template.plan_result.helpers({
    detailReady: function(planDict) {
        return planDict.get('courseInfo') != null;
    },

    courseDataReady: function(planDict) {
        return planDict.get('courseData') != null;
    },

    courseData: function(planDict) {
        return planDict.get('courseData');
    },

    courseInfo: function(planDict) {
        return planDict.get('courseInfo');
    },

    majorInfo: function(planDict) {
        return planDict.get('majorDetail');
    },

    sectionData: function(planDict) {
        return planDict.get('sectionDetail');
    },

    noResult: function(planDict) {
        return planDict.get('noResult');
    },

    settings_course: function(planDict) {
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
