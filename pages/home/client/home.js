//Global reactive-dict
homeDict = new ReactiveDict();
homeDict.set('showTable', false);
homeDict.set('majorDetail', []);
homeDict.set('sectionDetail', []);

Template.home.helpers ({
	showTable: function(){
		return homeDict.get('showTable');
	},
})

Template.home.events ({
  "submit form": function(event, template) {
    event.preventDefault();
    var keyword = event.target.keyword.value;
    if(keyword==""){
    	window.alert("Enter a keyword!");
    	return;
    }
    //Meteor.call("keywordInsert", keyword);
    event.target.keyword.value = "";
    homeDict.set('showTable', true);
    homeDict.set('keyword', keyword);
    
  }
})

Template.search_result.helpers({
	detailReady: function(){
		return homeDict.get('courseInfo') != null;
	},

	courseInfo: function(){
		return homeDict.get('courseInfo');
	},

	majorInfo: function(){
		return homeDict.get('majorDetail');
	},

	sectionInfo: function(){
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
		
		homeDict.set('majorDetail', ids);
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
		const instructors = [];//array for professor names
		for (var i = 0; i < sec_obj.length; i++) {
			const instru_array = sec_obj[i].instructors;//get the list of the professor id's for the current section
			for (var j = 0; j < instru_array.length; j++) {
				const instru_id = instru_array[j];//get the current professor id
				const instru_obj = Instructor.findOne({id: instru_id});//get the professor object using the id
				if(!instru_obj){
					return;
				};
				var instru_name = instru_obj.first + " " + instru_obj.last;
				if(instru_obj.first=="Staff" || instru_obj.last=="Staff") instru_name = "Staff";
				instructors.push("Section: " + sec_obj[i].section + " - " + instru_name);
			};
		};

		homeDict.set('sectionDetail', instructors);
		//console.log("finished loading section detail");
	},

	courseSearch: function(){
		const keyword = homeDict.get('keyword');
		const dataCursor = CourseIndex.search(keyword,{limit:0});
		return dataCursor.fetch();
	},

	settings_course: function(){
		return {
			rowsPerPage: 10,
			showFilter: false,
			showRowsPerPage: false,
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
})

Template.search_result.events({
	"click .reactive-table tbody tr": function(event){
		homeDict.set('courseInfo', {});
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