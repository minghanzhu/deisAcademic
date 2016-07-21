Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{name: 'home'});
Router.route('/schedule',{name: 'schedule'});
Router.route('/majorPlan',{name: 'majorPlan'});
Router.route('/myProfile',{name: 'myProfile'});
// Router.route('skelSched2', {name: 'skelSched2'});
Router.route('speechTest', {name: 'speechTest'});
Router.route('/skeletonSchedule', {name: 'skeletonSchedule'});
Router.route('ct', {name: 'calendarTest'});
Router.route('/decidemajor', {name: 'decidemajor'});
Router.route('/majorSelect', {name: 'majorSelect'});
