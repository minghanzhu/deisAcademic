Instructor = new Meteor.Collection("instructor");
Term = new Meteor.Collection("term");
Course = new Meteor.Collection("course");
Section = new Meteor.Collection("section");
Requirement = new Meteor.Collection("requirement");
Subject = new Meteor.Collection("subject");

//these are used to make sure that there's a complete copy of new course data at any time
CourseUpdate1 = new Meteor.Collection("courseUpdate1");
SectionUpdate1 = new Meteor.Collection("sectionUpdate1");
CourseUpdate2 = new Meteor.Collection("courseUpdate2");
SectionUpdate2 = new Meteor.Collection("sectionUpdate2");

Keyword = new Meteor.Collection("keyword");

Dept = new Meteor.Collection("depts");

Major = new Meteor.Collection("major");
Wishlist = new Meteor.Collection("wishlist"); // yuling's collection
Coursehistory = new Meteor.Collection("coursehistory"); // yuling's collection
MajorPlanTest = new Meteor.Collection("majorPlanTest");

UserProfilePnc = new Meteor.Collection("userProfilePnc");//Pnc's test collection
SchedulesPnc = new Meteor.Collection("schedulesPnc");//Pnc's test collection
MajorPlansPnc = new Meteor.Collection("majorPlansPnc");
SearchPnc = new Meteor.Collection("searchPnc");

CoursePrediction = new Meteor.Collection("coursePrediction");

GlobalParameters = new Meteor.Collection("globalParameters");