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

Meteor.publish("home_term", function() {
    return Term.find({},{
        fields: {
            id: 1,
            name: 1
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

Meteor.publish("view_plan_term", function() {
    return Term.find({},{
    	fields: {
    		id: 1,
    		name: 1
    	}
    }) 
});

Meteor.publish("view_plan_majorPlans", function() {
    return MajorPlansPnc.find({ 
    	userId: this.userId 
    },{
    	fields:{
    		majorName: 1,
    		start_term: 1,
    		end_term: 1
    	}
    }) 
});

Meteor.publish("modify_plan_term", function() {
    return Term.find({},{
    	fields: {
    		id: 1,
    		name: 1
    	}
    }) 
});

Meteor.publish("modify_plan_majorPlans", function(plan_id) {
    if(!/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/.test(plan_id)){
        console.log("Invalid plan id");
        return;
    }

    if(!MajorPlansPnc.findOne(plan_id)){
        console.log("Invalid plan id");
        return;
    }

    const plan_obj = MajorPlansPnc.findOne(plan_id);
    const plan_user = plan_obj.userId;
    if(!this.userId){
        return MajorPlansPnc.find( 
            plan_id, {
            fields:{
                scheduleList: 1,
                chosenCourse: 1,
                majorId: 1,
                start_term: 1,
                end_term: 1
            }
        })
    } else if(this.userId !== plan_user){
        return MajorPlansPnc.find( 
            plan_id, {
            fields:{
                scheduleList: 1,
                chosenCourse: 1,
                majorId: 1,
                start_term: 1,
                end_term: 1
            }
        })
    } else {
        return MajorPlansPnc.find({ 
            userId: this.userId 
        },{
            fields:{
                scheduleList: 1,
                chosenCourse: 1,
                majorId: 1,
                start_term: 1,
                end_term: 1
            }
        }) 
    }    
});

Meteor.publish("modify_plan_userProfile", function() {
    return UserProfilePnc.find({ 
        userId: this.userId 
    },{
        fields: {
            wishlist: 1
        }
    }) 
});

Meteor.publish("wishlist_userProfile", function() {
    return UserProfilePnc.find({ 
        userId: this.userId 
    },{
        fields: {
            wishlist: 1
        }
    }) 
});

Meteor.publish("layout_userProfile", function() {
    return UserProfilePnc.find({ 
        userId: this.userId 
    },{
        fields: {
            userId: 1
        }
    }) 
});