'use strict';

/*
Put any interaction code here
 */

window.addEventListener('load', function() {
    // You should wire up all of your event handling code here, as well as any
    // code that initiates calls to manipulate the DOM (as opposed to responding
    // to events)

    // Create our models
    var activityStoreModel = new ActivityStoreModel();
    var graphModel = new GraphModel();

    // Create our views
    var lastEntryView = new LastEntryView(activityStoreModel);
    var timeTableView = new TimeTableView(document.getElementById("time_table"), activityStoreModel);
    var healthMetricsTableView = new HealthMetricsTableView(document.getElementById("health_metrics_table"), activityStoreModel);
    var healthGraphView = new HealthGraphView(document.getElementById("health_graph"), activityStoreModel);
    var healthMetricsTab = new HealthMetricsTab(document.getElementById("health_metrics_graph_tab"), graphModel);
    var minutesSpentTab = new MinutesSpentTab(document.getElementById("minutes_spent_table_tab"), graphModel);
    var healthMetricsTableTab = new HealthMetricsTableTab(document.getElementById("health_metrics_table_tab"), graphModel);

    // For later use
    var nav = document.getElementById("nav");
    var pageContainer = document.getElementById("page_container");

    // Add input nav link click listener
    var input_link = document.getElementById("input_link");
    input_link.addEventListener('click', function(event) {
        event.preventDefault();
        // Make currently active link inactive
        nav.getElementsByClassName("active")[0].classList.remove("active");
        // Make input link active
        input_link.parentNode.classList.add("active");
        // Hide visible page
        pageContainer.getElementsByClassName("show")[0].classList.remove("show");
        // Show input page
        document.getElementById("input_div").classList.add("show");
    });

    // Add analysis nav link click listener
    var analysis_link = document.getElementById("analysis_link");
    analysis_link.addEventListener('click', function(event) {
        event.preventDefault();
        // Make currently active link inactive
        nav.getElementsByClassName("active")[0].classList.remove("active");
        // Make analysis link active
        analysis_link.parentNode.classList.add("active");
        // Hide visible page
        pageContainer.getElementsByClassName("show")[0].classList.remove("show");
        // Show analysis page
        document.getElementById("analysis_div").classList.add("show");
    });

    // Form submit event
    var activityDataForm = document.getElementById("activity_data_form");
    activityDataForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var activity = document.getElementById("activity").value;

        // Form does extensive validation, so we should be able to safely parse these to numbers.
        var energyLevel = parseInt(document.getElementById("energy_level").value);
        var stressLevel = parseInt(document.getElementById("stress_level").value);
        var happinessLevel = parseInt(document.getElementById("happiness_level").value);
        var minutesSpent = parseInt(document.getElementById("minutes_spent").value);

        // Add to activity store model
        activityStoreModel.addActivityDataPoint(new ActivityData(
            activity,
            {"energyLevel": energyLevel,
             "stressLevel": stressLevel,
             "happinessLevel": happinessLevel},
            minutesSpent
        ));

        // We don't reset the form because specs say,
        // "As you can see in the mock-up, users can also view the last time they entered a data point, and what that data point was."
    });

    // Minutes spent tab event wire-up
    var minutesSpentTab = document.getElementById("minutes_spent_table_tab");
    minutesSpentTab.addEventListener('click', function(event) {
        event.preventDefault();
        graphModel.selectGraph("TimeTable");
    });

    // Health metrics table tab event wire-up
    var healthMetricsTableTab = document.getElementById("health_metrics_table_tab");
    healthMetricsTableTab.addEventListener('click', function(event) {
        event.preventDefault();
        graphModel.selectGraph("HealthMetricsTable");
    });

    // Health metrics graph tab event wire-up
    var healthMetricsGraph = document.getElementById("health_metrics_graph_tab");
    healthMetricsGraph.addEventListener('click', function(event) {
        event.preventDefault();
        graphModel.selectGraph("AverageHealthMetricsGraph");
    });

    // Start hook up health metric graph customization code
    var toggleEnergy = document.getElementById("avg_energy_toggle");
    toggleEnergy.addEventListener('click', function(event) {
        healthGraphView.repaint(document.getElementById("avg_energy_toggle").checked, document.getElementById("avg_stress_toggle").checked,
                document.getElementById("avg_happiness_toggle").checked);
    });

    var toggleStress = document.getElementById("avg_stress_toggle");
    toggleStress.addEventListener('click', function(event) {
        healthGraphView.repaint(document.getElementById("avg_energy_toggle").checked, document.getElementById("avg_stress_toggle").checked,
            document.getElementById("avg_happiness_toggle").checked);
    });

    var toggleHappiness = document.getElementById("avg_happiness_toggle");
    toggleHappiness.addEventListener('click', function(event) {
        healthGraphView.repaint(document.getElementById("avg_energy_toggle").checked, document.getElementById("avg_stress_toggle").checked,
            document.getElementById("avg_happiness_toggle").checked);
    });
    // End hook up health metric graph customization code

    generateFakeData(activityStoreModel, 100);
});