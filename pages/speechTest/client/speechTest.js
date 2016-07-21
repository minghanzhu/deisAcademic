// import { HTTP } from 'meteor/http'

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
    //
    //
    //     recognition = new webkitSpeechRecognition();
    //
    //     recognition.onstart = function(event) {
    //       respond(messageRecording);
    //       updateRec();
    //     };
    //     recognition.onresult = function(event) {
    //       recognition.onend = null;
    //
    //       var text = "";
    //       for (var i = event.resultIndex; i < event.results.length; ++i) {
    //         text += event.results[i][0].transcript;
    //       }
    //       setInput(text);
    //       stopRecognition();
    //     };
    //     recognition.onend = function() {
    //       respond(messageCouldntHear);
    //       recognition.stop();
    //     };
    //     recognition.lang = "en-US";
    //     recognition.start();
  },
  //
  // "click .js-apiTest": function(){
  //   HTTP.get("https://api.api.ai/v1/query?query=can%20i%20look%20at%20cosi%2011%20a&lang=en&confidence=0.6",
  //   {headers:
  //     {"Authorization": "Bearer ___________"}
  //   },
  //   function(error,result){
  //     console.log(result)
  //     console.log(result.data.result.parameters);
  //     console.log("Intent" + result.data.result.metadata.intentName);
  //   })
  // },

  "click .js-test2": function(){

    // var test22;
    //
    // $.get(".config.txt", function(data,status){
    //   console.log(data);
    //   test22 = data;
    //   console.log(test22);

    // });
    // console.log(key);

    // const text = "can i see cosi 11 a";
    const text = Session.get("speechResults");
    console.log(text);
    const text2 = text.transcript;
    console.log(text);
    // HTTP.post("https://api.api.ai/v1/query/",
    //   {
    //   contentType: "application/json; charset=utf-8",
    //   dataType: "json",
    //   headers: {
    //     "Authorization": "Bearer __________"
    //   },
    // },
    //   JSON.stringify({q: text, lang: "en"}),
    //
    // ),



    HTTP.call(
      "POST",
      "https://api.api.ai/v1/query/",
      {headers:
        {"Authorization": "Bearer ________", //API.ai token here (from API.ai account)

        "Content-Type": "application/json; charset=utf-8"},
        data: {"query": text, "lang": "en"}},
        function(error,result){
          console.log(result);
          var params = result.data.result.parameters;
          console.log(params);
          // console.log("Params: " + params[0] + params[1]);
          console.log("Intent: " + result.data.result.metadata.intentName);
        })
      }
    })
