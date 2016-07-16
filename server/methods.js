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

 	searchCourse: function(keyword, term, req_array, dept, prof, time, if_indept){
    var regexCode = new RegExp("^" + keyword, "i");
		var regexTitle = new RegExp(keyword, "i");
    var regexTerm = new RegExp("^" + term, "i");
    let hasProfessor = false;
    let searchQuery;
    if(if_indept){
      searchQuery = {term: regexTerm, $or: [{code: regexCode}, {name: regexTitle}]};
    } else {
      searchQuery = {term: regexTerm, $or: [{code: regexCode}, {name: regexTitle}], independent_study: false};
    }

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
    let prof_id;//the id for this professor
    if(prof){
      let section_of_prof;//array of all sections taught by the professor
      for(let item of prof_name_and_id){
        if(item.title === prof){
          prof_id = item.id;
          section_of_prof = Section.find({instructors: prof_id}).fetch();
          hasProfessor = true;
          break;
        }
      } 

      //if no professor matches, return no result
      if(!section_of_prof){
        return [];
      } else if (section_of_prof.length == 0){
        return [];
      };

      if(prof_id && section_of_prof){
        let req_and = [];
        if(req_array.length != 0){
          req_and = searchQuery.$and;
        }

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
        searchQuery.$and = [new_or, prof_or];

        if(req_and.length != 0){
          for(let item of req_and){
            searchQuery.$and.push(item);
          }
        }
      } 
    }
    
    //time and date
    let days_array = time.days;
    let search_start = time.start;
    let search_end = time.end;
    if(days_array.length != 0 || (search_start && search_start !== "all") || (search_end && search_end !== "all")){
      const searchQuery_time = {$and:[]};
      if(search_start){
        const start_hr = parseInt(search_start.substring(0, search_start.indexOf(":")));
        const start_min = parseInt(search_start.substring(search_start.indexOf(":") + 1));
        search_start = start_hr * 60 + start_min;
      } 

      if(search_end){
        const end_hr = parseInt(search_end.substring(0, search_end.indexOf(":")));
        const end_min = parseInt(search_end.substring(search_end.indexOf(":") + 1));
        search_end = end_hr * 60 + end_min;
      }

      if(search_start >= "0" && search_start <= "1440"){
        searchQuery_time.$and.push({'times.start': {$gte: search_start, $lte: 1440}});
      }

      if(search_end >= "0" && search_end <= "1440"){
        searchQuery_time.$and.push({'times.end': {$gte: 0, $lte: search_end}});
      }

      if(days_array.length != 0){
        for(let day of days_array){
          searchQuery_time.$and.push({'times.days': day});
        }
      }

      const section_at_time = Section.find(searchQuery_time).fetch();
      if(section_at_time.length != 0){
        const section_id_list_time = [];
        for(let item of section_at_time){
         section_id_list_time.push(item.course);
        }

        if(searchQuery.$and){
          if(!hasProfessor){
            let time_id_or = {$or:[]};
            for(let key of section_id_list_time){
              time_id_or.$or.push({id:key})
            }
            searchQuery.$and.push(time_id_or);
          } else {
            //loop through the existring id list
            for(let i = 0; i < searchQuery.$and.length; i++){
              if (searchQuery.$and[i].$or[0].id){//make sure that the current node is an id search
                for(let j = 0; j < searchQuery.$and[i].$or.length; j++){
                  //get the section using the current id
                  let current_section;
                  if(days_array.length != 0){
                    let section_time_query = {
                      course: searchQuery.$and[i].$or[j].id,
                      instructors: prof_id,
                      'times.start': {$gte: search_start, $lte: 1440},
                      'times.end': {$gte: 0, $lte: search_end}
                    };
                    section_time_query.$and = [];
                    for(let day of days_array){
                      section_time_query.$and.push({'times.days': day});
                    }
                    current_section = Section.findOne(section_time_query);
                  } else {
                    current_section = Section.findOne({
                      course: searchQuery.$and[i].$or[j].id,
                      instructors: prof_id,
                      'times.start': {$gte: search_start, $lte: 1440},
                      'times.end': {$gte: 0, $lte: search_end}
                    });
                  };
                  
                  if(!current_section) {
                    searchQuery.$and[i].$or.splice(j, 1);
                    j--;
                  }
                }
              }
              
              if(searchQuery.$and[i].$or.length == 0){
                return [];
              }
            }      
          }
        } else {
          const course_or = {$or:searchQuery.$or};
          let time_id_or = {$or:[]};
          for(let key of section_id_list_time){
            time_id_or.$or.push({id:key})
          }
          delete searchQuery.$or;
          searchQuery.$and = [course_or, time_id_or];
        }
      } else {
        return [];
      }  
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
			let maj_detail = "No special notes"; 
      if(maj_obj.segments[parseInt(major_key[i].segment)]){
        maj_detail = maj_obj.segments[parseInt(major_key[i].segment)].name;//get the type of the major using the id
      }
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
