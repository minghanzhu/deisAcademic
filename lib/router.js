Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{name: 'home'});
Router.route('/schedule',{name: 'schedule'});
Router.route('/majorPlan',{name: 'majorPlan'});
Router.route('/myProfile',{name: 'myProfile'});
Router.route('/skelSched', {name: 'skelSched'});
Router.route('ct', {name: 'calendarTest'});