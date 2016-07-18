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

//this load all the course codes
const codes = [];

for(let key of Course.find().fetch()){
  let code = key.code.substring(0, key.code.indexOf(" "));
  let inArray = false;
  let if_continue = true;
  for(let i = 0; i < codes.length && if_continue; i++){
    if(codes[i] === code){
      inArray = true;
      if_continue = false;
    }
  }
  if(!inArray){
    codes.push(code);
  }
}

Meteor.methods ({
  keywordInsert: function(keyword) {
    Keyword.insert({
      keyword: keyword,
    });
  },

 	searchCourse: function(keyword, term, req_array, dept, prof, time, if_indept, if_not_sure){
    keyword = keyword.replace(/ +/gi, " ");
    keyword = keyword.trim();
    const codes_record = [];//this records the user tokens
    const keys_record = [];//this records all the matches
    for(let item of codes){
      //in the form of CODE + NUM + LETTER; for exmaple
      //cosi11a, coSi 11a, COsi 400, COsI400
      if(item.includes("/")){//some code is in the form of COSI/MATH
        let indexOfSlash = item.indexOf("/");
        let first_half = item.substring(0, indexOfSlash);
        let second_half = item.substring(indexOfSlash + 1);
        let regex_1 = new RegExp("( |^)" + first_half + " ?(\\d{1,3}[A-Z]{0,1})?( |$)", "i");
        let regex_2 = new RegExp("( |^)" + second_half + " ?(\\d{1,3}[A-Z]{0,1})?( |$)", "i");

        if(keyword.match(regex_1)){
          let code_token = keyword.match(regex_1)[0];
          let code_key = item + " " + code_token.trim().substring(first_half.length).trim().toUpperCase();
          codes_record.push(code_token);
          keys_record.push(code_key.trim());
        } else if (keyword.match(regex_2)){
          let code_token = keyword.match(regex_2)[0];
          let code_key = item + " " + code_token.trim().substring(second_half.length).trim().toUpperCase();
          codes_record.push(code_token);
          keys_record.push(code_key.trim());
        }
      } else {
        let regex = new RegExp("( |^)" + item + " ?(\\d{1,3}[A-Z]{0,1})?( |$)", "i");

        if(keyword.match(regex)){
          let code_token = keyword.match(regex)[0];
          let code_key = item + " " + code_token.trim().substring(item.length).trim().toUpperCase();
          codes_record.push(code_token);
          keys_record.push(code_key.trim());
        }
      }
    }

    //this extracts the code token out of the keyword string
    for(let key of codes_record){
      if(keyword.match(key)){
        keyword = keyword.replace(key, " ");
        keyword = keyword.replace(/ {2, }/i, " ");
      }
    }

    var regexCode;
    if(keys_record.length != 0){
      let new_keyword = "(" + keys_record[0];
      for(let i = 1; i < keys_record.length; i++){
        new_keyword = new_keyword + "|" + keys_record[i];
      }
      new_keyword = new_keyword + ")";
      if(!if_not_sure){
        if(!/\d/i.test(new_keyword)){
          regexCode = new RegExp("^" + new_keyword + " \\d{1,3}([A-Z]{0,1})?$", "i");
        } else{
          regexCode = new RegExp("^" + new_keyword + " ?([A-Z]{0,1})?$", "i");
        }
      } else {
        regexCode = new RegExp("^" + new_keyword + " ?((\\d{1,3})?[A-Z]{0,1})?$", "i");
      };
    } else {
      regexCode = new RegExp("^", "i");
    }

    var regexTitle;
    if(/^ +$/.test(keyword)){//this makes sure there's something left in the keyword string
      regexTitle = new RegExp("^", "i");
    } else {
      regexTitle = new RegExp(keyword.trim(),"i");
    };

    var regexTerm = new RegExp("^" + term, "i");
    let hasProfessor = false;
    let searchQuery;
    if(if_indept){
      searchQuery = {term: regexTerm, code: regexCode, name: regexTitle};
    } else {
      searchQuery = {term: regexTerm, code: regexCode, name: regexTitle, independent_study: false};
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

        const prof_or = {'$or':[]};

        for(let item of section_id_list){
          prof_or.$or.push({id:item})
        }
        searchQuery.$and = [prof_or];

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
      if(search_start && search_start !== "all"){
        const start_hr = parseInt(search_start.substring(0, search_start.indexOf(":")));
        const start_min = parseInt(search_start.substring(search_start.indexOf(":") + 1));
        search_start = start_hr * 60 + start_min;
      } else {
        search_start = 0;
      }

      if(search_end && search_end !== "all"){
        const end_hr = parseInt(search_end.substring(0, search_end.indexOf(":")));
        const end_min = parseInt(search_end.substring(search_end.indexOf(":") + 1));
        search_end = end_hr * 60 + end_min;
      } else {
        search_end = 1440;
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
              if (searchQuery.$and[i].$or){
                if (searchQuery.$and[i].$or.length != 0){
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
            }
          }
        } else {
          let time_id_or = {$or:[]};
          for(let key of section_id_list_time){
            time_id_or.$or.push({id:key})
          }
          searchQuery.$and = [time_id_or];
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
      if(instrutorData.length == 1){
        const instru_id = instrutorData[0];//get the current professor id
        const instru_obj = Instructor.findOne({id: instru_id});//get the professor object using the id

        var instru_name = instru_obj.first + " " + instru_obj.last;
        if(instru_obj.first == "Staff" || instru_obj.last == "Staff") instru_name = "Staff";
        instructors = instructors + instru_name;
      } else {
        const instru_id_1st = instrutorData[0];//get the current professor id
        const instru_obj_1st = Instructor.findOne({id: instru_id_1st});//get the professor object using the id

        var instru_name_1st = instru_obj_1st.first + " " + instru_obj_1st.last;
        if(instru_obj_1st.first == "Staff" || instru_obj_1st.last == "Staff") return "Staff";
        instructors = instructors + instru_name_1st;

        for (var i = 1; i < instrutorData.length; i++){
          const instru_id = instrutorData[i];//get the current professor id
          const instru_obj = Instructor.findOne({id: instru_id});//get the professor object using the id

          var instru_name = instru_obj.first + " " + instru_obj.last;
          instructors = instructors + "<br>" + instru_name ;
        }
      }

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

    getProfInfo: function(prof_list){
      let result = "";
      for(let prof of prof_list){
        let prof_email = " - " + Instructor.findOne({id: prof}).email;
        const prof_first = Instructor.findOne({id: prof}).first;
        const prof_last = Instructor.findOne({id: prof}).last;
        if(!prof_email) prof_email = "";
        result = result + prof_first + " " + prof_last + prof_email + "<br>";
      }

      result = result.substring(0, result.lastIndexOf("<br>"));
      return result;
    },

    addCourse: function(course){
      UserTerms.upsert({
        term: course.term
      }, {
        $push: {
          courses: course.course
        }
      })
      // UserTerms.insert({course: course.course, term: course.term})
    },

    removeCourse: function(course){
      UserTerms.update({
        term: course.term
      }, {
        $pull: {
          courses: course.course
        }
    })
    // UserTerms.remove({term: course.term, term: course.term});
  },
});
