Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{
	name: 'home',
	waitOn: function(){
		return Meteor.subscribe("home_userProfile");
	}
});
Router.route('/schedule',{
	name: 'schedule',
	waitOn: function(){
		return [Meteor.subscribe("schedule_userProfile"), Meteor.subscribe("schedule_term")];
	}
});

Router.route('/majorPlan/new', {
	name: 'masterMajorPlan',
	waitOn: function(){
		return [Meteor.subscribe("new_plan_term"), Meteor.subscribe("major"), Meteor.subscribe("new_plan_userProfile")];
	}
});

Router.route('/myMajorPlan', {
	name: 'majorPlanView',
	waitOn: function(){
		return [Meteor.subscribe("schedulesPnc"), Meteor.subscribe("major"), Meteor.subscribe("userProfilePnc"), Meteor.subscribe("majorPlansPnc")];
	},
});

Router.route('/majorPlan/:_id', 
	{name: 'masterPlanModify',
	 waitOn: function(){
	 	return [Meteor.subscribe("term"), Meteor.subscribe("schedulesPnc"), Meteor.subscribe("majorPlansPnc"), Meteor.subscribe("major"), Meteor.subscribe("userProfilePnc")];
	 },
	 data: function(){
	 	return MajorPlansPnc.findOne({_id: this.params._id});
	 }
});

Router.route("/myWishlist", {
	name:'wishlist',
	waitOn: function(){
		return Meteor.subscribe("userProfilePnc");
	}
});

///////////////////////////
//There are waiting to be changed

Router.route('/myProfile',{
	name: 'myProfile',
	waitOn: function(){
		return [Meteor.subscribe("term"), Meteor.subscribe("schedulesPnc"), Meteor.subscribe("majorPlansPnc"), Meteor.subscribe("major"), Meteor.subscribe("userProfilePnc")]
	}
});

Router.route('/cssTest', {name: 'cssTest'});