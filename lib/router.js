Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading'
});

Router.route('/',{
	name: 'home',
	waitOn: function(){
		return [Meteor.subscribe("home_userProfile"), Meteor.subscribe("home_term"), Meteor.subscribe("globalParameters")];
	}
});

Router.route('/schedule',{
	name: 'schedule',
	waitOn: function(){
		return [Meteor.subscribe("schedule_userProfile"), Meteor.subscribe("schedule_term"), Meteor.subscribe("schedule_schduleList")];
	}
});

Router.route('/majorPlan/new', {
	name: 'masterMajorPlan',
	waitOn: function(){
		return [Meteor.subscribe("new_plan_profData"), Meteor.subscribe("new_plan_term"), Meteor.subscribe("new_plan_userProfile")];
	},
	action: function(){
	 	this.render(Template.masterMajorPlan);
	}
});

Router.route('/myMajorPlan', {
	name: 'majorPlanView',
	waitOn: function(){
		return [Meteor.subscribe("view_plan_term"), Meteor.subscribe("view_plan_majorPlans")];
	}
});

Router.route('/majorPlan/:_id',{
	waitOn: function(){
		return [Meteor.subscribe("modify_plan_term"), Meteor.subscribe("modify_plan_majorPlans", this.params._id), Meteor.subscribe("modify_plan_userProfile"), Meteor.subscribe("modify_plan_profData")];
	},
	data: function(){
		return {
			isModify: true,
			plan_obj: MajorPlansPnc.findOne(this.params._id)
		};
	},
	action: function(){
	 	this.render("masterMajorPlan");
	}
});

Router.route("/myWishlist", {
	name:'wishlist',
	waitOn: function(){
		return Meteor.subscribe("wishlist_userProfile");
	}
});

Router.route("/myProfile", {
	name:'userProfile',
	waitOn: function(){
		return [Meteor.subscribe("profile_userProfile"), Meteor.subscribe("profile_majorPlans"), Meteor.subscribe("profile_term")]
	}
})

Router.route('/terms',{name: 'terms'});

Router.route('/privacy',{name: 'privacy'});

Router.route('/FAQ',{name: 'faq_page'});
