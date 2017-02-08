Template.userProfile.onCreated(function(){
	if(!UserProfilePnc.findOne()){
		window.alert("Please log in to see your profile");
		Router.go('/');
	}

	this.profileDict = new ReactiveDict();
})

Template.userProfile.onRendered(function(){
	const userMajor = UserProfilePnc.findOne().userMajor;
	const userMinor = UserProfilePnc.findOne().userMinor;
	const userYear = UserProfilePnc.findOne().userYear;

	$('#userProfileForm').form({
	    on: 'blur',
	    fields: {
	      	userName:{
	      		identifier: 'userName',
	      		rules:[
	      			{
	      				type: 'regExp[/^[a-zA-Z0-9_-]{3,16}$/]',
	      				prompt: 'Please enter a 3-25 characters long username'
	      			}
	      		]
	      	}
	    }
	});

	$("#userMajor").dropdown({
        match: "text",
        fullTextSearch: true,
        maxSelections: 4
    });

    $("#userMinor").dropdown({
        match: "text",
        fullTextSearch: true,
        maxSelections: 4
    });

    $("#userYear").dropdown({
        match: "text",
        fullTextSearch: true
    });
	
	if(userMajor.length != 0){
		$("#userMajor").dropdown("set selected", userMajor);
	} 

	if(userMinor.length != 0){
		$("#userMinor").dropdown("set selected", userMinor);
	} 

	if(userYear == "N/A"){
		$("#userYear").dropdown("set selected", "0");
	} else if(userYear == "Freshman"){
		$("#userYear").dropdown("set selected", "1");
	} else if(userYear == "Sophomore"){
		$("#userYear").dropdown("set selected", "2");
	} else if(userYear == "Junior"){
		$("#userYear").dropdown("set selected", "3");
	} else if(userYear == "Senior"){
		$("#userYear").dropdown("set selected", "4");
	} else if(userYear == "Graduate"){
		$("#userYear").dropdown("set selected", "5");
	} else if(userYear == "Ph.D"){
		$("#userYear").dropdown("set selected", "6");
	}
})

Template.userProfile.helpers({
	hasMajorPlan: function() {
        return MajorPlansPnc.find().count() != 0;
    },

    getUserPlans: function() {
        return MajorPlansPnc.find().fetch();
    },

    getUserName: function(){
    	const userProfile = UserProfilePnc.findOne();
    	const userName = userProfile.userName;
    	return userName;
    },
})

Template.userProfile.events({
	"submit #userProfileForm": function(event){
		event.preventDefault();
		$(".js-save-change").attr("class", "ui loading disabled primary submit button js-save-change");

		const officialPlan = $("#officialPlan input").val();
		const sharedPlans = $("#sharedPlans input").val().split(',');
		const userName = $("#userName input").val();
		const userYear = $("#userYear input").val();
		const userMajor = $("#userMajor input").val().split(',');
		const userMinor = $("#userMinor input").val().split(',');

		//make sure there's really a change
		if(Template.instance().profileDict.get("last_time_data")){
			const last_obj = Template.instance().profileDict.get("last_time_data");
			if(
				last_obj.officialPlan === officialPlan &&
				_.difference(last_obj.sharedPlans, sharedPlans) &&
				last_obj.userName === userName &&
				last_obj.userYear === userYear &&
				_.difference(last_obj.userMajor, userMajor).length == 0 &&
				_.difference(last_obj.userMinor, userMinor).length == 0
			){
				$(".js-save-change").attr("class", "ui primary submit button js-save-change");
				return;
			}
		}

		const submit_obj = {
			officialPlan: officialPlan,
			sharedPlans: sharedPlans,
			userName: userName,
			userYear: userYear,
			userMajor: userMajor,
			userMinor: userMinor
		}
		Template.instance().profileDict.set("last_time_data", submit_obj);

		Meteor.call("saveProfileChange", submit_obj, function(err, result){
			if(err){
				window.alert(err.message);
				$(".js-save-change").attr("class", "ui primary submit button js-save-change");
				return;
			}

			$(".js-save-change").attr("class", "ui primary submit button js-save-change");
			$('#submitMsg').transition('scale');
			setTimeout(function(){
				$('#submitMsg').transition('scale');
			}, 3000)
		})
	},

	"click #officialPlanHelp": function(){
		$('#officialPlanModal').modal('show');
	},

	"click #sharedPlanHelp": function(){
		$('#sharedPlanModal').modal('show');
	},
})

Template.userPlanList.onRendered(function(){
	const sharedPlans = UserProfilePnc.findOne().sharedPlans;
	const officialPlan = UserProfilePnc.findOne().officialPlan;
	$("#sharedPlans").dropdown({
        match: "text",
        fullTextSearch: true
    });

	$("#officialPlan").dropdown({
        match: "text",
        fullTextSearch: true
    });

	if(sharedPlans.length != 0){
		$("#sharedPlans").dropdown("set selected", sharedPlans);
	} 

	if(!!officialPlan){
		$("#officialPlan").dropdown("set selected", officialPlan);
	} 
})

Template.userPlanList.helpers({
	getTermName: function(term_id){
    	const allowed_new_terms = GlobalParameters.findOne().allowed_terms;//global parameter

        const term_list = Term.find().fetch().sort(function(a, b){
            return parseInt(a.id) - parseInt(b.id);
        });

        for(let i = 0; i < allowed_new_terms; i++){
            let lasted_term = parseInt(term_list[term_list.length - 1].id);
            //make sure it is not a summer term
            if(("" + lasted_term).charAt(3) == 2){
            	lasted_term = parseInt(term_list[term_list.length - 2].id);
            }

            let new_term;
            if(("" + lasted_term).charAt(3) == 1){
                new_term = lasted_term + 2;//from spring to fall
            } else if(("" + lasted_term).charAt(3) == 3){
                new_term = lasted_term + 8;//from fall to spring
            }
            const year = 2000 + parseInt(("" + new_term).substring(0,3)) - 100;
            let season;
            if(("" + new_term).charAt(3) == 1){
                season = "Spring";
            } else if(("" + new_term).charAt(3) == 3) {
                season = "Fall";
            }
            const name = season + " " + year;

            const term_obj = {
                id: "" + new_term,
                name: name
            }
            term_list.push(term_obj);
        }

        const result = term_list.sort(function(a, b){
            return parseInt(b.id) - parseInt(a.id);
        });

        for(let term of result){
            if(term.id === term_id){
                return term.name;
            }
        }
    },

    getMajorName: function(name_array){
        let result = ""

        for(let i = 0; i < name_array.length; i++){
            if(i != name_array.length - 1){
                result += name_array[i] + " & ";
            } else {
                result += name_array[i];
            }
        }

        return result;
    }
})