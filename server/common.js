//the object for all schemas
var Schemas = {};

SimpleSchema.messages({
    "notBrandeisAccount": "Please sign-up with a Brandeis Google account.",
    "noSuchSection": "No such section.",
    "noSuchSchedule": "No such schedule",
    "noSuchPlan": "No such plan",
    "noSuchMajor": "No such major",
    "noSuchUser": "No such user",
    "noSuchCourse": "No such course",
    "noSuchTerm": "No such term",
    "invalidTermRange": "Invalid term range",
})

Schemas.Google = new SimpleSchema({
    accessToken: {
        type: String
    },
    email: {
        type: String,
        max: 50,
        custom: function(){
            if(!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@brandeis.edu$/.test(this.value)){
                return "notBrandeisAccount";
            }
        },
        unique: true
    },
    expiresAt: {
        type: Number
    },
    family_name: {
        type: String,
        max: 50
    },
    given_name: {
        type: String,
        max: 50
    },
    id: {
        type: String
    },
    idToken: {
        type: String
    },
    locale: {
        type: String
    },
    name: {
        type: String,
        max: 100,
    },
    picture: {
        type: String
    },
    scope: {
        type: [String],
    },
    verified_email: {
        type: Boolean,
        optional: true
    }
})

Schemas.Services = new SimpleSchema({
    resume: {
        type: Schemas.Resume,
        blackbox: true,
        optional: true,
    },
    google: {
        type: Schemas.Google,
    },
    password: {
        type: Object,
        blackbox: true,
        optional: true
    }
})

Schemas.Resume = new SimpleSchema({
    loginTokens: {
        type: [Object],
    },
    'loginTokens.0': {
        type: Object,
        optional: true
    },
    'loginTokens.0.when': {
        type: Date
    },
    'loginTokens.0.hashedToken': {
        type: String
    }
})

Schemas.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    country: {
        type: Schemas.UserCountry,
        optional: true
    }
});

Schemas.User = new SimpleSchema({
    username: {
        type: String,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true,
        max: 100
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        max: 50,
    },
    "emails.$.verified": {
        type: Boolean
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schemas.UserProfile,
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Schemas.Services,
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: [String],
        optional: true
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    }
});

Meteor.users.attachSchema(Schemas.User);

Schemas.UserProfilePnc = new SimpleSchema({
    userName: {
        type: String,
        max: 50,
        unique: true,
        regEx: /^[a-zA-Z0-9_-]{2,50}$/
    },
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        unique: true,
        custom: function(){
            if(!Meteor.users.findOne(this.value)){
                return "noSuchUser"
            }
        }
    },
    userYear: {
        type: String,
        regEx: /^(Freshman|Sophomore|Junior|Senior|Graduate|Ph.D|Empty|N\/A)$/,
    },
    wishlist: {
        type: Array
    },
    'wishlist.$': {
        type: String,
        min: 1,
        custom: function(){
            if(!Section.findOne({id: this.value})){
                return "noSuchSection"
            }
        },
        optional: true
    },
    majorPlanList: {
        type: Array
    },
    'majorPlanList.$': {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        min: 1,
        custom: function(){
            if(!MajorPlansPnc.findOne(this.value)){
                return "noSuchPlan"
            }
        },
        optional: true
    },
    liked: {
        type: Array
    },
    'liked.$': {
        type: String,
        min: 1,
        custom: function(){
            if(!Section.findOne({id: this.value})){
                return "noSuchSection"
            }
        },
        optional: true
    },
    watched: {
        type: Array
    },
    'watched.$': {
        type: String,
        min: 1,
        custom: function(){
            if(!Section.findOne({id: this.value})){
                return "noSuchSection"
            }
        },
        optional: true
    },
    scheduleList: {
        type: Array
    },
    'scheduleList.$': {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        min: 1,
        custom: function(){
            if(!SchedulesPnc.findOne(this.value)){
                return "noSuchSchedule"
            }
        },
        optional: true
    },
    courseRate: {
        type: [Object],
        optional: true
    },
    userMajor: {
        type: [String],
        maxCount: 4,
        optional: true
    },
    userMinor: {
        type: [String],
        maxCount: 4,
        optional: true
    },
    officialPlan: {
        type: String,
        optional: true
    },
    sharedPlans: {
        type: [String],
        optional: true
    }
})

UserProfilePnc.attachSchema(Schemas.UserProfilePnc);

