Meteor.startup(function(){
  Keyword.remove({});
  /*
  Instructor.remove({});
  Term.remove({});
  Course.remove({});
  Section.remove({});
  Requirement.remove({});
  Subject.remove({}); 
  
  if (Instructor.find().count()>0) return;
  const fs = Npm.require('fs');
  fs.readFile(
  "D:\\Luyi's\\JBS2016\\deisAcademic\\public\\data\\classes.json", 'utf8',
    Meteor.bindEnvironment(function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        data = JSON.parse(data);
        let i=0;
        for (i=0;i<data.length;i++){
          const d = data[i];
          if (d.type=="instructor") {
            Instructor.insert(d);
          }else if (d.type=="requirement"){
            Requirement.insert(d);
          }else if (d.type=="term"){
            Term.insert(d);
          }else if (d.type=="subject"){
            Subject.insert(d);
          }else if (d.type=="course"){
            Course.insert(d);
          }else if (d.type=="section"){
            Section.insert(d);
          }else {
            console.log("don't recognize data ");
            console.log(d.type);
          }
        }
    }));*/
})