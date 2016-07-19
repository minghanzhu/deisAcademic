import fullCalendar from 'fullcalendar';

Template.calendarTest.onCreated(function(){
	this.calendarDict = new ReactiveDict();
	this.calendarDict.set('courseList', [
		"1163-001651", //COSI 11A, 1163
		"1163-005186", //MATH 10a, 1163
		"1163-005363", //MUS 101A, 1163
	]);
})

Template.calendarTest.onRendered(function(){
	$('#courseList .fluid.ui.button').each(function() {
		// store data so the calendar knows to render an event upon drop
		$(this).data('event', {
			title: $.trim($(this).text()), // use the element's text as the event title
			stick: true // maintain when user navigates (see docs on the renderEvent method)
		});

		// make the event draggable using jQuery UI
		$(this).draggable({
			zIndex: 999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0,  //  original position after the drag
			cancel: false,
			containment: "window"
		});
	});

	$('#calendar').fullCalendar({
        // put your options and callbacks here
        defaultView: 'agendaWeek',
        weekends: false,
        columnFormat: 'dddd', //http://fullcalendar.io/docs/text/columnFormat/
		businessHours: {
			start: '7:00',
			end: '22:30',
			dow: [1, 2, 3, 4, 5]
		}, //http://fullcalendar.io/docs/display/businessHours/
		slotDuration: '00:30:00',
		allDaySlot: false,
		header:false, //http://fullcalendar.io/docs/display/header/
    	minTime: '7:30:00', //http://fullcalendar.io/docs/agenda/minTime/
    	maxTime: '22:30:00', //http://fullcalendar.io/docs/agenda/maxTime/
    	height: 'auto', //http://fullcalendar.io/docs/display/height/
    	contentHeight: 'auto', //http://fullcalendar.io/docs/display/contentHeight/
    	defaultDate: '2000-1-3', //http://fullcalendar.io/docs/current_date/defaultDate/
    	                         //Monday:   2000-1-3
    	                         //Tuesday:  2000-1-4
    	                         //Wednesday:2000-1-5
    	                         //Thursday: 2000-1-6
    	                         //Friday:   2000-1-7
    	editable: true,
		droppable: true, // this allows things to be dropped onto the calendar
		drop: function() {
			// is the "remove after drop" checkbox checked?
			if ($('#drop-remove').is(':checked')) {
				// if so, remove the element from the "Draggable Events" list
				$(this).remove();
			}
		}                         
    })
})

Template.calendarTest.helpers({
	getCourseList: function(){
		return Template.instance().calendarDict.get('courseList');
	},

	getContId: function(courseId){
		return Course.findOne({id: courseId}).continuity_id;
	},

	getCode: function(courseId){
		return Course.findOne({id: courseId}).code;
	},
})

Template.calendarTest.events({
	"click .js-create-event": function(event){
		event.preventDefault();
		const new_event = {

		}
	}
})