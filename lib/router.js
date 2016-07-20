Router.configure({
	layoutTemplate: 'layout',
});

Router.route('/',{name: 'home'});
Router.route('/schedule',{name: 'schedule'});
Router.route('/majorPlan',{name: 'majorPlan'});
Router.route('/myProfile',{name: 'myProfile'});
Router.route('skelSched2', {name: 'skelSched2'});
Router.route('speechTest', {name: 'speechTest'});
