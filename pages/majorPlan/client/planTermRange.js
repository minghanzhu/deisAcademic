Template.planTermRange.onCreated(function(){
	this.termRangeDict = new ReactiveDict();
    this.termRangeDict.set("clickedOK", false);
})

Template.planTermRange.onRendered(function(){
	$('#search-select-start-semester').dropdown({
        match: "text"
    });
    $('#search-select-end-semester').dropdown({
        match: "text"
    });
	const start_semester = Template.instance().masterDict.get("planStartSemester");
    const end_semester = Template.instance().masterDict.get("planEndSemester");
	$(".js-start-semester").dropdown("set selected", start_semester)
	$(".js-end-semester").dropdown("set selected", end_semester)
})

Template.planTermRange.helpers({
	clickedOK: function(dict) {
        dict.set("pageName", "chooseCourse");
    },

    hasClickedOK: function() {
        return Template.instance().termRangeDict.get("clickedOK");
    },

    setMasterDict: function(dict) { //this saves the master dict to the template
        Template.instance().masterDict = dict;
    },

    termList: function(){
        const termList = Term.find().fetch().sort(function(a, b){
            return parseInt(b.id) - parseInt(a.id);
        });

        return termList;
    },
})

Template.planTermRange.events({
	"click .js-ok": function() {
        event.preventDefault();
        //get the sorted term list
        let termList = [];
        for(let term of Term.find().fetch()){
            const id = term.id
            termList.push(id);
        };
        termList = termList.sort(function(a, b){
            return parseInt(a) - parseInt(b);
        });
        //check if the semesters chosen are valid
        Template.instance().masterDict.set("planStartSemester", $(".js-start-semester input").val());
        Template.instance().masterDict.set("planEndSemester", $(".js-end-semester input").val());
        const start_semester = Template.instance().masterDict.get("planStartSemester");
        const end_semester = Template.instance().masterDict.get("planEndSemester");

        if(!start_semester){
            window.alert("Please enter the starting semester");
            return;
        }

        if(!end_semester){
            window.alert("Please enter the ending semester");
            return;
        }

        if($.inArray(end_semester, termList) - $.inArray(start_semester, termList) < 0){
            window.alert("Please make sure that the semester range is correct");
            return;
        } else if ($.inArray(end_semester, termList) - $.inArray(start_semester, termList) == 0){
            window.alert("Please choose two different semesters");
            return;
        }

        $(".js-majorGo").attr("class", "ui loading disabled button js-ok");

        const chosenTerm = Template.instance().masterDict.get("chosenTerm");
        if(chosenTerm < start_semester || chosenTerm > end_semester){
            Template.instance().masterDict.set("chosenTerm", start_semester);
        };

        const scheduleList = Template.instance().masterDict.get("scheduleList");
        for(let term in scheduleList){
            if(term < start_semester || term > end_semester){
                delete scheduleList[term];
            }
        };
        Template.instance().masterDict.set("scheduleList", scheduleList);

        Template.instance().termRangeDict.set("clickedOK", true);
    },
})