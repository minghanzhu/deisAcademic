Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{
	name: 'home',
	waitOn: function(){
		return Meteor.subscribe("userProfilePnc");
	}
});
Router.route('/schedule',{name: 'schedule'});
Router.route('/myProfile',{name: 'myProfile'});
Router.route('speechTest', {name: 'speechTest'});
Router.route('ct', {name: 'calendarTest'});
Router.route('/decidemajor', {name: 'decidemajor'});
Router.route('/skelSched', {name: 'skelSched'});
Router.route('/majorList', {name: 'majorList'});
Router.route('/majorSelect', {name: 'majorSelect'});
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