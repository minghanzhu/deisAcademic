//the object for all schemas
var Schemas = {};

SimpleSchema.messages({
    "notBrandeisAccount": "Please sign-up with a Brandeis Google account."
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
        max: 100
    },
    userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    userYear: {
        type: String,
        regEx: /^(Freshman|Sophomore|Junior|Senior|Graduate|Ph.D)$/,
    },
    wishlist: {
        type: [String]
    },
    majorPlanList: {
        type: [String]
    },
    liked: {
        type: [Object]
    },
    watched: {
        type: [Object]
    },
    scheduleList: {
        type: [String]
    },
    courseRate: {
        type: [Object]
    }
})

UserProfilePnc.attachSchema(Schemas.UserProfilePnc);