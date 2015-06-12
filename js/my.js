var speedFactor = 100;

$(document).ready(function () {

    $("#fileData").change(handleFileSelect);

    $("#btnSpeed").click(function () {
        if (this.value == "normal") {
            document.getElementById("vdoMain").playbackRate = 2.0;
            document.getElementById("btnSpeed").value = "fast";
            $(this).text('Speed: Fast');
            speedFactor = 50;
        }
        else if (this.value == "fast") {
            document.getElementById("vdoMain").playbackRate = 1.0;
            document.getElementById("btnSpeed").value = "normal";
            $(this).text('Speed: Normal');
            speedFactor = 100;
        }
    });

    $("#btnPlay").click(function () {
        if (this.value == "play") {
            document.getElementById("vdoMain").play();
            this.value = "pause";
            $(this).find("span").attr("class", "glyphicon glyphicon-pause");
        }
        else if (this.value == "pause") {
            document.getElementById("vdoMain").pause();
            this.value = "play";
            $(this).find("span").attr("class", "glyphicon glyphicon-play");
        }
    });

    //init

    $("#vdoMain").on(
      "play",
      function (event) {

          var timeStamp = csvEngagementData.data[0].time + parseInt(this.currentTime);
          var indexes = $.map(csvEngagementData.data, function (obj, index) {
              if (obj.time == timeStamp) {
                  return index;
              }
          })

          process(indexes[0], false);
          chartEngagement.animation.active = true;
          chartStress.animation.active = true;
      });

    $("#vdoMain").on(
      "pause",
      function (event) {
          window.clearInterval(intervalTrigger);
          var timeStamp = csvEngagementData.data[0].time + parseInt(this.currentTime);

          var indexes = $.map(csvEngagementData.data, function (obj, index) {
              if (obj.time == timeStamp) {
                  return index;
              }
          })

          process(indexes[0], true);
          chartEngagement.animation.active = false;
          chartStress.animation.active = false;
      });

    setInterval(function () {

        var currentTime = $('#containerVideo').find('video').get(0).currentTime;
        var totalDuration = $('#containerVideo').find('video').get(0).duration;

        if (!isNaN(totalDuration)) {
            $('#spnCurrentTime').html(currentTime);
            $('#spnTotalTime').html(totalDuration);

            var currentValue = parseInt(currentTime * 100 / totalDuration)
            $('.progress-bar').css('width', currentValue + '%').attr('aria-valuenow', currentValue);

        }

    }, 500);
});

var csvEngagementData;
var csvStressData;
var chartEngagement;
var chartStress;

var currentEngagementIndex = 0;
var currentStressIndex = 0;

var intervalTrigger;

function handleFileSelect(evt) {
    var engagementFile = evt.target.files[0];
    var stressFile = evt.target.files[1];

    Papa.parse(engagementFile, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            csvEngagementData = results;
            process(0, true);
            chartEngagement.animation.active = true;
        }
    });

    Papa.parse(stressFile, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            csvStressData = results;
            process(0, true);
        }
    });

    $("#vdoMain source").attr('src', "data/" + evt.target.files[2].webkitRelativePath);
    $("#vdoMain").load();
}

function process(startIndex, isPause) {
    var history = [];

    history.push({ values: [] });

    for (i = startIndex; i < startIndex + 60; i++) {
        history[0].values.push(csvEngagementData.data[i]);
    }
    currentEngagementIndex = i;

    if (chartEngagement == undefined) {
        chartEngagement = $('#epochChartEngagement').epoch({
            type: 'time.line',
            data: history,
            axes: ['left', 'right'],
            ticks: { right: 2, left: 2},
            range: [-1.0, 1.0],
            domain: [-1.0, 1.0],
            tickFormats: {
                left: Epoch.Formats.regular,
                right: Epoch.Formats.regular
            },
        });
    }
    else {
        chartEngagement.options.data = history;
    }

    //stress chart
    history = [];

    history.push({ values: [] });

    for (i = startIndex; i < startIndex + 60; i++) {
        history[0].values.push(csvStressData.data[i]);
    }
    currentStressIndex = i;

    if (chartStress == undefined) {
        chartStress = $('#epochChartStress').epoch({
            type: 'time.line',
            data: history,
            axes: ['left', 'right'],
            ticks: { right: 2, left: 2},
            range: [-1.0, 1.0],
            domain: [-1.0, 1.0],
            tickFormats: {
                left: Epoch.Formats.regular,
                right: Epoch.Formats.regular
            }
        });
    }
    else {
        chartStress.options.data = history;
    }

    if (!isPause) {
        intervalTrigger = setInterval(function () {
            chartEngagement.push(nextEngagement());
            currentEngagementIndex++;

            chartStress.push(nextStress());
            currentStressIndex++;
        }, 100);

        chartEngagement.push(nextEngagement());
        currentEngagementIndex++;

        chartStress.push(nextStress());
        currentStressIndex++;
    }
}

function nextEngagement() {
    if (currentEngagementIndex < csvEngagementData.data.length) {
        var entry = [];
        entry.push(csvEngagementData.data[currentEngagementIndex]);
        return entry;
    }
    return;
}

function nextStress() {
    if (currentStressIndex < csvStressData.data.length) {
        var entry = [];
        entry.push(csvStressData.data[currentStressIndex]);
        return entry;
    }
    return;
}