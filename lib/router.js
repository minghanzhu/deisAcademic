Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{name: 'home'});
Router.route('/schedule',{name: 'schedule'});
Router.route('/majorPlan',{name: 'majorPlan'});
Router.route('/myProfile',{name: 'myProfile'});
Router.route('speechTest', {name: 'speechTest'});
Router.route('ct', {name: 'calendarTest'});
Router.route('/decidemajor', {name: 'decidemajor'});
Router.route('/skelSched', {name: 'skelSched'});
Router.route('/majorList', {name: 'majorList'});
Router.route('/majorSelect', {name: 'majorSelect'});
Router.route('/masterMajorPlan', {name: 'masterMajorPlan'});
