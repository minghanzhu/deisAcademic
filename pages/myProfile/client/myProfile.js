Template.myProfile.onCreated(function() {
    this.myPageDict = new ReactiveDict();
    this.myPageDict.set('pageName', "");
})


Template.myProfile.helpers({
    seeMajorPlan: function() {
        return Template.instance().myPageDict.get('pageName') == "majorPlan";
    },

    seeSchedule: function() {
        return Template.instance().myPageDict.get('pageName') == "schedule";
    },
})


Template.myProfile.events({
    "click .js-majorPlan": function(event) {
        event.preventDefault();
        Template.instance().myPageDict.set('pageName', "majorPlan");
    },

    "click .js-schedule": function(event) {
        event.preventDefault();
        Template.instance().myPageDict.set('pageName', "schedule");
    },
})
