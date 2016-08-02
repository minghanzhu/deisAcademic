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
    	fields:{
    		userId: 1,
    		wishlist: 1
    	}
    }) 
});
