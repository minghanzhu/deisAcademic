Template.majorPlan.onCreated(function() {
    this.masterDict = this.data["dict"];

    const dict = this.masterDict;

    if (!dict.get("Major_info_list")) {
        const major_info_list = [];

        for (let major_id of dict.get("chosenMajor")) {
            //get the bulletin page for the major
            Meteor.call("getMajorInfo", major_id, function(err, result) {
                if (!err) {
                    const major_obj = {};
                    const major_name = $(result.content).find("#breadcrumbs a:last-child").html();
                    major_obj.name = major_name;
                    major_obj.sections = [];

                    const section_list = $(result.content).find("#contentText div[class=\"section \"]");
                    for (let section of section_list) {
                        const section_name = $(section).find(".sectionTitle h3").html();
                        const section_content = $(section).find(".sectionContent").html();
                        const section_obj = {
                            section_title: section_name,
                            content: section_content
                        }
                        major_obj.sections.push(section_obj);
                    }

                    if (!dict.get("Major_info_list")) {
                        dict.set("Major_info_list", [major_obj]);
                    } else {
                        const old_array = dict.get("Major_info_list");
                        old_array.push(major_obj);
                        dict.set("Major_info_list", old_array);
                    }
                }
            });
        }
    }
})

Template.majorPlan.helpers({
    majors: function() {
        const dict = Template.instance().masterDict;
        return dict.get("Major_info_list");
    },

    dataReady: function() {
        const dict = Template.instance().masterDict;

        if (!dict.get("Major_info_list")) {
            return false;
        } else {
            return dict.get("Major_info_list").length === dict.get("chosenMajor").length;
        }
    },
});

Template.majorPlan.events({
    "click #major_info ul li a": function() {
        setInterval(function() {
            const sticky_height = $("#planSearch_result").height();
            const target_height = $("#major_info").height();
            if (sticky_height < target_height) {
                $('#planSearch_result').sticky({
                    context: '#major_info',
                    observeChanges: true
                });
            } else {
                $('#planSearch_result').sticky({
                    context: false,
                    observeChanges: true
                });
            }
        }, 350);
    }
})

Template.majorItem.helpers({
    trim: function(a, b) {
        return (a.replace(/ /ig, "") + b.replace(/ /ig, "")).replace(/[^A-Za-z0-9]/ig, '');
    },
})
