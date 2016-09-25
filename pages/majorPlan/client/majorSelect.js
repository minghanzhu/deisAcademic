Template.majorSelect.onCreated(function() {
    this.majorSelectDict = new ReactiveDict();
    this.majorSelectDict.set("clickedGo", false);
    this.majorSelectDict.set("clickedHelp", false);
    this.majorSelectDict.set("allowed_new_terms", 6);//3 years
    this.majorSelectDict.set("newest_term", Term.find().fetch()[Term.find().count() - 1]);

    const term_list = Term.find().fetch().sort(function(a, b){
        return parseInt(a.id) - parseInt(b.id);
    });

    for(let i = 0; i < Template.instance().majorSelectDict.get("allowed_new_terms"); i++){
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

    const result = term_list.sort(function(a, b){
        return parseInt(b.id) - parseInt(a.id);
    });
    this.majorSelectDict.set("term_list", result);
})

Template.majorSelect.onRendered(function() {
    $('#search-select').dropdown({
        match: "text"
    });
    $('#search-select-start-semester').dropdown({
        match: "text"
    });
    $('#search-select-end-semester').dropdown({
        match: "text"
    });
    const major = $("#search-select input").val();
    $('#help-major').popup({
        content: "Sorry, we are still finalizing this feature...",
        position: 'top center',
    });
});

Template.majorSelect.helpers({
    clickedGo: function(dict) {
        dict.set("pageName", "chooseCourse");
        dict.set("chosenMajor", $("#search-select input").val());
    },

    hasClickedGo: function() {
        return Template.instance().majorSelectDict.get("clickedGo");
    },

    clickedHelp: function(dict) {
        dict.set("pageName", "helpChooseMajor");
        dict.set("chosenMajor", $("#search-select input").val());
    },

    hasClickedHelp: function() {
        return Template.instance().majorSelectDict.get("clickedHelp");
    },

    setMasterDict: function(dict) { //this saves the master dict to the template
        Template.instance().masterDict = dict;
    },

    termList: function(){
        return Template.instance().majorSelectDict.get("term_list");
    },
})

Template.majorSelect.events({
    "click .js-majorGo": function(event) {
        event.preventDefault();
        //get the sorted term list
        let termList = [];
        for(let term of Template.instance().majorSelectDict.get("term_list")){
            termList.push(term.id);
        };
        termList = termList.sort(function(a, b){
            return parseInt(a) - parseInt(b);
        });

        //check if the major is chosen
        if (!$("#search-select input").val()) {
            window.alert("Please choose a major. \nOr click the button below.");
            return;
        };

        //check if the semesters chosen are valid
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");
        const term_range = {
            start_term: start_semester,
            end_term: end_semester
        };

        if(!start_semester){
            window.alert("Please enter the starting semester");
            return;
        }

        if(!end_semester){
            window.alert("Please enter the ending semester");
        }

        if($.inArray(end_semester, termList) - $.inArray(start_semester, termList) < 0){
            window.alert("Please make sure that the semester range is correct");
            return;
        } else if ($.inArray(end_semester, termList) - $.inArray(start_semester, termList) == 0){
            window.alert("Please choose two different semesters");
            return;
        }

        $(".js-majorGo").attr("class", "medium ui primary loading disabled button js-majorGo");
        const dict = Template.instance().majorSelectDict;
        Meteor.call("checkValidPlan", term_range, $("#search-select input").val(), function(err, result){
            if(err){
                window.alert(err.message);
                $(".js-majorGo").attr("class", "medium ui primary button js-majorGo");
                return;
            }

            if(result){
                dict.set("clickedGo", true);
            } else {
                window.alert("You already have a plan for this major during the same time range");
                $(".js-majorGo").attr("class", "medium ui primary button js-majorGo");
                return;
            }
        })
    },

    "click .js-majorBulletin": function(event) {
        event.preventDefault();
        Template.instance().majorSelectDict.set("clickedHelp", true);
    },

    "change .js-start-semester": function(){
        const planStartSemester = $(".js-start-semester input").val();
        Template.instance().masterDict.set("planStartSemester", planStartSemester);
    },

    "change .js-end-semester": function(){
        const planEndSemester = $(".js-end-semester input").val();
        Template.instance().masterDict.set("planEndSemester", planEndSemester);
    },
});


Template.majorList.helpers({
    scienceMajorList: function() {
        return Major.find({ school: "School of Science" });
    },

    socialMajorList: function() {
        return Major.find({ school: "School of Social Science" });
    },

    humanitiesMajorList: function() {
        return Major.find({ school: "School of Humanities" });
    },

    creativeMajorList: function() {
        return Major.find({ school: "School of Creative Arts" });
    },

    major: function() {
        // return Major.find({name: homeDict.get('majorName')}).fetch()[0];
        return Major.findOne({ name: homeDict.get('majorName') });
    }
});


Template.majorList.events({
    "click .bulletin-overlay,.js-close-popup": function(event) {
        $(".bulletin-overlay, .popup-bulletin").fadeToggle();
    },
});

Template.science.events({
    "click .js-popup": function(event) {
        const name = event.target.innerText;
        homeDict.set('majorName', name);
        let popup = $(".popup-bulletin");
        popup.css("top", (($(window).height() - popup.outerHeight()) / 2) + $(window).scrollTop() + 30 + "px");
        $(".bulletin-overlay, .popup-bulletin").fadeToggle();
    },
});
