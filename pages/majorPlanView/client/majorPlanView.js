Template.majorPlanView.helpers({
    hasMajorPlan: function() {
        return MajorPlansPnc.find().count() != 0;
    },

    getUserPlans: function() {
        return MajorPlansPnc.find().fetch();
    },

    dataReady: function() {
        return !!UserProfilePnc.findOne() &&
            MajorPlansPnc.find().fetch() != 0;
    },
})

Template.majorPlanView.events({
	"click .js-go-plan": function(event){
		event.preventDefault();
		if(!$("#search-select-plans input").val()){
			window.alert("Plaese choose a plan first");
			return;
		}
		const plan_id = $("#search-select-plans input").val();
		Router.go('/majorPlan/' + plan_id);
	},
})

Template.planList.onRendered(function(){
	$("#search-select-plans").dropdown({
        match: "text"
    });
})

Template.planList.events({

})