Template.myProfile.onCreated(function(){
	this.myPageDict = new ReactiveDict();
	this.myPageDict.set('pageName', "");
	console.log(Template.instance().myPageDict.get('pageName'));
})


Template.myProfile.helpers({
  seeWishlist: function(){
		return Template.instance().myPageDict.get('pageName')=="wishlist";
	},

  seeHistory: function(){
    return Template.instance().myPageDict.get('pageName')=="history";
  },
})


Template.myProfile.events({
  "click .js-wishlist": function(event, template){
    event.preventDefault();
		console.log(Template.instance().myPageDict.get('pageName'));
    template.myPageDict.set('pageName', "wishlist");
  },

  "click .js-history": function(event, template){
    event.preventDefault();
		console.log(Template.instance().myPageDict.get('pageName'));
    template.myPageDict.set('pageName', "history");
  },
})





Template.wishlist.helpers({
	wishlist:function(){return Wishlist.find({});},
})

Template.history.helpers({
	coursehistory:function(){return Coursehistory.find({});},
})

Template.history.events({
  "click .js-submit":function(event){
    event.preventDefault();
		const objsemester = $(".js-semester").val();
    const objnumber1 = $(".js-number1").val();
		const objnumber2 = $(".js-number2").val();
		const objnumber3 = $(".js-number3").val();
		const objnumber4 = $(".js-number4").val();
    const objgrade1 = $(".js-grade1").val();
		const objgrade2 = $(".js-grade2").val();
		const objgrade3 = $(".js-grade3").val();
		const objgrade4 = $(".js-grade4").val();
    const obj1 = {semester: objsemester, number: objnumber1, grade:objgrade1,};
		const obj2 = {semester: objsemester, number: objnumber2, grade:objgrade2,};
		const obj3 = {semester: objsemester, number: objnumber3, grade:objgrade3,};
		const obj4 = {semester: objsemester, number: objnumber4, grade:objgrade4,};
		Coursehistory.insert(obj1);
		Coursehistory.insert(obj2);
		Coursehistory.insert(obj3);
		Coursehistory.insert(obj4);

    // Meteor.call("inserthistory", obj);
		// inserthistory: function(obj){
		// 	Coursehistory.insert(obj);
		// 	console.dir(obj);
		// },
  },

})
