Meteor.methods ({
  keywordInsert: function(keyword) {
    Keyword.insert({
      keyword: keyword,
    });
  },

 	searchCourse: function(keyword, term){
  	var regexDept = new RegExp("^" + keyword, "i");
		var regexTitle = new RegExp(keyword, "i");
		if(term){
			return Course.find({term: term, $or: [{code: regexDept}, {name: regexTitle}]}).fetch();
		} else {
			return Course.find({$or: [{code: regexDept}, {name: regexTitle}]}).fetch();
		}
  },

  	searchTerm: function(key){
  		return Term.findOne({id: key}).name;
  	},

  	searchInstructorArray: function(instrutorData){
      var instructors = "";
      for (var i = 0; i < instrutorData.length; i++) {
            const instru_id = instrutorData[i];//get the current professor id
            const instru_obj = Instructor.findOne({id: instru_id});//get the professor object using the id

            var instru_name = instru_obj.first + " " + instru_obj.last;
            if(instru_obj.first == "Staff" || instru_obj.last == "Staff") instru_name = "Staff";
            instructors = instructors + instru_name + "<br>";
          };

      return instructors;
  	},

  	getMajorDetails: function(courseData){
  		const ids = [];//array of major names
		const major_key = courseData.subjects;//get the array of major id's

		for(var i = 0; i < major_key.length; i++){
			const maj_obj = Subject.findOne({id: major_key[i].id});//get the major object using the id
			//const maj_detail = maj_obj.segments[parseInt(key[i].segment)].name;//get the type of the major using the id
			const maj_name = maj_obj.name;
			ids.push(maj_name); //+ " - " + maj_detail);//add the major name to the array
		};

		return ids.sort();
  	},

  	getSectionDetails: function(courseData){
  		const section_key = courseData.id;//get the id of the course
		return Section.find({course: section_key}).fetch();//an array of corresponding sections
  	},
});
