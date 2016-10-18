/*
----------------------------------
Error list:

Search: [1] 

0. "Please have at least 3 characters for title search"

insert: [2] , update: [3], remove: [4]
----------user------------
01. "Not logged in"
02. "No such user"
03. "Not the same user"
04. "Malformed user id"
05.
---------No such --------------
06. "No such term"
07. "No such major"
08. "No such section"
09. "No such instructor"
10. "No such requrement"
11. "No such course"
12. "No such plan"
13. "No such schedule"
14.
15.
16.
17.
18.
19.
-------Exists----------
20. "No chosen course"
21. "Empty schedule"
22. 
23.
24.
25.
26.
27.
28.
29.
30.
-------Check-----------
31. "Duplicate plans"
32. "Incomplete term"
33. "Empty schedule"
34.
35.
36.
37.
38.
39.
40.
-------form-------
41. "Malformed section id"
42. "Malformed course id"
43. "Malformed plan id"
*/

//Create an array of professor names and id's
const prof_name_and_id = [];
if (prof_name_and_id.length == 0) {
    const profData = Instructor.find().fetch();
    for (let person of profData) {
        const first_name = person.first;
        const last_name = person.last;
        if (first_name !== "Staff" && last_name !== "Staff") {
            const full_name = first_name + " " + last_name;
            const id = person.id;
            prof_name_and_id.push({ title: full_name, id: id });
        }
    }
}

//this load all the course codes
const codes = [];
if (codes.length == 0) {
    for (let key of Course.find().fetch()) {
        let code = key.code.substring(0, key.code.indexOf(" "));
        let inArray = false;
        let if_continue = true;
        for (let i = 0; i < codes.length && if_continue; i++) {
            if (codes[i] === code) {
                inArray = true;
                if_continue = false;
            }
        }
        if (!inArray) {
            codes.push(code);
        }
    }
}

//this determines what are the current and future terms
let now_term;
if (Term.find().count() > 0) {
    const date_now = new Date();
    const current_year = date_now.getFullYear();
    const current_month = date_now.getMonth() + 1; //1-12
    const current_date = date_now.getDate(); //1-31
    let season;
    if (current_month >= 1 && current_month < 6) {
        season = "Spring ";
    } else if (current_month >= 6 && current_month < 9) {
        if (current_month == 8 && current_date > 15) {
            season = "Fall ";
        } else {
            season = "Summer ";
        }
    } else {
        season = "Fall ";
    };
    const curren_semester = season + current_year;
    const current_term = Term.findOne({ name: curren_semester }).id;
    now_term = current_term;
    const future_terms = Term.find({ id: { $gt: current_term } }).fetch();
    console.log("Current Term: " + curren_semester);
    let future_terms_string = "";
    for (let term of future_terms) {
        future_terms_string = future_terms_string + term.name + " ";
    }
    console.log("Future Term(s): " + future_terms_string);
}

//this sets the allowed number of terms to be predicted
const server_allowed_terms = 6;

console.log("If you don't see current and future terms, please restart the server");
console.log("Prediction size: " + CoursePrediction.find().count());
console.log("Allowed_terms: " + server_allowed_terms)

