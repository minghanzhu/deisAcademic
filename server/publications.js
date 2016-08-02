Meteor.publish("userProfilePnc", function() {
    return UserProfilePnc.find({ userId: this.userId }) });
Meteor.publish("schedulesPnc", function() {
    return SchedulesPnc.find({ userId: this.userId }) });
Meteor.publish("majorPlansPnc", function() {
    return MajorPlansPnc.find({ userId: this.userId }) });
Meteor.publish("major", function() {
    return Major.find() });
Meteor.publish("term", function() {
    return Term.find() });


Meteor.publish("home_userProfile", function() {
    return UserProfilePnc.find({ 
    	userId: this.userId 
    },{
    	fields: {
    		userId: 1,
    		wishlist: 1
    	}
    }) 
});

Meteor.publish("schedule_userProfile", function() {
    return UserProfilePnc.find({ 
    	userId: this.userId 
    },{
    	fields: {
    		scheduleList: 1,
    		wishlist: 1
    	}
    }) 
});

Meteor.publish("schedule_term", function() {
    return Term.find({},{
    	fields: {
    		id: 1,
    		name: 1
    	}
    }) 
});

Meteor.publish("new_plan_term", function() {
    return Term.find({},{
    	fields: {
    		id: 1,
    		name: 1
    	}
    }) 
});

Meteor.publish("new_plan_userProfile", function() {
    return UserProfilePnc.find({ 
    	userId: this.userId 
    },{
    	fields: {
    		wishlist: 1
    	}
    }) 
});