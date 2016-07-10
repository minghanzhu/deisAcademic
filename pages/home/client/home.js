//Global reactive-dict
homeDict = new ReactiveDict();
homeDict.set('showTable', false);
homeDict.set('majorDetail', []);
homeDict.set('sectionDetail', []);
homeDict.set('courseData');

Template.home.helpers ({
	showTable: function(){
		return homeDict.get('showTable');
	},
})

Template.home.events ({
  "submit form": function(event, template) {
    event.preventDefault();
    homeDict.set('courseData');
    var keyword = event.target.keyword.value;
    if(keyword==""){
    	window.alert("Enter a keyword!");
    	return;
    }
    //Meteor.call("keywordInsert", keyword);
    event.target.keyword.value = "";
    homeDict.set('showTable', true);
    homeDict.set('keyword', keyword);
  },
})

Template.search_result.onRendered(function(){
	/*
	//shows different lines for times
	var times = $(".ui.table.reactive.table tbody tr .times");
	const times_code = times.html;
	times.html(times_code.replace(/\r?\n/g, '<br>'));

	//shows different lines for instructors
	var instructors = $(".ui.table.reactive.table tbody tr .instructors");
	const instructors_code = instructors.html;
	instructors.html(instructors_code.replace(/\r?\n/g, '<br>'));*/
})

Template.search_result.helpers({
	detailReady: function(){
		return homeDict.get('courseInfo') != null;
	},

	courseDataReady: function(){
		return homeDict.get('courseData') != null;
	},

	courseData: function(){
		return homeDict.get('courseData');
	},

	courseInfo: function(){
		return homeDict.get('courseInfo');
	},

	majorInfo: function(){
		return homeDict.get('majorDetail');
	},

	sectionData: function(){
		return homeDict.get('sectionDetail');
	},

	getMajorDetail: function(){
		if(!homeDict.get('courseInfo')){//continue only if the data is ready
			return;
		};

		//console.log("loading major detail");
		const ids = [];//array of major names
		const key = homeDict.get('courseInfo').subjects;//get the array of major id's

		for(var i = 0; i < key.length; i++){
			const maj_obj = Subject.findOne({id: key[i].id});//get the major object using the id
			if(!maj_obj){
				return;
			}
			//const maj_detail = maj_obj.segments[parseInt(key[i].segment)].name;//get the type of the major using the id
			const maj_name = maj_obj.name;
			ids.push(maj_name); //+ " - " + maj_detail);//add the major name to the array
		};
		
		homeDict.set('majorDetail', ids.sort());
		//console.log("finished loading major detail");
	},

	getSectionDetail: function(){
		if(!homeDict.get('courseInfo')){//continue only if the data is ready
			return;
		};

		//console.log("loading section detail");
		const key = homeDict.get('courseInfo').id;//get the id of the course

		const sec_obj = Section.find({course: key}).fetch();//an array of corresponding sections
		if(!sec_obj){
			return;
		};

		homeDict.set('sectionDetail', sec_obj);
		//console.log("finished loading section detail");
	},

	courseSearch: function(){
		const keyword = homeDict.get('keyword');
		const dataCursor = CourseIndex.search(keyword,{limit:0});
		homeDict.set('courseData', dataCursor.fetch());
	},

	settings_course: function(){
		return {
			rowsPerPage: 10,
			showFilter: false,
			showNavigationRowsPerPage: false,
			fields:[
				{key:'name', label: 'Course'},
				{key:'code', label:'Code'},
				{key:'requirements', label:'Requirements'},
				{key:'description', label:'Description', tmpl:Template.description_detail},
				{key:'term', label:'Term', fn: function(key){
					if(!Term.findOne({id: key})){
						return "loading...";
					};
					return Term.findOne({id: key}).name;
				}},
			],
		};
	},

	settings_result: function(){
		return {
			rowsPerPage: 5,
			showFilter: false,
			showNavigationRowsPerPage: false,
			fields:[
				{key:'section', label: 'Section', fn: function(key){
					var section = key;
					if(section < 10){
						section = "0" + section;
					};

					return "Section " + section;
				}},
				{key:'enrolled', label:'Enrolled', fn: function(key, object){
					var limit = object.limit;
					if(!limit){
						limit = 999;
					};

					return key + "/" + limit;
				}},
				{key:'status_text', label:'Status'},
				{key:'times', label:'Times', fn:function(key){
					var result = "";
					for(var item of key){
						//get days
						days = "";
						for(var day of item.days){
							days = days + day + " ";
						}
						
						//get times
						const start = item.start;
						const end = item.end;
						var start_min = Math.floor(start % 60);
						if(start_min < 10){
							start_min = "0" + start_min;
						}

						var end_min = Math.floor(end % 60);
						if(end_min < 10){
							end_min = "0" + end_min;
						}

						var start = Math.floor(start / 60) + ":" + start_min;
						var end = Math.floor(end / 60) + ":" + end_min;
						const time = start + "-" + end;

						result = result + days + ": " + time + "\n";  
					};

					return result;
				}},
				{key:'instructors', label:'Instructor', fn: function(key){
					var instructors = "";
					for (var i = 0; i < key.length; i++) {
						const instru_id = key[i];//get the current professor id
						const instru_obj = Instructor.findOne({id: instru_id});//get the professor object using the id
						if(!instru_obj){
							return;
						};
						var instru_name = instru_obj.first + " " + instru_obj.last;
						if(instru_obj.first == "Staff" || instru_obj.last == "Staff") instru_name = "Staff";
						instructors = instructors + instru_name + "\n";
					};

					return instructors;
				}},
			],
		};
	}
})

Template.search_result.events({
	"click .reactive-table tbody tr": function(event){
		homeDict.set('courseInfo');
		homeDict.set('sectionDetail', []);
		homeDict.set('majorDetail', []);
		homeDict.set('courseInfo', this);
		$(".overlay, .popup").fadeToggle();
	},	

	"click .overlay" :function(event){
		$(".overlay, .popup").fadeToggle();
	},
})

Template.description_detail.onRendered(function(){
	$('.ui.accordion').accordion();
})

Template.description_detail.helpers({
	showDescription: function(text){
		if (text.length > 50){
			return text.substring(0, 50) + "...";
		} else {
			return text;
		};
	},
})