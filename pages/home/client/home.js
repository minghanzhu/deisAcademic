//Global reactive-dict
homeDict = new ReactiveDict();
homeDict.set('showTable', false);

Template.home.helpers ({
	showTable: function(){
		return homeDict.get('showTable');
	},

	
	/*
	courseData: function(){
		//return Course.find({},{skip:0,limit:5}).fetch();
		return Course.find({}).fetch();
	},

	sectionData: function(){
		return Section.find({},{skip:0,limit:5}).fetch();
	},*/
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
	courseInfo: function(){
		return homeDict.get('courseInfo');
	},

	getMajor: function(){
		const ids = [];
		const key = homeDict.get('courseInfo').subjects;

		for(var i = 0; i < key.length; i++){
			const maj_obj = Subject.find({id: key[i].id}).fetch();
			const maj_detail = maj_obj[0].segments[parseInt(key[i].segment)].name;
					
			if (maj_obj.length==0){
				ids.push("unknown major");
			} else {
				const maj_name = maj_obj[0].name;
				ids.push(maj_name + " - " + maj_detail);
			};
		};

		if(ids.length == 0){
			return "unknown";
		} else {
			return ids.toString();
		};
	},

	getSection: function(){
		const key = homeDict.get('courseInfo').id;

		const sec_obj = Section.find({course: key}).fetch();//this is an array
		const sections = [];
		for (var i = 0; i < sec_obj.length; i++) {
			sections.push("Section: " + sec_obj[i].section);
		};

		if(sections.length==0){
			return "No section";
		} else {
			return sections.toString();
		}
	},

	getProfessor: function(){
		const key = homeDict.get('courseInfo').id;

		const sec_obj = Section.find({course: key}).fetch();//this is an array
		const instructors = [];
		for (var i = 0; i < sec_obj.length; i++) {
			const instru_array = sec_obj[i].instructors;
			for (var i = 0; i < instru_array.length; i++) {
				const instru_id = instru_array[i];
				const instru_obj = Instructor.find({id: instru_id}).fetch()[0];
				var instru_name = instru_obj.first + " " + instru_obj.last;
				if(instru_obj.first=="Staff" || instru_obj.last=="Staff") instru_name = "Staff";
				instructors.push("Section: " + sec_obj[i].section + " - " + instru_name);
			};
		};

		if(instructors.length==0){
			return "No insructor"
		} else {
			return instructors.toString();
		};
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
					return Term.find({id: key}).fetch()[0].name;
				}},
			],
		};
	},
})

Template.search_result.events({
	"click .reactive-table tbody tr": function(event){
		homeDict.set('courseInfo', this);
		$(".overlay, .popup").fadeToggle();
	},	

	"click .overlay" :function(event){
		$(".overlay, .popup").fadeToggle();
		homeDict.set('courseInfo', {});
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