Schemas.MajorPlansPnc = new SimpleSchema({
    majorName: {
        type: [String],
        custom: function(){
            //first check if this major exists
            for(let name of this.value){
                if(!Subject.findOne({name: name})){
                    return "noSuchMajor"
                }
            }

            //then make sure the major name matches the major id
            for(let name of this.value){
                const major_obj = Subject.findOne({name: name});
                const major_id = major_obj.id.substring(major_obj.id.indexOf("-") + 1);
                if(_.indexOf(this.field('majorId').value, major_id) == -1) {
                    return "noSuchMajor"
                }
            }
        },
        minCount: 1,
        maxCount: 8
    },
    majorId: {
        type: [String],
        custom: function(){
            for(let id of this.value){
                const major_regex = new RegExp("-" + id + "$", "i");
                if(!Subject.findOne({id: major_regex})){
                    return "noSuchMajor"
                }
            }
            
            for(let id of this.value){
                const major_regex = new RegExp("-" + id + "$", "i");
                const major_obj = Subject.findOne({id: major_regex});
                const major_name = major_obj.name;
                if(_.indexOf(this.field('majorName').value, major_name) == -1){
                    return "noSuchMajor"
                }
            }         
        },
        minCount: 1,
        maxCount: 8
    },
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        custom: function(){
            if(!Meteor.users.findOne(this.value)){
                return "noSuchUser"
            }
        }
    },
    chosenCourse: {//array of continuity_id's
        type: Array
    },
    'chosenCourse.$': {
        type: String,
        min: 1,
        custom: function(){
            if(!Course.findOne({continuity_id: this.value})){
                return "noSuchCourse"
            }
        },
        optional: true
    },
    scheduleList: {
        type: Array
    },
    'scheduleList.$': {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        min: 1,
        custom: function(){
            if(!SchedulesPnc.findOne(this.value)){
                return "noSuchSchedule"
            }
        },
        optional: true
    },
    futureList: {
        type: Array,
        optional: true
    },
    'futureList.$': {
        type: Object
    },
    'futureList.$.term':{
        type: String,
        min: 4,
        custom: function(){
            //first check if this term exists
            if(!Term.findOne({id: this.value})){
                const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
                let latest_allowed_term = latest_term;
                for(let i = 0; i < 6/*server_allowed_terms*/; i++){//global parameter
                    if(("" + latest_allowed_term).charAt(3) == 1){
                        latest_allowed_term += 2;
                    } else {
                        latest_allowed_term += 8;
                    }
                }
                if(this.value > latest_allowed_term){
                    return "noSuchTerm"
                } else if(this.value <= latest_term){//make sure it's a future term
                    return "noSuchTerm"
                }
            }
        }
    },
    'futureList.$.courseList': {
        type: Array
    },
    'futureList.$.courseList.$': {
        type: String,
        min: 1,
        custom: function(){
            if(!Course.findOne({continuity_id: this.value})){
                return "noSuchCourse"
            }
        },
        optional: true
    },
    start_term: {
        type: String,
        min: 1,
        custom: function(){
            //first check if this term exists
            if(!Term.findOne({id: this.value})){
                const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
                let latest_allowed_term = latest_term;
                for(let i = 0; i < 6/*server_allowed_terms*/; i++){//global parameter
                    if(("" + latest_allowed_term).charAt(3) == 1){
                        latest_allowed_term += 2;
                    } else {
                        latest_allowed_term += 8;
                    }
                }
                if(this.value > latest_allowed_term){
                    return "noSuchTerm"
                }
            }

            //then check if it's smaller than the other
            if(this.value >= this.field('end_term').value){
                return "invalidTermRange"
            }
        }
    },
    end_term: {
        type: String,
        min: 1,
        custom: function(){
            //first check if this term exists
            if(!Term.findOne({id: this.value})){
                const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
                let latest_allowed_term = latest_term;
                for(let i = 0; i < 6/*server_allowed_terms*/; i++){//global parameter
                    if(("" + latest_allowed_term).charAt(3) == 1){
                        latest_allowed_term += 2;
                    } else {
                        latest_allowed_term += 8;
                    }
                }
                if(this.value > latest_allowed_term){
                    return "noSuchTerm"
                }
            }

            //then check if it's smaller than the other
            if(this.value <= this.field('start_term').value){
                return "invalidTermRange"
            }
        }
    },
    official: {
        type: Boolean,
        optional: true
    },
    shared: {
        type: Boolean,
        optional: true
    }
})

MajorPlansPnc.attachSchema(Schemas.MajorPlansPnc);

Schemas.SchedulesPnc = new SimpleSchema({
    term: {
        type: String,
        min: 1,
        custom: function(){
            //first check if this term exists
            if(!Term.findOne({id: this.value})){
                return "noSuchTerm"
            }
        }
    },
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        custom: function(){
            if(!Meteor.users.findOne(this.value)){
                return "noSuchUser"
            }
        }
    },
    plan: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        custom: function(){
            //can't check for existence
            //https://github.com/aldeed/meteor-collection2/issues/38
        },
        optional: true
    },
    courseList: {
        type: Array
    },
    'courseList.$': {
        type: Object,
        optional: true
    },
    'courseList.$.section_id': {
        type: String,
        optional: true,
        custom: function(){
            if(!Section.findOne({id: this.value})){
                return "noSuchSection"
            }
        }
    },
    'courseList.$.chosen': {
        type: Boolean,
        optional: true
    }
})

SchedulesPnc.attachSchema(Schemas.SchedulesPnc);

Schemas.GlobalParameters = new SimpleSchema({
    allowed_terms: {
        type: Number,
        min: 3,
        max: 10,
        optional: true
    },
    current_term: {
        type: String,
        custom: function(){
            if(!Term.findOne({id: this.value})){
                return "noSuchTerm"
            }
        },
        optional: true
    }
})

GlobalParameters.attachSchema(Schemas.GlobalParameters);