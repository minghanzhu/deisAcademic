robDict = new ReactiveDict();

Template.speechTest.helpers({

  getSpeechResults: function(){
    const theSpeechResults = robDict.get("speechResults");
    return theSpeechResults;
  },

  getAPIResults: function(){
    const theAPIResults = robDict.get("apiResults");
    // console.log(theAPIResults);
    return theAPIResults;
  },

  getSearchResults: function(){
    const apiRes = robDict.get("apiResults");

    if (apiRes) {
      const dept = apiRes.data.result.parameters.Department;
      const courseNum = apiRes.data.result.parameters.CourseNumber;
      // const courseCod = apiRes.data.result.parameters.CourseCode;

      var term;

      if (apiRes.data.result.parameters.Terms) {

        const termString = apiRes.data.result.parameters.Terms;

        switch (termString) {
          case "Fall 2016":
          term = 1163;
          break;
          case "Fall 2015":
          term = 1153;
          break;
          case "Spring 2016":
          term = 1161;
          break;
          case "Spring 2017":
          term = 1171;
          break;
          case "Summer 2016":
          term = 1162;
          break;
        }

      }
      else {
        term = "";
      }

      const theResults = dept + " " + courseNum;
      // console.log(theResults);

      Meteor.call("searchCourse", theResults, term, [], null, null, {days:[],start:"",end:""}, false, false, function(error,result) {
        console.log("searchRes: " + result);
        robDict.set("theSearchResults", result);
      })

      return robDict.get("theSearchResults");
    }
  },
})

Template.speechTest.events({

  "click .js-speech": function(){

    var recognition = new webkitSpeechRecognition();
    recognition.onresult = function(event) {
      // console.log(event)
      // console.log(event.results[0][0].confidence)
      // console.log(event.results[0][0].transcript)

      robDict.set("speechResults", event.results[0][0].transcript);
    }
    recognition.start();

  },

  "click .js-apiSubmit": function(){

    const text = robDict.get("speechResults");
    console.log(text);

    Meteor.call("sendJSONtoAPI_ai", text, {returnStubValue: true}, function(error,result){
      if(error){
        console.log(error)
      }
      console.log(result);
      robDict.set("apiResults", result);
    })
  },

  "click .js-allInOneSearch": function(){
    var recognition = new webkitSpeechRecognition();
    recognition.onresult = function(event) {
      // console.log(event)
      // console.log(event.results[0][0].confidence)
      // console.log(event.results[0][0].transcript)

      robDict.set("speechResults", event.results[0][0].transcript);

      const text = robDict.get("speechResults");
      console.log(text);

      Meteor.call("sendJSONtoAPI_ai", text, {returnStubValue: true}, function(error,result){
        if(error){
          console.log(error)
        }
        console.log(result);
        robDict.set("apiResults", result);
      })
    }
    recognition.start();
  }
})
