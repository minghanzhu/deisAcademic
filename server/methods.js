//Create an array of professor names and id's
const prof_name_and_id = [];
const profData = Instructor.find().fetch();
for(let person of profData){
  const first_name = person.first;
  const last_name = person.last;
  if(first_name !== "Staff" && last_name !== "Staff"){
    const full_name = first_name + " " + last_name;
    const id = person.id;
    prof_name_and_id.push({title: full_name, id: id});
  }
}

Meteor.methods ({
  keywordInsert: function(keyword) {
    Keyword.insert({
      keyword: keyword,
    });
  },

 	searchCourse: function(keyword, term, req_array, dept, prof){
    var regexCode = new RegExp("^" + keyword, "i");
		var regexTitle = new RegExp(keyword, "i");
    var regexTerm = new RegExp("^" + term, "i");
    const searchQuery = {term: regexTerm, $or: [{code: regexCode}, {name: regexTitle}]};
    
    //process the array of requirements
    if(req_array.length != 0){
      searchQuery.$and = [];
      for(let node of req_array){
        searchQuery.$and.push({requirements: node});
      }
    };

    //term-dept 
    if(term && dept && dept !== "all"){//make term-dept
      const dept_query = term + "-" + dept;
      searchQuery['subjects.id'] = dept_query;
    } else if (!term && dept && dept !== "all"){
      let regexDept = new RegExp(dept + "$", "i");
      searchQuery['subjects.id'] = regexDept;
    }

    //instructor
    let prof_id;
    let section_of_prof;
    for(let item of prof_name_and_id){
      if(item.title === prof){
        prof_id = item.id;
        section_of_prof = Section.find({instructors: prof_id}).fetch();
        break;
      }
    }

    if(prof_id && section_of_prof){
      const section_id_list = [];

      for(let item of section_of_prof){
        section_id_list.push(item.course);
      }

      const new_or = {'$or':searchQuery.$or};
      const prof_or = {'$or':[]};

      for(let item of section_id_list){
        prof_or.$or.push({id:item})
      }
      delete searchQuery['$or'];
      searchQuery.$and = [new_or,prof_or];
    }

    return Course.find(searchQuery).fetch();
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
			const maj_detail = maj_obj.segments[parseInt(major_key[i].segment)].name;//get the type of the major using the id
			const maj_name = maj_obj.name;
			ids.push(maj_name + " - " + maj_detail);//add the major name to the array
		};

		return ids.sort();
  	},

  	getSectionDetails: function(courseData){
  		const section_key = courseData.id;//get the id of the course
		return Section.find({course: section_key}).fetch();//an array of corresponding sections
  	},

    getProfData: function(){
      return prof_name_and_id;
    },
});
