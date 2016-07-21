// import { HTTP } from 'meteor/http'

Template.speechTest.helpers({

  getSpeechResults: function(){
    const theSpeechResults = Session.get("speechResults");
    return theSpeechResults;
  },

  getAPIResults: function(){
    const theAPIResults = Session.get("apiResults");
    console.log(theAPIResults);
    return theAPIResults;
  }

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

    // $.get(".config.txt", function(data,status){
    //   console.log(data);
    // });

    // const text = "can i see cosi 11 a";

    const text = Session.get("speechResults");
    console.log(text);

    HTTP.call(
      "POST",
      "https://api.api.ai/v1/query/",
      {headers:
        {"Authorization": "Bearer _______", //API.ai token here (from API.ai account)

        "Content-Type": "application/json; charset=utf-8"},
        data: {"query": text, "lang": "en"}},
        function(error,result){
          console.log(result);
          // var params = result.data.result.parameters;
          // console.log(params);
          // console.log("Params: " + params[0] + params[1]);
          console.log("Intent: " + result.data.result.metadata.intentName);
          Session.set("apiResults", result);
        })
      }
    })