Meteor.methods({
    searchPnc: function(keyword, term, req_array, dept, prof, time, if_indept, if_not_sure) {
        //this removed any extra spaces
        keyword = keyword.replace(/ +/gi, " ");
        keyword = keyword.trim();
        const keyword_orig = keyword;
        keyword = keyword.replace(/[^a-z0-9 ]/gi, "\\$&");

        const codes_record = []; //this records the user tokens
        const keys_record = []; //this records all the matches
        for (let item of codes) {
            //in the form of CODE + NUM + LETTER; for exmaple
            //cosi11a, coSi 11a, COsi 400, COsI400
            if (item.includes("/")) { //some code is in the form of COSI/MATH
                //the separates the string to two parts
                //and do the same thing as the one for normal code below
                let indexOfSlash = item.indexOf("/");
                let first_half = item.substring(0, indexOfSlash);
                let second_half = item.substring(indexOfSlash + 1);
                let regex_1 = new RegExp("( |^)" + first_half + " ?(\\d{1,3}[A-Z]{0,2})?( |$)", "i");
                let regex_2 = new RegExp("( |^)" + second_half + " ?(\\d{1,3}[A-Z]{0,2})?( |$)", "i");

                if (keyword.match(regex_1)) {
                    let code_token = keyword.match(regex_1)[0];
                    let code_key = item + " " + code_token.trim().substring(first_half.length).trim().toUpperCase();
                    codes_record.push(code_token);
                    keys_record.push(code_key.trim());
                } else if (keyword.match(regex_2)) {
                    let code_token = keyword.match(regex_2)[0];
                    let code_key = item + " " + code_token.trim().substring(second_half.length).trim().toUpperCase();
                    codes_record.push(code_token);
                    keys_record.push(code_key.trim());
                }
            } else { //for normal code like COSI, MUS, MATH
                let regex = new RegExp("( |^)" + item + " ?(\\d{1,3}[A-Z]{0,2})?( |$)", "i");

                if (keyword.match(regex)) {
                    let code_token = keyword.match(regex)[0];
                    let code_key = item + " " + code_token.trim().substring(item.length).trim().toUpperCase();
                    codes_record.push(code_token);
                    keys_record.push(code_key.trim());
                }
            }
        }

        //this extracts the code token out of the keyword string
        //so that it won't be part of the search for course title
        for (let key of codes_record) {
            if (keyword.match(key)) {
                keyword = keyword.replace(key, " ");
                keyword = keyword.replace(/ {2, }/i, " ");
            }
        }

        //this generates the regex for the actual search for course code
        var regexCode;
        if (keys_record.length != 0) {
            //this put together all the matches by logical OR
            let new_keyword = "(" + keys_record[0];
            for (let i = 1; i < keys_record.length; i++) {
                new_keyword = new_keyword + "|" + keys_record[i];
            }
            new_keyword = new_keyword + ")";

            //this checks if the user wants to do a strict match
            //if so, math10 or math 10 won't return math 100
            //if not, cosi 1 can return any cosi course that has
            //1 as the beginning of course code
            if (!if_not_sure) {
                if (!/\d/i.test(new_keyword)) {
                    regexCode = new RegExp("^" + new_keyword + " \\d{1,3}([A-Z]{0,2})?$", "i");
                } else {
                    regexCode = new RegExp("^" + new_keyword + " ?([A-Z]{0,2})?$", "i");
                }
            } else {
                regexCode = new RegExp("^" + new_keyword + " ?((\\d{1,3})?[A-Z]{0,2})?$", "i");
            };
        } else {
            let regex_general = new RegExp("^\\d{1,3}[A-Z]{0,2}$", "i");
            if(regex_general.test(keyword.trim())){
                let code_token = keyword.match(regex_general)[0];
                let code_key = code_token.trim().toUpperCase();
                if(!Term.findOne({id: term}) && !Subject.findOne({id: new RegExp("-" + dept + "$", "i")})){
                    console.log("[searchPnc] - Only general code: " + code_token);
                    throw new Meteor.Error(100, "Please choose a term or add a department");
                }

                if(!if_not_sure){
                    if(/\d+/i.test(code_key)){
                        regexCode = new RegExp(" " + code_key + "[A-Z]{0,2}$", "i");
                    } else {
                        regexCode = new RegExp(" " + code_key + "$", "i")
                    }
                } else {
                    regexCode = new RegExp(" " + code_key + "\\d{0,2}[A-Z]{0,2}$");
                }

                keyword = keyword.replace(code_token, " ");
                keyword = keyword.replace(" {2, }/i", " ");
            } else {
                regexCode = new RegExp("^", "i");
            }
        }

        //this turns the rest of the key word string into a regex for course title search
        var regexTitle;
        if (/^ +$/.test(keyword)) { //this makes sure there's something left in the keyword string
            regexTitle = new RegExp("^", "i");
        } else {
            regexTitle = new RegExp(keyword.trim(), "i");
        };

        //this generates the regex for term search
        var regexTerm = new RegExp("^" + term, "i");

        //this creates the first query object
        let searchQuery;
        if (if_indept) { //if the user choose to also search independent studies
            searchQuery = { term: regexTerm, code: regexCode, name: regexTitle };
        } else {
            searchQuery = { term: regexTerm, code: regexCode, name: regexTitle, independent_study: false };
        }

        //process the array of requirements
        if (req_array.length != 0) {
            searchQuery.$and = [];
            for (let node of req_array) { //if there's requirement, add it to the qeury object
                searchQuery.$and.push({ requirements: node });
            }
        };

        //process the department
        if (term && dept && dept !== "all") { //if there's term and department
            const dept_query = term + "-" + dept;
            searchQuery['subjects.id'] = dept_query;
        } else if (!term && dept && dept !== "all") { //is there's only department
            let regexDept = new RegExp("-" + dept + "$", "i");
            searchQuery['subjects.id'] = regexDept;
        }

        //process professor name
        let hasProfessor = false;
        let prof_id; //the id for this professor
        if (prof) {
            let section_of_prof; //array of all sections taught by the professor
            for (let item of prof_name_and_id) {
                if (item.title === prof) { //loop through the professor names and see if anything matches
                    prof_id = item.id;
                    section_of_prof = Section.find({ instructors: prof_id }).fetch();
                    hasProfessor = true;
                    break;
                }
            }

            //if no professor matches, return no result
            if (!section_of_prof) {
                return [];
            } else if (section_of_prof.length == 0) {
                return [];
            };

            //else add it to the qeury
            searchQuery.instructors = prof_id;
        }

        //time and date
        let days_array = time.days;
        let search_start = time.start;
        let search_end = time.end;
        //make sure there's actual request on time and date
        if (days_array.length != 0 || (search_start && search_start !== "all") || (search_end && search_end !== "all")) {
            searchQuery.times = {$elemMatch:{$and:[
                {$or:[
                    {type:{$exists:false}},
                    {type:{$exists:true, $in:["Lecture"]}}
                ]}
            ]}}

            if (search_start && search_start !== "all") { //turns the time into minutes after 0:00 AM
                const start_hr = parseInt(search_start.substring(0, search_start.indexOf(":")));
                const start_min = parseInt(search_start.substring(search_start.indexOf(":") + 1));
                search_start = start_hr * 60 + start_min;
            } else { //if there's no request, make it 0, so it starts from the begining of the day
                search_start = 0;
            }

            if (search_end && search_end !== "all") {
                const end_hr = parseInt(search_end.substring(0, search_end.indexOf(":")));
                const end_min = parseInt(search_end.substring(search_end.indexOf(":") + 1));
                search_end = end_hr * 60 + end_min;
            } else {
                search_end = 1440;
            }

            if (search_start >= "0" && search_start <= "1440") { //add the start time to the search if there's any
                //searchQuery["times.start"] = { $gte: search_start, $lte: 1440 };
                searchQuery.times.$elemMatch.$and.push({start: { $gte: search_start, $lte: 1440 }});
            }

            if (search_end >= "0" && search_end <= "1440") { //add the end time to the search if there's any
                //searchQuery["times.end"] = { $gte: 0, $lte: search_end };
                searchQuery.times.$elemMatch.$and.push({end: { $gte: 0, $lte: search_end }})
            }

            if (days_array.length != 0) { //add the days to the search if there's any
                for (let day of days_array) {
                    //searchQuery.$and.push({ 'times.days': day });
                    searchQuery.times.$elemMatch.$and.push({days: day})
                }
            }
        }
        
        if (searchQuery.term == "/^/i" 
            && searchQuery.code == "/^/i" 
            && searchQuery.name == "/(?:)/i"
            && !searchQuery.$and
            && !searchQuery["subjects.id"]
            && !searchQuery.instructors
            && !searchQuery.times) {
            return ["no params"];
        } else if (searchQuery.term == "/^/i" 
            && searchQuery.code == "/^/i" 
            && searchQuery.name != "/(?:)/i"
            && !searchQuery.$and
            && !searchQuery["subjects.id"]
            && !searchQuery.instructors
            && !searchQuery.times) {//when there's only keyword, make sure it's long enough
            //make sure it doesn't return 1800+ pages of result...
            if(keyword_orig.trim().length < 3){
                console.log("[searchPnc] - Keyword too short: " + keyword);
                throw new Meteor.Error(100, "Please have at least 3 characters for title search.");
            }
        } else if (searchQuery.term == "/^/i" 
            && searchQuery.code == "/^/i" 
            && searchQuery.name == "/(?:)/i"
            && !searchQuery.$and
            && !searchQuery["subjects.id"]
            && !searchQuery.instructors
            && searchQuery.times) {//when searching time, it's reasonable to require term.
            //make sure it doesn't return 1800+ pages of result...
            console.log("[searchPnc] - Only time");
            throw new Meteor.Error(100, "Please also choose a term.");
        }
        
        return SearchPnc.find(searchQuery, {
            fields: {
                _id: 0,
                type: 0,
                comment: 0,
                credits: 0,
                independent_study: 0,
            }
        }).fetch();
    },

    searchTerm: function(key) {
        return Term.findOne({ id: key }).name;
    },

    //this takes an array of prof. id's and return results
    //so that each line is one <prof. name>
    //and prevents fencepost error
    searchInstructorArray: function(instrutorData) {
        var instructors = "";
        if (instrutorData.length == 1) {
            const instru_id = instrutorData[0]; //get the current professor id
            const instru_obj = Instructor.findOne({ id: instru_id }); //get the professor object using the id

            var instru_name = instru_obj.first + " " + instru_obj.last;
            if (instru_obj.first == "Staff" || instru_obj.last == "Staff") instru_name = "Staff";
            instructors = instructors + instru_name;
        } else {
            const instru_id_1st = instrutorData[0]; //get the current professor id
            const instru_obj_1st = Instructor.findOne({ id: instru_id_1st }); //get the professor object using the id

            var instru_name_1st = instru_obj_1st.first + " " + instru_obj_1st.last;
            if (instru_obj_1st.first == "Staff" || instru_obj_1st.last == "Staff") return "Staff";
            instructors = instructors + instru_name_1st;

            for (var i = 1; i < instrutorData.length; i++) {
                const instru_id = instrutorData[i]; //get the current professor id
                const instru_obj = Instructor.findOne({ id: instru_id }); //get the professor object using the id

                var instru_name = instru_obj.first + " " + instru_obj.last;
                instructors = instructors + "<br>" + instru_name;
            }
        }

        return instructors;
    },

    //takes a course object and turns it's subjects array into
    //an array so that each item is <major name> + <major type>
    getMajorDetails: function(courseData) {
        const ids = []; //array of major names
        const major_key = courseData.subjects; //get the array of major id's

        for (var i = 0; i < major_key.length; i++) {
            const maj_obj = Subject.findOne({ id: major_key[i].id }); //get the major object using the id
            if(!maj_obj){//for RSEG courses
                ids.push("/");
            } else {
                let maj_detail = "No special notes";
                if (maj_obj.segments[parseInt(major_key[i].segment)]) {
                    maj_detail = maj_obj.segments[parseInt(major_key[i].segment)].name; //get the type of the major using the id
                }
                const maj_name = maj_obj.name;
                ids.push(maj_name + " - " + maj_detail); //add the major name to the array
            }
        };

        if(ids.length > 1){
            for (let i = 0; i < ids.length; i++){
                if(ids[i] === "/"){
                    ids.splice(i, 1);
                    i--;
                }
            }
        }
        
        if(ids.length == 0){
            ids.push("/");
        }
        
        return ids.sort();
    },

    //takes a course object and returns all the sections of it
    getSectionDetails: function(courseData) {
        const section_key = courseData.id; //get the id of the course
        return Section.find({ course: section_key },{
            fields: {
                _id: 0,
                type: 0,
                comment: 0,
                waiting: 0,
            }
        }).fetch(); //an array of corresponding sections
    },

    //returns the array of prof. name and id
    getProfData: function() {
        return prof_name_and_id;
    },

    //takes an array of prof. id's and return a string
    //so that each line is <prof. name> + <prof. email>
    getProfInfo: function(prof_list) {
        let result = "";
        for (let prof of prof_list) {
            let prof_email = " - " + Instructor.findOne({ id: prof }).email;
            const prof_first = Instructor.findOne({ id: prof }).first;
            const prof_last = Instructor.findOne({ id: prof }).last;
            if (!prof_email) prof_email = "";
            result = result + prof_first + " " + prof_last + prof_email + "<br>";
        }

        result = result.substring(0, result.lastIndexOf("<br>"));
        return result;
    },

    //takes a course object and returns all the sections of it
    getSections: function(courseContIdList, term_range) {
        const result = [];
        const term_id_list = [];
        for(let term of Term.find().fetch()){
            if(term.id <= term_range.end && term.id >= term_range.start){
                term_id_list.push(term.id);
            }
        }
        
        for(let term_id of term_id_list){
            for(let continuity_id of courseContIdList){
                const courseId = term_id + "-" + continuity_id;
                const section_info_obj = {
                    sections: Section.find({ course: courseId },{
                        fields: {
                            _id: 0,
                            type: 0,
                            comment: 0,
                            waiting: 0,
                        }
                    }).fetch(),
                    courseId: courseId
                }
                result.push(section_info_obj);
            }
        }

        return result;
    },

    getSections_schedule: function(section_id_list, term_range) {
        const result = [];
        const term_id_list = [];
        for(let term of Term.find().fetch()){
            if(term.id <= term_range.end && term.id >= term_range.start){
                term_id_list.push(term.id);
            }
        }
        
        const courseContIdList = [];
        for(let section_id of section_id_list){
            const course_id = Section.findOne({id: section_id}).course;
            const cont_id = Course.findOne({id: course_id}).continuity_id;
            if(_.indexOf(courseContIdList, cont_id) == -1){
                courseContIdList.push(cont_id)
            }
        }

        for(let term_id of term_id_list){
            for(let continuity_id of courseContIdList){
                const courseId = term_id + "-" + continuity_id;
                const section_info_obj = {
                    sections: Section.find({ course: courseId },{
                        fields: {
                            _id: 0,
                            type: 0,
                            comment: 0,
                            waiting: 0,
                        }
                    }).fetch(),
                    courseId: courseId
                }
                result.push(section_info_obj);
            }
        }

        return result;
    },

    //takes a section id and returns the section object
    getSection: function(sectionId) {
        return Section.findOne({ id: sectionId }, {
            fields: {
                _id: 0,
                type: 0,
                comment: 0,
                waiting: 0,
            }
        });
    },

    getSectionList: function(section_id_list) {
        const result_array = [];
        for (let sectionId of section_id_list) {
            result_array.push(Section.findOne({ id: sectionId }, {
                fields: {
                    _id: 0,
                    type: 0,
                    comment: 0,
                    waiting: 0,
                }
            }));
        }

        return result_array;
    },

    //takes a course id and returns the course object
    getCourse: function(courseId) {
        return Course.findOne({ id: courseId }, {
            fields: {
                _id: 0,
                type: 0,
                comment: 0,
                credits: 0,
                independent_study: 0,
            }
        });
    },

    getCourseCode: function(courseContId){
        return Course.findOne({continuity_id: courseContId}).code;
    },


    //this creates our profile for the current user
    "addUserProfile_Google": function() {
        //check if the user id valid
        if (!this.userId) {
            console.log("[addUserProfile_Google] - Invalid insert: Not logged in");
            throw new Meteor.Error(201, "Invalid insert: Not logged in");
        };

        //check if the user id is in record
        const user_data = Meteor.users.findOne(this.userId);
        if (!user_data) {
            console.log("[addUserProfile_Google] - Invalid insert: No such user: " + this.userId);
            throw new Meteor.Error(202, "Invalid insert: No such user");
        };

        var user_name = user_data.profile.name;
        var user_email = user_data.services.google.email;
        var user_username = user_email.substring(0, user_email.indexOf("@"));

        //get the current user object in users collection if there is
        const user_obj = UserProfilePnc.findOne({ userId: this.userId });
        if (user_obj == null) {
            const profile_obj = {
                userName: user_username,
                userYear: "Junior",
                userId: this.userId,
                wishlist: [],
                majorPlanList: [],
                liked: [],
                watched: [],
                scheduleList: [],
                courseRate: []
            }
            UserProfilePnc.insert(profile_obj);
        };
    },


    "addToWishlist": function(sectionID) {
      if(!this.userId){
        console.log("[addToWishlist] - Invalid update: Not logged in");
        throw new Meteor.Error(301, "Invalid update: Not logged in");
      }

      const currUser = UserProfilePnc.findOne({ userId: this.userId });

      if(!currUser){
        console.log("[addToWishlist] - Invalid update: No such user: " + this.userId);
        throw new Meteor.Error(302, "Invalid update: No such user");
      }

      if(!sectionID.includes("-")){
        console.log("[addToWishlist] - Invalid update: Malformed section id: " + sectionID);
        throw new Meteor.Error(341, "Invalid update: Malformed section id");
      }

      if(!Section.findOne({id: sectionID})){
        console.log("[addToWishlist] - Invalid update: No such section: " + sectionID);
        throw new Meteor.Error(308, "Invalid update: No such section");
      }

      //if section not already in user's wishlist, add it
      if (!_.contains(currUser.wishlist, sectionID)) {
        UserProfilePnc.update({ userId: this.userId }, { $push: { wishlist: sectionID } });
      }
      //if section is already in user's wishlist, remove it
      else if (_.contains(currUser.wishlist, sectionID)) {
        UserProfilePnc.update({ userId: this.userId }, { $pull: { wishlist: sectionID } });
      }
    },


    "sendJSONtoAPI_ai": function(parsedText) {
        var theAPIKey = Meteor.settings.apiSpeechKey;

        const z = HTTP.call(
                "POST",
                "https://api.api.ai/v1/query/", {
                    headers: {
                        "Authorization": "Bearer" + theAPIKey, //API.ai token here (from API.ai account)

                        "Content-Type": "application/json; charset=utf-8"
                    },
                    data: { "query": parsedText, "lang": "en" }
                },
            )
        return z;
    },

    "fetchCourseList": function(courseList) {
        let result_array = [];
        for (let courseId of courseList) {
            const course_array = Course.find({ continuity_id: courseId }, {
                fields: {
                    _id: 0,
                    type: 0,
                    comment: 0,
                    credits: 0,
                    independent_study: 0,
                }
            }).fetch();
            result_array = result_array.concat(course_array);
        };
        return result_array;
    },

    "fetchSectionList": function(sectionList) {
        const result_array = [];
        for (let section of sectionList) {
            const course_id = Section.findOne({ id: section }).course;
            result_array.push(Course.findOne({ id: course_id }, {
                fields: {
                    _id: 0,
                    type: 0,
                    comment: 0,
                    credits: 0,
                    independent_study: 0,
                }
            }));
        }
        return result_array;
    },

    "fetchSections": function(wishlist) {
        const result_array = [];
        for (let section of wishlist) {
            const section_obj = Section.findOne({ id: section });
            const course_id = section_obj.course;
            const course_obj = Course.findOne({ id: course_id });
            const course_code = course_obj.code;
            const course_term = course_obj.term;
            const course_req = course_obj.requirements;
            const course_title = course_obj.name;
            const term_obj = Term.findOne({ id: course_term });
            const term_name = term_obj.name;
            section_obj.code = course_code;
            section_obj.termName = term_name;
            section_obj.term = course_term;
            section_obj.req = course_req;
            section_obj.courseName = course_title;
            const instructors_list = section_obj.instructors;
            const instructor_names = [];
            for (let instructor of instructors_list) {
                const instructor_obj = Instructor.findOne({ id: instructor });
                const first_name = instructor_obj.first;
                const last_name = instructor_obj.last;
                let full_name = "";
                if (first_name === "Staff" || last_name === "Staff") {
                    full_name = "Staff"
                } else {
                    full_name = first_name + " " + last_name;
                }
                instructor_names.push(full_name);
            }
            section_obj.instructorNames = instructor_names;
            result_array.push(section_obj);
        }

        return result_array;
    },

    fetchContList: function(courseContIdList){
        const result = [];
        for(let continuity_id of courseContIdList){
            const course_data = Course.find({continuity_id: continuity_id}).fetch().sort(function(a, b){return b.term - a.term})[0];
            const course_info_obj = {
                code: course_data.code,
                continuity_id: course_data.continuity_id,
                course_id: course_data.id
            }
            result.push(course_info_obj);
        }

        return result;
    },

    "saveMajorPlan": function(scheduleList, major_code, availableCourseList, term_range, futureList) {
        if (!this.userId) {
            console.log("[saveMajorPlan] - Invalid insert: Not logged in");
            throw new Meteor.Error(201, "Invalid insert: Not logged in");
        };

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[saveMajorPlan] - Invalid insert: No such user: " + this.userId);
            throw new Meteor.Error(202, "Invalid insert: No such user");
        };

        const code_regex = new RegExp("-" + major_code + "$", "i");
        const major_name = Subject.findOne({ id: code_regex }).name;
        let final_major_plan;
        if(futureList.length == 0){
            final_major_plan = {
                majorName: major_name,
                majorId: major_code,
                userId: this.userId,
                chosenCourse: availableCourseList,
                scheduleList: scheduleList,
                start_term: term_range.start_term,
                end_term: term_range.end_term
            };
        } else {
            final_major_plan = {
                majorName: major_name,
                majorId: major_code,
                userId: this.userId,
                chosenCourse: availableCourseList,
                scheduleList: scheduleList,
                start_term: term_range.start_term,
                end_term: term_range.end_term,
                futureList: futureList
            };
        }

        const major_plan_id = MajorPlansPnc.insert(final_major_plan);
        UserProfilePnc.update({ userId: this.userId }, { $push: { majorPlanList: major_plan_id } });
        const return_result = {
            scheduleList: scheduleList,
            majorPlanObj: final_major_plan,
            majorPlan_Id: major_plan_id
        };

        for (let schedule of scheduleList) {
            SchedulesPnc.update(schedule, { $set: { plan: major_plan_id } });
        };

        return return_result;
    },

    "saveSchedule_MajorPlan": function(scheduleList, major_code, availableCourseList, term_range) {
        if (!this.userId) {
            console.log("[saveSchedule_MajorPlan] - Invaid insert: Not logged in");
            throw new Meteor.Error(201, "Invalid insert: Not logged in");
        };

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: No such user: " + this.userId);
            throw new Meteor.Error(202, "Invalid insert: No such user");
        };

        let regexCode = new RegExp("-" + major_code + "$", "i");
        if (!Subject.findOne({ id: regexCode })) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: No such major: " + major_code);
            throw new Meteor.Error(207, "Invalid insert: No such major");
        };

        if (availableCourseList.length == 0) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: No chosen course");
            throw new Meteor.Error(220, "Invalid insert: No chosen course");
        };

        if (scheduleList.length == 0) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: Empty schedule");
            throw new Meteor.Error(221, "Invalid insert: Empty schedule");
        };

        if (!term_range.start_term || !term_range.end_term) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: Incomplete term");
            throw new Meteor.Error(232, "Invalid insert: Incomplete term");
        };


        const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
        let latest_allowed_term = latest_term;
        for(let i = 0; i < server_allowed_terms; i++){
            if(("" + latest_allowed_term).charAt(3) == 1){
                latest_allowed_term += 2;
            } else {
                latest_allowed_term += 8;
            }
        }
        if ((!Term.findOne({ id: term_range.start_term }) || !Term.findOne({ id: term_range.end_term }))
            &&(term_range.start_term > latest_allowed_term || term_range.end_term > latest_allowed_term)) {
            console.log("[saveSchedule_MajorPlan] - Invalid insert: No such term: [start: " + term_range.start_term + "] " + "[end: " + term_range.end_term + "]");
            throw new Meteor.Error(206, "Invalid insert: No such term");
        };

        if (MajorPlansPnc.findOne({userId: this.userId, majorId: major_code, start_term: term_range.start_term, end_term: term_range.end_term})){
            console.log("[saveSchedule_MajorPlan] - Invalid insert: Duplicate plans");
            throw new Meteor.Error(231, "Invalid insert: Duplicate plans");
        };

        const schedule_id_list = [];
        const futureList = [];
        for (let schedule of scheduleList) {
            if(Term.findOne({id: schedule.term})){
                const schedule_obj = {
                    term: schedule.term,
                    courseList: schedule.chosenCourse,
                    userId: this.userId
                }

                const schedule_id = SchedulesPnc.insert(schedule_obj);
                schedule_id_list.push(schedule_id);
            } else {
                const future_obj = {
                    term: schedule.term,
                    courseList: schedule.chosenCourse
                }

                futureList.push(future_obj);
            }
        };

        Meteor.call("saveMajorPlan", schedule_id_list, major_code, availableCourseList, term_range, futureList, function(err, result) {
            if (err) {
                return err.message;
            }

            return result;
        })
    },

    "fetchScheduleList": function(scheduleList) {
        const result = {};
        for (let schedule of scheduleList) {
            const schedule_obj = SchedulesPnc.findOne(schedule);
            const schedule_term = schedule_obj.term;
            const schedule_course = schedule_obj.courseList;

            result[schedule_term] = {};
            for (let section of schedule_course) {
                const section_obj = Section.findOne({ id: section.section_id });
                const courseCode = Course.findOne({ id: section_obj.course }).code;
                result[schedule_term][section.section_id] = {
                    chosen: section.chosen,
                    object: section_obj,
                    courseCode: courseCode
                };
            }

        }
        return result;
    },

    "updateSchedule_MajorPlan": function(scheduleList, major_code, availableCourseList, current_plan_id, term_range) {
        if (!this.userId) {
            console.log("[updateSchedule_MajorPlan] - Invaid update: Not logged in");
            throw new Meteor.Error(301, "Invalid update: Not logged in");
        };

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: No such user: " + this.userId);
            throw new Meteor.Error(302, "Invalid update: No such user");
        };

        let regexCode = new RegExp("-" + major_code + "$", "i");
        if (!Subject.findOne({ id: regexCode })) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: No such major: " + major_code);
            throw new Meteor.Error(307, "Invalid update: No such major");
        };

        if (availableCourseList.length == 0) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: No chosen course");
            throw new Meteor.Error(320, "Invalid update: No chosen course");
        };

        if (scheduleList.length == 0) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: Empty schedule");
            throw new Meteor.Error(333, "Invalid update: Empty schedule");
        };

        if (!term_range.start_term || !term_range.end_term) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: Incomplete term");
            throw new Meteor.Error(332, "Invalid update: Incomplete term");
        };


        const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
        let latest_allowed_term = latest_term;
        for(let i = 0; i < server_allowed_terms; i++){
            if(("" + latest_allowed_term).charAt(3) == 1){
                latest_allowed_term += 2;
            } else {
                latest_allowed_term += 8;
            }
        }
        if ((!Term.findOne({ id: term_range.start_term }) || !Term.findOne({ id: term_range.end_term }))
            &&(term_range.start_term > latest_allowed_term || term_range.end_term > latest_allowed_term)) {
            console.log("[updateSchedule_MajorPlan] - Invalid update: No such term: [start: " + term_range.start_term + "] " + "[end: " + term_range.end_term + "]");
            throw new Meteor.Error(306, "Invalid update: No such term");
        };

        const plan_obj = MajorPlansPnc.findOne(current_plan_id);
        const previous_schedules = plan_obj.scheduleList;
        for (let schedule of previous_schedules) {
            const schedule_term = SchedulesPnc.findOne(schedule).term;
            if (schedule_term < term_range.start_term || schedule_term > term_range.end_term) {
                MajorPlansPnc.update(current_plan_id, { $pull: { scheduleList: schedule } });
                SchedulesPnc.remove(schedule);
            }
        }

        const futureList = [];
        for (let schedule of scheduleList) {
            if(Term.findOne({id: schedule.term})){
                const schedule_obj = {
                    term: schedule.term,
                    courseList: schedule.chosenCourse,
                    userId: this.userId,
                    plan: current_plan_id
                }
                if (SchedulesPnc.findOne({ plan: current_plan_id, term: schedule.term })) {
                    SchedulesPnc.update({ plan: current_plan_id, term: schedule.term }, { $set: { courseList: schedule.chosenCourse, plan: current_plan_id } });
                } else {
                    const new_schedule_id = SchedulesPnc.insert(schedule_obj);
                    MajorPlansPnc.update(current_plan_id, { $push: { scheduleList: new_schedule_id } });
                }
            } else {
                const future_obj = {
                    term: schedule.term,
                    courseList: schedule.chosenCourse
                }

                futureList.push(future_obj);
            } 
        };

        MajorPlansPnc.update(current_plan_id, { $set: { start_term: term_range.start_term, end_term: term_range.end_term } });
        if(futureList.length != 0){
            MajorPlansPnc.update(current_plan_id, {$set: {futureList: futureList}})
        } else {
            MajorPlansPnc.update(current_plan_id, {$unset: {futureList: null}})
        }
    },

    saveSchedule: function(scheduleList) {
        if (!this.userId) {
            console.log("[saveSchedule] - Invalid update: Not logged in")
            throw new Meteor.Error(301, "Invalid update: Not logged in");
        }

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[saveSchedule] - Invalid update: No such user: " + this.userId);
            throw new Meteor.Error(302, "Invalid update: No such user");
        }

        if (scheduleList.length == 0) {
            console.log("[saveSchedule] - Invalid update: Empty schedule");
            throw new Meteor.Error(333, "Invalid update: Empty schedule");
        }

        for (let schedule of scheduleList) {
            const schedule_obj = {
                    userId: this.userId,
                    term: schedule.term,
                    courseList: schedule.chosenCourse
                }

            if(schedule.chosenCourse.length != 0){
                //if it exists, just update it
                if (SchedulesPnc.findOne({ userId: this.userId, term: schedule.term, plan: { $exists: false } })) {
                    SchedulesPnc.update({ userId: this.userId, term: schedule.term, plan: { $exists: false } }, {
                        $set: {
                            courseList: schedule.chosenCourse
                        }
                    });
                } else { //if not, insert and put it to user profile
                    const new_schedule_id = SchedulesPnc.insert(schedule_obj);
                    UserProfilePnc.update({ userId: this.userId }, {
                        $push: {
                            scheduleList: new_schedule_id
                        }
                    });
                }
            } else {
                if (SchedulesPnc.findOne({ userId: this.userId, term: schedule.term, plan: { $exists: false } })) {
                    const schedule_id = SchedulesPnc.findOne({ userId: this.userId, term: schedule.term, plan: { $exists: false } })._id;
                    SchedulesPnc.remove(schedule_id);
                    UserProfilePnc.update({ userId: this.userId }, {
                        $pull: {
                            scheduleList: schedule_id
                        }
                    });
                }
            }
        }
    },

    checkValidPlan: function(term_range, major_id){
        const latest_term = parseInt(Term.find().fetch()[Term.find().count() - 1].id);
        let latest_allowed_term = latest_term;
        for(let i = 0; i < server_allowed_terms; i++){
            if(("" + latest_allowed_term).charAt(3) == 1){
                latest_allowed_term += 2;
            } else {
                latest_allowed_term += 8;
            }
        }

        let regexCode = new RegExp("-" + major_id + "$", "i");
        if (!Subject.findOne({ id: regexCode })) {
            console.log("[checkValidPlan] - No such major: " + major_id);
            throw new Meteor.Error(107, "No such major");
        };

        if (!term_range.start_term || !term_range.end_term) {
            console.log("[checkValidPlan] - Incomplete term");
            throw new Meteor.Error(132, "Incomplete term");
        };

        if ((!Term.findOne({ id: term_range.start_term }) || !Term.findOne({ id: term_range.end_term }))
             &&(term_range.start_term > latest_allowed_term || term_range.end_term > latest_allowed_term)) {
            console.log("[checkValidPlan] - No such term: [start: " + term_range.start_term + "] " + "[end: " + term_range.end_term + "]");
            throw new Meteor.Error(106, "No such term");
        };

        //check if the plan exists if the user is logged in
        if(this.userId){//when the user is logged in
            if(!UserProfilePnc.findOne({userId: this.userId})){
                console.log("[checkValidPlan] No such user: " + this.userId);
                throw new Meteor.Error(102, "No such user");
            } else {
                return !MajorPlansPnc.findOne({userId: this.userId, majorId: major_id, start_term: term_range.start_term, end_term: term_range.end_term});
            }
        } else {//if it reaches here, it means it passed the check
            return true;
        }
    },

    deletePlan: function(plan_id) {
        if (!this.userId) {
            console.log("[deletePlan] - Invalid remove: Not logged in");
            throw new Meteor.Error(401, "Invalid remove: Not logged in");
        }

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[deletePlan] - Invalid remove: No such user: " + this.userId);
            throw new Meteor.Error(402, "Invalid remove: No such user");
        }

        if (!/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/.test(plan_id)) {
            consle.log("[deletePlan] - Invalid remove: Malformed plan id: " + plan_id);
            throw new Meteor.Error(443, "Invalid remove: Malformed plan id");
        }

        if (!MajorPlansPnc.findOne(plan_id)) {
            console.log("[deletePlan] - Invalid remove: No such plan: " + plan_id);
            throw new Meteor.Error(412, "Invalid remove: No such plan");
        }

        if (MajorPlansPnc.findOne(plan_id).userId !== this.userId) {
            console.log("[deletePlan] Invalid remove: Not the same user: [current: " + this.userId + "] " + "[target: " + MajorPlansPnc.findOne(plan_id).userId + "]");
            throw new Meteor.Error(403, "Invalid remove: Not the same user");
        }

        const plan_obj = MajorPlansPnc.findOne(plan_id);
        const scheduleList = plan_obj.scheduleList;
        MajorPlansPnc.remove(plan_id);
        for (let schedule of scheduleList) {
            SchedulesPnc.remove(schedule);
        }
        UserProfilePnc.update({ userId: this.userId }, { $pull: { majorPlanList: plan_id } });
    },

    "remove_wishlist_section": function(section_id) {
        if (!this.userId) {
            console.log("[remove_wishlist_section] - Invalid remove: Not logged in");
            throw new Meteor.Error(401, "Invalid remove: Not logged in");
        }

        if (!UserProfilePnc.findOne({ userId: this.userId })) {
            console.log("[remove_wishlist_section] - Invalid remove: No such user: " + this.userId);
            throw new Meteor.Error(402, "Invalid remove: No such user");
        }

        if (!section_id.includes("-")) {
            console.log("[remove_wishlist_section] - Invalid remove: Malformed section id: " + section_id);
            throw new Meteor.Error(441, "Invalid remove: Malformed section id");
        }

        const user_profile = UserProfilePnc.findOne({ userId: this.userId });
        let isInside = false;
        for (let section of user_profile.wishlist) {
            if (section === section_id) {
                isInside = true;
                break
            }
        }
        if (!isInside) {
            console.log("[remove_wishlist_section] - Invalid remove: No such section: " + section_id);
            throw new Meteor.Error(408, "Invalid remove: No such section");
        }

        UserProfilePnc.update({ userId: this.userId }, { $pull: { wishlist: section_id } });
    },

    getCourseHistory: function(continuity_id){
      const theHistory = Course.find({continuity_id: continuity_id}).fetch();
      var historyTermCodes = _.pluck(theHistory, "term");

      historyTermCodes.sort().reverse();

      var historyTermNames = _.map(historyTermCodes, function(code){
        return Term.findOne({id:code}).name;
      })

      return historyTermNames;
    },

    getUsername: function(plan_id){
        if (!/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/.test(plan_id)) {
            consle.log("[getUsername] - Invalid remove: Malformed plan id: " + plan_id);
            throw new Meteor.Error(443, "Invalid remove: Malformed plan id");
        }

        if (!MajorPlansPnc.findOne(plan_id)) {
            console.log("[getUsername] - Invalid remove: No such plan: " + plan_id);
            throw new Meteor.Error(412, "Invalid remove: No such plan");
        }

        const userId = MajorPlansPnc.findOne(plan_id).userId;
        return UserProfilePnc.findOne({userId: userId}).userName;
    },

    predictionAlgorithm: function(key){
        //prevent unauthorized call
        if(!key){
            console.log("[predictionAlgorithm]: Empty key");
            return;
        } else if(!Meteor.settings.predictionKey){
            console.log("[predictionAlgorithm]: No server key");
            return;
        } else if(key !== Meteor.settings.predictionKey){
            console.log("[predictionAlgorithm]: Invalid key - " + key);
            return;
        } 

        //this saves all the distinct cont id's
        const course_list = Course.find().fetch(); //array of all courses
        const cont_id_list = [];
        for (let course of course_list) {
            let isInside = false;
            for (let id of cont_id_list) {
                if (id === course.continuity_id) {
                    isInside = true;
                    break
                }
            }
            if (!isInside) {
                cont_id_list.push(course.continuity_id);
            }
        }

        //this serves as a global dictionary for the algorithm
        const homeDict = {};

        function runAlgorithm() {
            console.log("started")
            const test_analysis = {};
            homeDict["test_analysis"] = test_analysis;
            const cont_list = cont_id_list;
            CoursePrediction.remove({});
            var count = 0;
            for (let id of cont_list) {
                const continuity_id = id;
                const theHistory = Course.find({continuity_id: continuity_id,}).fetch();
                var historyTermCodes = _.pluck(theHistory, "term");

                historyTermCodes.sort().reverse();

                //exclude summer
                var historyTermNames = _.map(historyTermCodes, function(code_rec){
                    const code = code_rec.replace(/3$/, 2);
                    return code_rec + ": " + Term.findOne({id:code_rec}).name + " - " + (parseInt((2 * (code.substring(0, 3) - 104)) + parseInt((code.substring(3) - 1))));
                })

                homeDict[id + "courseOfferings"] = historyTermNames.reverse();
                prediction(id);
                
                count++;
                if (count == cont_list.length) {
                    console.log("done!");
                    //result();
                }
            }
        }

        function result() {
            const result = homeDict["test_analysis"];
            const rec = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }

            let size = 0;
            let sum = 0;
            for (let r in result) {
                size++;
                sum = sum + result[r];
                if (result[r] == 1) {
                    rec[10] = rec[10] + 1;
                } else if (result[r] >= 0.9) {
                    rec[9] = rec[9] + 1;
                } else if (result[r] >= 0.8) {
                    rec[8] = rec[8] + 1;
                } else if (result[r] >= 0.7) {
                    rec[7] = rec[7] + 1;
                } else if (result[r] >= 0.6) {
                    rec[6] = rec[6] + 1;
                } else if (result[r] >= 0.5) {
                    rec[5] = rec[5] + 1;
                } else if (result[r] >= 0.4) {
                    rec[4] = rec[4] + 1;
                } else if (result[r] >= 0.3) {
                    rec[3] = rec[3] + 1;
                } else if (result[r] >= 0.2) {
                    rec[2] = rec[2] + 1;
                } else if (result[r] >= 0.1) {
                    rec[1] = rec[1] + 1;
                } else {
                    rec[0] = rec[0] + 1;
                }
            }
            const average = sum / size;

            let d_sum = 0;
            for (let r in result) {
                d_sum = d_sum + (result[r] - average) * (result[r] - average);
            }
            const std = Math.sqrt(d_sum / size).toFixed(2);

            console.log("Average accuracy: " + average.toFixed(2) * 100 + "%");
            console.log("STD: " + std);
            console.log("Distribution:")
            for (let r in rec) {
                console.log(">=" + r * 10 + "%: " + rec[r]);
            }
        }

        function prediction(continuity_id) {
            //These are the configurations for the prediction
            const limit_line_u = 0.8;
            const limit_line_d = 0.2;
            const term_now = now_term; //1133;
            const weight_percent = 0.75;
            const mixed_percent = 0.9;
            const allowed_terms = 6;
            const latest_term_code = Term.find().fetch()[Term.find().count() - 1].id.replace(/3$/, 2);
            const latest_available_term_index = (parseInt((2 * (latest_term_code.substring(0, 3) - 104)) + parseInt((latest_term_code.substring(3) - 1))));//20;


            function weight(obj) {
                //return Math.pow(2, obj);
                //return obj * obj * obj;
                return Math.pow(obj, 5);
                //return obj;
            }

            const cont_list = cont_id_list
            const result_array = [];
            const result_obj = {};
            const his_array = homeDict[continuity_id + "courseOfferings"];
            const his_array_rec = homeDict[continuity_id + "courseOfferings"];
            homeDict[continuity_id + "courseOfferings"] = null;
            const course_obj = Course.findOne({ continuity_id: continuity_id });
            const course_description = course_obj.description;

            for (let i = 0; i < his_array.length; i++) {
                const current_term_num = parseInt(his_array[i].substring(0, his_array[i].indexOf(":")));
                if (his_array[i].includes("Summer") || current_term_num > term_now) {
                    his_array.splice(i, 1);
                    i--;
                }
            }

            //build a record for checking
            for (let i = 0; i < his_array_rec.length; i++) {
                const current_term_num = parseInt(his_array_rec[i].substring(0, his_array_rec[i].indexOf(":")));
                if (his_array_rec[i].includes("Summer")) {
                    his_array_rec.splice(i, 1);
                    i--;
                }
            }

            const his_rec = {};
            for (let term of his_array_rec) {
                const term_num = term.substring(0, term.indexOf(":"));
                his_rec[term_num] = 1;
            }

            if (his_array.length <= 1) {
                //return [{text:"xxxxxxUnpredictable", color:"red"}];
                //console.log("Not enough history");
                return;
            }

            let total = 0;
            for (let i = 1; i < his_array.length; i++) {
                const current_index = his_array[i].substring(his_array[i].lastIndexOf(" "));
                const previous_index = his_array[i - 1].substring(his_array[i - 1].lastIndexOf(" "));
                const index_difference = current_index - previous_index;
                if (!result_obj[index_difference]) {
                    result_obj[index_difference] = 1;
                } else {
                    result_obj[index_difference] = result_obj[index_difference] + 1;
                }
                total = total + 1;
            }

            //generate weight: indexes that repeat the most will have much higher weight
            let difference_number = 0;
            let max_index_num = -1;
            for (let dif in result_obj) {
                const current_number = result_obj[dif];
                if (current_number >= max_index_num) {
                    max_index_num = current_number;
                }
                const weighted_number = weight(result_obj[dif]); //Math.pow(2, result_obj[dif]);
                result_obj[dif] = weighted_number;
                total = total - current_number + weighted_number;
            }

            const dif_p = {};
            for (let indexD in result_obj) {
                dif_p[indexD] = result_obj[indexD] / total;
            }

            //check the difference between the number of index differences and hitory array size
            //if it's very unstable, return unpredictable
            if (difference_number > his_array.length / 2 && max_index_num < Math.floor(his_array.length / 2)) {
                console.log("Unstable");
                return;
            }

            const term_p = {}
            const prediction_stack = [];
            const current_term_index = parseInt(his_array[his_array.length - 1].substring(his_array[his_array.length - 1].lastIndexOf(" ")));
            const index_difference = latest_available_term_index - current_term_index + allowed_terms;
            for(let i = 0; i < index_difference; i++){
                //add the prediction for the current term to the stack
                if(!dif_p[i + 1]){
                    prediction_stack[i] = 0;
                } else {
                    prediction_stack[i] = dif_p[i + 1];
                }

                //compute other possibilities using previous results
                for(let j = 0; j < i; j++){
                    if(dif_p[i - j]){
                        prediction_stack[i] += dif_p[i - j] * prediction_stack[j]; 
                    }
                }

                term_p[i + 1] = prediction_stack[i];
            }

            let result = [];
            for (let i = 1; i <= index_difference; i++) {
                const term = i;
                if (!term_p[term]) {
                    term_p[term] = 0;
                }

                const f_term_index = current_term_index + parseInt(term);
                let f_term_id;
                if (f_term_index % 2 == 0) { //if the index is even
                    f_term_id = ((f_term_index / 2) + 104) * 10 + 1;
                } else { //if the index is odd
                    f_term_id = (((f_term_index - 1) / 2) + 104) * 10 + 3;
                }

                let termName;
                if ((f_term_id + "").charAt(3) == 1) { //for spring semester
                    termName = "Spring " + ((parseInt((f_term_id + "").substring(0, 3)) - 104) + 2004) + " - ";
                } else { //for fall semester
                    termName = "Fall " + ((parseInt((f_term_id + "").substring(0, 3)) - 104) + 2004) + " - ";
                }

                let possibility_text = "";
                let color;
                if (term_p[term] >= 0.9) {
                    possibility_text = "Highly possible";
                    color = "blue";
                } else if (term_p[term] >= 0.75) {
                    possibility_text = "Possible";
                } else if (term_p[term] >= 0.5) {
                    possibility_text = "Netural";
                } else if (term_p[term] >= 0.3) {
                    possibility_text = "Not likely";
                } else if (term_p[term] >= 0.1) {
                    possibility_text = "Slight chance";
                } else {
                    possibility_text = "Almost no chance";
                    color = "red";
                }

                if (i > index_difference - allowed_terms) { //predict 10 semesters from the latest one we have
                    result.push({
                        text: f_term_id + ": " + termName + possibility_text,
                        color: color,
                        percentage: term_p[term],
                        p_text: possibility_text
                    });
                }
            }

            //insert into the collection
            const prediction_obj = {
                course: continuity_id
            }
            for (let p of result) {
                const term = p.text.substring(0, p.text.indexOf(":"));
                prediction_obj[term] = {
                    txet: p.p_text,
                    percentage: p.percentage
                }
            }
            CoursePrediction.insert(prediction_obj);

            const pdct_list = result.sort(function(a, b) {
                return parseInt(b.text.substring(0, 4)) - parseInt(a.text.substring(0, 4));
            });

            const result_analysis = { good: 0, bad: 0 }
            for (let term of pdct_list) {
                const f_term_num = term.text.substring(0, term.text.indexOf(":"));
                if (his_rec[f_term_num]) { //if the course is offered in this semester
                    if (term.percentage > limit_line_u) { //if the prediction possibility is higher than the limit
                        result_analysis.good = result_analysis.good + 1;
                    } else {
                        result_analysis.bad = result_analysis.bad + 1;
                    }
                } else {
                    if (term.percentage < limit_line_d) { //if the prediction possibility is lower than the limit
                        result_analysis.good = result_analysis.good + 1;
                    } else {
                        result_analysis.bad = result_analysis.bad + 1;
                    }
                }
            };

            const result_p = result_analysis.good / (result_analysis.good + result_analysis.bad);
            const test_analysis = homeDict["test_analysis"];
            test_analysis[continuity_id] = result_p;
            homeDict["test_analysis"] = test_analysis;
        }

        runAlgorithm();
    },

    getCoursePrediction: function(continuity_id_list){
        const result = {};

        for(let continuity_id of continuity_id_list){
            //check if the id is valid
            const prediction_obj = CoursePrediction.findOne({course: continuity_id});

            if(!prediction_obj){
                result[continuity_id] = {};
            } else {
                delete prediction_obj["course"]
                result[continuity_id] = prediction_obj;
            } 
        }
        
        return result;
    },
});

const methodList = Meteor.default_server.method_handlers;
const nameList = _.pluck(methodList, 'name');
const nameListFiltered = _.filter(nameList, function(name){return name != ''});

DDPRateLimiter.addRule({
  name(name) {
    return _.contains(nameListFiltered, name);
  },

  // Rate limit per connection ID
  connectionId() { return true; }
}, 20, 5000);
