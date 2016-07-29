Meteor.publish("userProfilePnc", function(){return UserProfilePnc.find({userId: this.userId})});
Meteor.publish("schedulesPnc", function(){return SchedulesPnc.find({userId: this.userId})});
Meteor.publish("majorPlansPnc", function(){return MajorPlansPnc.find({userId: this.userId})});
Meteor.publish("major", function(){return Major.find()});