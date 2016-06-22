import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  // check to see if the collections are empty
  // if so, read the classes.json file and
  // create the new collections
  if (Instructor.find().count()>0) return;
  const fs = Npm.require('fs');
  console.log("reading data");
  fs.readFile(
  '/Users/tim/Desktop/cs152aj/deisAcademic/public/data/classes.json', 'utf8',
    Meteor.bindEnvironment(function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        console.log('parsing data');
        console.log(data.length);
        data = JSON.parse(data);
  //      console.log(data);
        console.log('read data');
        console.log(data.length);
        let i=0;
        for (i=0;i<data.length;i++){
          const d = data[i];
          console.dir(d);
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
    }));
});
