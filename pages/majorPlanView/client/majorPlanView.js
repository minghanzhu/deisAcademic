Template.majorPlanView.helpers({
    hasMajorPlan: function() {
        return MajorPlansPnc.find().count() != 0;
    },

    getUserPlans: function() {
        return MajorPlansPnc.find().fetch();
    },    
})

Template.majorPlanView.events({
	"click .js-go-plan": function(event){
		event.preventDefault();
		if(!$("#search-select-plans input").val()){
			window.alert("Plaese choose a plan first");
			return;
		}
		const plan_id = $("#search-select-plans input").val();
		Router.go('/majorPlan/' + plan_id);
	},

  "click .js-create-plan": function(event){
    event.preventDefault();

    Router.go('/majorPlan/new');
  },
})

Template.planList.onRendered(function(){
	$("#search-select-plans").dropdown({
        match: "text"
    });
})

Template.planList.helpers({
	getTermName: function(term_id){
    	const allowed_new_terms = GlobalParameters.findOne().allowed_terms;//global parameter

        const term_list = Term.find().fetch().sort(function(a, b){
            return parseInt(a.id) - parseInt(b.id);
        });

        //never end with summer term
        let summer_term_obj;
        if(!!term_list[term_list.length - 1].name.match("Summer")){
            summer_term_obj = term_list[term_list.length - 1];
            term_list.splice(term_list.length - 1, 1);
        }

        for(let i = 0; i < allowed_new_terms; i++){
            const lasted_term = parseInt(term_list[term_list.length - 1].id);
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

        if(summer_term_obj){
            term_list.push(summer_term_obj);
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
