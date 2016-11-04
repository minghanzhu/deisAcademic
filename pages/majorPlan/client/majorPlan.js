Template.majorPlan.helpers({
    majors: function(dict) {
      return Major.find({id:dict.get("chosenMajor")});
    },
});

Template.majorPlan.events({
	"click #major_info ul li a": function(){
		setInterval(function(){
			const sticky_height = $("#planSearch_result").height();
		    const target_height = $("#major_info").height();
		    if(sticky_height < target_height){
		    	$('#planSearch_result').sticky({
			    	context: '#major_info',
			    	observeChanges: true
				});
		    } else {
		    	$('#planSearch_result').sticky({
			    	context: false,
			    	observeChanges: true
				});
		    }
		}, 350);
	}
})