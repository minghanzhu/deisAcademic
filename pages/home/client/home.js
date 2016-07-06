Template.home.onCreated(function(){
	this.homeDict = new ReactiveDict();
	this.homeDict.set('showTable', false);
})

Template.home.helpers ({
	courseSearch: function(){
		const keyword = Template.instance().homeDict.get('keyword');
		const dataCursor = CourseIndex.search(keyword,{limit:0});
		return dataCursor.fetch();
	},

	showTable: function(){
		return Template.instance().homeDict.get('showTable');
	},

	settings_course: function(){
		return {
			rowsPerPage: 5,
			fields:[
				{key:'name', label: 'Course'},
				{key:'code', label:'Code'},
				{key:'requirements', label:'Requirements'},
				{key:'description', label:'Description', fn: function(key){
					if (key.length>50){
						return key.substring(0,50)+"...";
					} else {
						return key;
					}
				}},/*
				{key:'subjects', label: 'Major', fn: function(key){
					const ids = [];

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
				}},*/
				{key:'term', label:'Term', fn: function(key){
					return Term.find({id: key}).fetch()[0].name;
				}},/*
				{key:'id', label:'Sections', fn: function(key){
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
				}},
				{key:'id', label:'Insructors', fn: function(key){
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
				}},*/
			],
		};
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
    template.homeDict.set('showTable', true);
    template.homeDict.set('keyword', keyword);
    
  }
});
