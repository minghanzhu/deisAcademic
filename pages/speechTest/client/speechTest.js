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
