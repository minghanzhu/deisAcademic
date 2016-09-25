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
            result();
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
    const term_now = 1133;
    const weight_percent = 0.75;
    const mixed_percent = 0.9;
    const allowed_terms = 6;
    const latest_available_term_index = 20;

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
    let if_need_check = false;
    for (let dif in result_obj) {
        const current_number = result_obj[dif];
        if (current_number >= max_index_num) {
            max_index_num = current_number;
        }
        const weighted_number = weight(result_obj[dif]); //Math.pow(2, result_obj[dif]);
        result_obj[dif] = weighted_number;
        total = total - current_number + weighted_number;
    }

    //take into account the course description

    if (course_description.includes("Usually offered every semester")) {
        const current_number = result_obj["1"]
        if (current_number) {
            const current_p = current_number / total;
            if (current_p >= (1 - weight_percent)) {
                result_obj["1"] = Math.round((mixed_percent / (1 - mixed_percent)) * total);
            } else {
                result_obj["1"] = Math.round((weight_percent / (1 - weight_percent)) * (total - current_number));
            }
            total = total - current_number + result_obj["1"];
        } else {
            result_obj["1"] = Math.round((weight_percent / (1 - weight_percent)) * total);
            total += result_obj["1"];
        }
    } else if (course_description.includes("Usually offered every year")) {
        const current_number = result_obj["2"]
        if (current_number) {
            const current_p = current_number / total;
            if (current_p >= (1 - weight_percent)) {
                result_obj["2"] = Math.round((mixed_percent / (1 - mixed_percent)) * total);
            } else {
                result_obj["2"] = Math.round((weight_percent / (1 - weight_percent)) * (total - current_number));
            }
            total = total - current_number + result_obj["2"];
        } else {
            result_obj["2"] = Math.round((weight_percent / (1 - weight_percent)) * total);
            total += result_obj["2"];
        }
    } else if (course_description.includes("Usually offered every second year")) {
        const current_number = result_obj["4"]
        if (current_number) {
            const current_p = current_number / total;
            if (current_p >= (1 - weight_percent)) {
                result_obj["4"] = Math.round((mixed_percent / (1 - mixed_percent)) * total);
            } else {
                result_obj["4"] = Math.round((weight_percent / (1 - weight_percent)) * (total - current_number));
            }
            total = total - current_number + result_obj["4"];
        } else {
            result_obj["4"] = Math.round((weight_percent / (1 - weight_percent)) * total);
            total += result_obj["4"];
        }
    } else if (course_description.includes("Usually offered every third year")) {
        const current_number = result_obj["6"]
        if (current_number) {
            const current_p = current_number / total;
            if (current_p >= (1 - weight_percent)) {
                result_obj["6"] = Math.round((mixed_percent / (1 - mixed_percent)) * total);
            } else {
                result_obj["6"] = Math.round((weight_percent / (1 - weight_percent)) * (total - current_number));
            }
            total = total - current_number + result_obj["6"];
        } else {
            result_obj["6"] = Math.round((weight_percent / (1 - weight_percent)) * total);
            total += result_obj["6"];
        }
    } else {
        if_need_check = true;
    }

    const dif_p = {};
    for (let indexD in result_obj) {
        dif_p[indexD] = result_obj[indexD] / total;
    }

    //check the difference between the number of index differences and hitory array size
    //if it's very unstable, return unpredictable
    if (if_need_check && difference_number > his_array.length / 2 && max_index_num < Math.floor(his_array.length / 2)) {
        //return [{text:"xxxxxxUnpredictable", color:"red"}];
        console.log("Unstable");
        return;
    }

    const term_p = {}

    let dif_p_size = 0;
    for(let dif in dif_p){
        dif_p_size++;
    }
    const term_rec = [];
    //function termPathIteration(){
        for(let i = 1; i <= allowed_terms; i++){
            if(i == 1){
                //save the term differences into the rec array
                for(let dif in dif_p){
                    term_rec.push([dif]);
                }

                //compute the percentage for the terms
                for(let addition of term_rec){
                    if(addition[0] <= allowed_terms){
                        term_p[i] = dif_p[addition[0]];
                    }
                }
            } else {
                let ending_index;
                if(dif_p_size != 1){
                    ending_index = (Math.pow(dif_p_size, i) - (2 * dif_p_size) + 1) / (dif_p_size - 1);
                } else {
                    ending_index = i - 1;
                }

                let starting_index;
                if(i == 2){
                    starting_index = 0;
                } else {
                    if(dif_p_size != 1){
                        starting_index = ending_index - Math.pow(dif_p_size, i - 1) + 1;
                    } else{
                        starting_index = i - 1;
                    }   
                }

                //save the term differences into the rec array
                for(let dif in dif_p){
                    for(let j = starting_index; j <= ending_index; j++){
                        const current_addition_array = term_rec[j];
                        const new_addition_array = [];
                        for(let term_dif of current_addition_array){
                            new_addition_array.push(parseInt(term_dif));
                        }

                        new_addition_array.push(parseInt(dif));
                        term_rec.push(new_addition_array);
                    }
                }

                //compute the percentage for the terms
                for(let j = ending_index + 1; j < term_rec.length; j++){
                    let current_term = 0;
                    let precentage_result = 1;
                    for(let term_dif of term_rec[j]){
                        current_term += parseInt(term_dif);
                        precentage_result *= dif_p[term_dif];
                    }

                    if(current_term <= allowed_terms){
                        if(!term_p[current_term]){
                            term_p[current_term] = precentage_result;
                        } else {
                            term_p[current_term] += precentage_result;
                        }
                    }
                }
            }
        }
    //}
    //termPathIteration();
    /*
    function termPath(n, current_percentage) {
        comp_times++;
        if (n >= allowed_terms) { //if the current semester is larger than 5 years (10 semesters) ahead of the real current term
            //it'll stop here
            //save the term and percentage first
            if (!term_p[n]) {
                term_p[n] = current_percentage;
            } else {
                term_p[n] = term_p[n] + current_percentage;
            }
        } else { //if the current semester is included in the 5 years (10 semesters)
            if (n == 0) { //for the first time
                for (let dif in dif_p) {
                    const new_term = parseInt(dif) + n; //0 + dif, which is the next term
                    const new_percentage = dif_p[dif]; //get the initial percentage of the term
                    termPath(new_term, new_percentage);
                }
            } else {
                //save the term and percentage first
                if (!term_p[n]) {
                    term_p[n] = current_percentage;
                } else {
                    term_p[n] = term_p[n] + current_percentage;
                }

                //then go to new ones
                const current_term = n;
                for (let dif in dif_p) {
                    const next_term = parseInt(dif) + n;
                    const next_percentage = dif_p[dif] * current_percentage;
                    termPath(next_term, next_percentage);
                }
            }

        }
    };

    termPath(0, 0);
    */

    const current_term_index = parseInt(his_array[his_array.length - 1].substring(his_array[his_array.length - 1].lastIndexOf(" ")));
    const index_difference = latest_available_term_index - current_term_index + allowed_terms;
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
                //console.log(term.text + " - Good prediction");
                result_analysis.good = result_analysis.good + 1;
            } else {
                //console.log(term.text + " - Bad prediction");
                result_analysis.bad = result_analysis.bad + 1;
            }
        } else {
            if (term.percentage < limit_line_d) { //if the prediction possibility is lower than the limit
                //console.log(term.text + " - Good prediction");
                result_analysis.good = result_analysis.good + 1;
            } else {
                //console.log(term.text + " - Bad prediction");
                result_analysis.bad = result_analysis.bad + 1;
            }
        }
    };

    const result_p = result_analysis.good / (result_analysis.good + result_analysis.bad);
    const test_analysis = homeDict["test_analysis"];
    test_analysis[continuity_id] = result_p;
    homeDict["test_analysis"] = test_analysis;
}