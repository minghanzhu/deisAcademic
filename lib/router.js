Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{
	name: 'home',
	waitOn: function(){
		return Meteor.subscribe("userProfilePnc");
	}
});
Router.route('/schedule',{
	name: 'schedule',
	waitOn: function(){
		return [Meteor.subscribe("schedulesPnc"), Meteor.subscribe("userProfilePnc"), Meteor.subscribe("term")];
	}
});
Router.route('/myProfile',{name: 'myProfile'});

Router.route('/cssTest', {name: 'cssTest'});
Router.route('/masterMajorPlan', {
	name: 'masterMajorPlan',
	waitOn: function(){
		return [Meteor.subscribe("schedulesPnc"), Meteor.subscribe("majorPlansPnc"), Meteor.subscribe("major")];
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
	 	return [Meteor.subscribe("schedulesPnc"), Meteor.subscribe("majorPlansPnc"), Meteor.subscribe("major")];
	 },
	 data: function(){
	 	return MajorPlansPnc.findOne({_id: this.params._id});
	 }
});
