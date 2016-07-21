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


Template.history.onRendered(function(){
	$('#search-select-semester').dropdown();
	$('#search-select-coursenum').dropdown();
  $('#search-select-grade').dropdown();
  const coursenum = $("#search-select-coursenum input").val();

})

Template.history.helpers({
  	coursehistory:function(){return Coursehistory.find({});},
})

Template.history.events({
  "click .js-add": function(){
    event.preventDefault();
    const objsemester = $(".js-semester").val();
    const objcoursenum = $(".js-coursenum").val();
    const objgrade = $(".js-grade").val();
    const obj = {semester: objsemester, coursenum: objcoursenum, grade:objgrade,};
    Coursehistory.insert(obj);
  },
})
