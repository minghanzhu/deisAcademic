robDict = new ReactiveDict();

Template.speechTest.helpers({

  getSpeechResults: function(){
    const theSpeechResults = Session.get("speechResults");
    return theSpeechResults;
  },

  getAPIResults: function(){
    const theAPIResults = Session.get("apiResults");
    // console.log(theAPIResults);
    return theAPIResults;
  },

  getSearchResults: function(){
    const apiRes = Session.get("apiResults");

    if (apiRes) {
      const dept = apiRes.data.result.parameters.Department;
      const courseNum = apiRes.data.result.parameters.CourseNumber;

      const theResults = dept + " " + courseNum;
      console.log(theResults);

      Meteor.call("searchCourse", theResults, "", [], null, null, {days:[],start:"",end:""}, false, false, function(error,result) {
        console.log(result);
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
      console.log(event)
      console.log(event.results[0][0].confidence)
      console.log(event.results[0][0].transcript)

      Session.set("speechResults", event.results[0][0].transcript);
    }
    recognition.start();

  },

  "click .js-apiSubmit": function(){

    const text = Session.get("speechResults");
    console.log(text);

    Meteor.call("sendJSONtoAPI_ai", text, {returnStubValue: true}, function(error,result){
      if(error){
        console.log(error)
      }
      console.log(result);
      Session.set("apiResults", result);
    })
  },
})
