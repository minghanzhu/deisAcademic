Meteor.publish("globalParameters", function(){
    return GlobalParameters.find();
});

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

Meteor.publish("schedule_schduleList", function() {
    return SchedulesPnc.find({ userId: this.userId, plan:{$exists:false}}, {
        fields: {
            term: 1
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

Meteor.publish("new_plan_profData", function(){
    return Instructor.find({},{
        fields: {
            id: 1,
            first: 1,
            last: 1,
            email: 1
        }
    }) 
})

//Meteor.publish("new_plan_prediction", function(){
//    return CoursePrediction.find();
//})

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
        //console.log("Invalid plan id");
        return MajorPlansPnc.find(plan_id);
    } else {
        const plan_obj = MajorPlansPnc.findOne(plan_id);
        const userId = plan_obj.userId;

        if(this.userId){
            if(this.userId === userId){//same user
                return MajorPlansPnc.find( 
                    plan_id, {
                    fields:{
                        scheduleList: 1,
                        chosenCourse: 1,
                        majorId: 1,
                        start_term: 1,
                        end_term: 1,
                        futureList: 1,
                        userId: 1
                    }
                })
            } else {//different user
                if(MajorPlansPnc.findOne(plan_id).shared){
                    return MajorPlansPnc.find( 
                        plan_id, {
                        fields:{
                            scheduleList: 1,
                            chosenCourse: 1,
                            majorId: 1,
                            start_term: 1,
                            end_term: 1,
                            futureList: 1
                        }
                    })
                } else {
                    return MajorPlansPnc.find("null");
                }
            }
        } else {
            if(MajorPlansPnc.findOne(plan_id).shared){
                return MajorPlansPnc.find( 
                    plan_id, {
                    fields:{
                        scheduleList: 1,
                        chosenCourse: 1,
                        majorId: 1,
                        start_term: 1,
                        end_term: 1,
                        futureList: 1
                    }
                })
            } else {
                return MajorPlansPnc.find("null");
            }
        }
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

Meteor.publish("modify_plan_profData", function(){
    return Instructor.find({},{
        fields: {
            id: 1,
            first: 1,
            last: 1,
            email: 1
        }
    }) 
})

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

Meteor.publish("profile_userProfile", function(){
    return UserProfilePnc.find({
        userId: this.userId
    },{
        fields: {
            userName: 1,
            userYear: 1,
            userMajor: 1,
            userMinor: 1,
            officialPlan: 1,
            sharedPlans: 1
        }   
    })
})

Meteor.publish("profile_majorPlans", function() {
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

Meteor.publish("profile_term", function() {
    return Term.find({},{
        fields: {
            id: 1,
            name: 1
        }
    }) 
});