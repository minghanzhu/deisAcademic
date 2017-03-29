Meteor.startup(function() {
    if(SearchPnc.find().count() != 0){
        SearchPnc._ensureIndex({ "instructors": 1}, {background: true});
        SearchPnc._ensureIndex({ "times": 1}, {background: true});
        SearchPnc._ensureIndex({ "id": 1}, {background: true});
        SearchPnc._ensureIndex({ "term": 1}, {background: true});
        SearchPnc._ensureIndex({ "code": 1}, {background: true});
        SearchPnc._ensureIndex({ "name": 1}, {background: true});
        console.log("search index added!")
    }

    Meteor.call("predictionAlgorithm", Meteor.settings.predictionKey);
    Meteor.setInterval(function(){
        Meteor.call("updateJSON", Meteor.settings.updateKey);
    }, 300000);
    
    if(SearchPnc.find().count() != 0) return;
    SearchPnc.remove({});
    const data1 = Course.find().fetch();
    const data2 = Section.find().fetch();
    console.log("Creating search collection...")

    //first insert course
    for (let item of data1) {
        if (1 == 1) {
            SearchPnc.insert(item);
        }
    }

    //then insert section field
    for (let item of data2){
        if (1 == 1) {
            const course_obj = SearchPnc.findOne({id: item.course});
            if(course_obj){
                const course_id = course_obj._id;
                const section_times = item.times;
                const section_ins = item.instructors;

                //first check if this course has a times field
                const hasTime = !!course_obj.times;

                if(hasTime){//if so
                    //check if this section has times
                    if(section_times.length != 0){//if so, add the objects to the times array
                        for(let time of section_times){
                            SearchPnc.update(course_id, {
                                $push: {
                                    times: time
                                }
                            })
                        }
                    }
                } else {//if not, create such field and put the current times into it, if there's any
                    if(section_times.length != 0){
                        SearchPnc.update(course_id, {
                            $set: {
                                times: section_times
                            }
                        })
                    }
                }

                //same for instructor
                const hasIns = !!course_obj.instructors;

                if(hasIns){//if so
                    //check if this section has times
                    if(section_ins.length != 0){//if so, add the objects to the times array
                        for(let ins of section_ins){
                            const ins_obj = Instructor.findOne({id: ins});
                            if(ins.first !== "Staff" && ins.last !== "Staff"){
                                SearchPnc.update(course_id, {
                                    $push: {
                                        instructors: ins
                                    }
                                })
                            }
                        }
                    }
                } else {//if not, create such field and put the current times into it, if there's any
                    if(section_ins.length != 0){
                        for(let ins of section_ins){
                            const ins_obj = Instructor.findOne({id: ins});
                            if(ins.first !== "Staff" && ins.last !== "Staff"){
                                SearchPnc.update(course_id, {$set:{instructors:[]}});
                                SearchPnc.update(course_id, {
                                    $push: {
                                        instructors: ins
                                    }
                                })
                            }
                        }
                    }
                }
            } else {
                console.log(item + "has a course id not in database");
            }
        }
    }

    console.log("Done!");
})
