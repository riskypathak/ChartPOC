var speedFactor = 100;
var chartEngagement;
var chartStress;
var mainSlider;
var ourZoom = false;
var otherChartZoom = false;

$(document).ready(function () {

    $("#sliderRange").ionRangeSlider({
        min: 0,
        max: 100,
        type: 'single',
        step: 1,
        postfix: "%",
        prettify: false,
        from: 0,
        onChange: function (data) {
            var totalDuration = $('#containerVideo').find('video').get(0).duration;
            $('#containerVideo').find('video').get(0).currentTime = totalDuration * data.from / 100;
        }
    });


    $("#fileData").change(handleFileSelect);

    $("#btnSpeed").click(function () {
        if (this.value == "normal") {
            document.getElementById("vdoMain").playbackRate = 2.0;
            document.getElementById("btnSpeed").value = "fast";
            $(this).text('Speed: Fast');
        }
        else if (this.value == "fast") {
            document.getElementById("vdoMain").playbackRate = 1.0;
            document.getElementById("btnSpeed").value = "normal";
            $(this).text('Speed: Normal');
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


    

    setInterval(function () {

        var currentTime = $('#containerVideo').find('video').get(0).currentTime;
        var totalDuration = $('#containerVideo').find('video').get(0).duration;

        if (!isNaN(totalDuration) || !$('#containerVideo').find('video').get(0).paused) {
            $('#spnCurrentTime').html(secondsToMinutes(currentTime));
            $('#spnTotalTime').html(secondsToMinutes(totalDuration));

            var currentValue = parseInt(currentTime * 100 / totalDuration);
            mainSlider = $("#sliderRange").data("ionRangeSlider");

            mainSlider.update({
                from: currentValue
            });

            chartEngagement.zoomToIndexes(Math.floor(currentTime) * 10, Math.floor(currentTime + 5) * 10);
            chartStress.zoomToIndexes(Math.floor(currentTime) * 10, Math.floor(currentTime + 5) * 10);
            ourZoom = true;
        }

    }, 500);
});

function secondsToMinutes(time) {
    // Minutes and seconds
    var mins = ~~(time / 60);
    var secs = time % 60;

    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    ret = (mins < 10 ? "0" : "");
    ret += mins.toFixed(0) + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs.toFixed(0);
    return ret;
}

function handleFileSelect(evt) {
    var engagementFile = evt.target.files[0];
    var stressFile = evt.target.files[1];

    Papa.parse(engagementFile, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            var csvEngagementData = [];

            var initialTimeStamp = results.data[0].time;
            results.data.forEach(function (result) {
                var entry = {};
                entry["Time"] = msToTime(result.time - initialTimeStamp);
                entry["Stress"] = result.y;

                csvEngagementData.push(entry);
            });
            processEngagement('epochChartEngagement', csvEngagementData);
        }
    });

    Papa.parse(stressFile, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            var csvStressData = [];

            var initialTimeStamp = results.data[0].time;
            results.data.forEach(function (result) {
                var entry = {};
                entry["Time"] = msToTime(result.time - initialTimeStamp);
                entry["Stress"] = result.y;

                csvStressData.push(entry);
            });
            processStress('epochChartStress', csvStressData);
        }
    });

    $("#vdoMain source").attr('src', "data/" + evt.target.files[2].webkitRelativePath);
    $("#vdoMain").load();
}

function msToTime(duration) {
    //just input is seconds so convert it into miliseconds
    duration = Math.ceil(duration * 1000);

    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + Math.floor(milliseconds);
}

function processEngagement(chartDiv, data) {
    chartEngagement = AmCharts.makeChart(chartDiv,
                    {
                        "type": "serial",
                        "path": "http://www.amcharts.com/lib/3/",
                        "categoryField": "Time",
                        "dataDateFormat": "JJ:NN:SS.QQQ",
                        "maxSelectedTime": 10000,
                        "minSelectedTime": 10000,
                        "zoomOutButtonImageSize": 15,
                        "categoryAxis": {
                            "autoRotateCount": 0,
                            "dateFormats": [
                                {
                                    "period": "fff",
                                    "format": "JJ:NN:SS.QQQ"
                                },
                                {
                                    "period": "ss",
                                    "format": "JJ:NN:SS"
                                },
                                {
                                    "period": "mm",
                                    "format": "JJ:NN"
                                },
                                {
                                    "period": "hh",
                                    "format": "JJ:NN"
                                },
                                {
                                    "period": "DD",
                                    "format": "MMM DD"
                                },
                                {
                                    "period": "WW",
                                    "format": "MMM DD"
                                },
                                {
                                    "period": "MM",
                                    "format": "MMM"
                                },
                                {
                                    "period": "YYYY",
                                    "format": "YYYY"
                                }
                            ],
                            "minPeriod": "ss",
                            "parseDates": true,
                            "position": "top",
                            "gridCount": 2,
                            "labelsEnabled": false,
                            "minVerticalGap": 36,
                            "titleFontSize": 0
                        },
                        "chartCursor": {
                            "bulletsEnabled": true,
                            "bulletSize": 3,
                            "categoryBalloonDateFormat": "JJ:NN:SS",
                            "pan": true,
                            "selectWithoutZooming": true,
                            "valueLineAxis": "stress_axis",
                            "valueLineBalloonEnabled": true
                        },
                        "chartScrollbar": {
                            "autoGridCount": true,
                            "backgroundColor": "#F9F9F9",
                            "color": "#888888",
                            "graph": "stress",
                            "graphFillColor": "#B2D7F9",
                            "graphLineColor": "#3CA2FF",
                            "graphType": "line",
                            "gridColor": "#CFCFCF",
                            "gridCount": 1,
                            "hideResizeGrips": true,
                            "maximum": 1.2,
                            "minimum": -1.2,
                            "offset": 100,
                            "scrollbarHeight": 50,
                            "selectedGraphFillColor": "#319CFF",
                            "selectedGraphLineColor": "#319CFF",
                            "enabled": true
                        },
                        "trendLines": [],
                        "graphs": [
                            {
                                "fillAlphas": 0.4,
                                "id": "stress",
                                "valueField": "Stress"
                            }
                        ],
                        "guides": [],
                        "valueAxes": [
                            {
                                "id": "stress_axis",
                                "maximum": 1.2,
                                "minimum": -1.2,
                                "precision": 1,
                                "strictMinMax": true,
                                "synchronizeWith": "Not set",
                                "dateFormats": [
                                    {
                                        "period": "fff",
                                        "format": "JJ:NN:SS.QQQ"
                                    },
                                    {
                                        "period": "ss",
                                        "format": "JJ:NN:SS"
                                    },
                                    {
                                        "period": "mm",
                                        "format": "JJ:NN"
                                    },
                                    {
                                        "period": "hh",
                                        "format": "JJ:NN"
                                    },
                                    {
                                        "period": "DD",
                                        "format": "MMM DD"
                                    },
                                    {
                                        "period": "WW",
                                        "format": "MMM DD"
                                    },
                                    {
                                        "period": "MM",
                                        "format": "MMM"
                                    },
                                    {
                                        "period": "YYYY",
                                        "format": "YYYY"
                                    }
                                ]
                            }
                        ],
                        "allLabels": [],
                        "balloon": {},
                        "export": {
                            "enabled": true
                        },
                        "titles": [
                            {
                                "id": "Title-1",
                                "size": 15,
                                "text": ""
                            }
                        ],
                        "dataProvider": data,
                    });

    chartEngagement.zoomToIndexes(0, 50);
    chartEngagement.addListener("zoomed", handleZoom);
}

function handleZoom(event) {
    if (ourZoom) {
        ourZoom = false;
    }
    else {
        if (otherChartZoom) {
            otherChartZoom = false;
        }
        else {
            $('#containerVideo').find('video').get(0).currentTime = Math.ceil(event.startIndex / 10);
            otherChartZoom = true;
        }
    }
}

function processStress(chartDiv, data) {
    chartStress = AmCharts.makeChart(chartDiv,
                    {
                        "type": "serial",
                        "path": "http://www.amcharts.com/lib/3/",
                        "categoryField": "Time",
                        "dataDateFormat": "JJ:NN:SS.QQQ",
                        "maxSelectedTime": 10000,
                        "minSelectedTime": 10000,
                        "zoomOutButtonImageSize": 15,
                        "categoryAxis": {
                            "autoRotateCount": 0,
                            "dateFormats": [
                                {
                                    "period": "fff",
                                    "format": "JJ:NN:SS.QQQ"
                                },
                                {
                                    "period": "ss",
                                    "format": "JJ:NN:SS"
                                },
                                {
                                    "period": "mm",
                                    "format": "JJ:NN"
                                },
                                {
                                    "period": "hh",
                                    "format": "JJ:NN"
                                },
                                {
                                    "period": "DD",
                                    "format": "MMM DD"
                                },
                                {
                                    "period": "WW",
                                    "format": "MMM DD"
                                },
                                {
                                    "period": "MM",
                                    "format": "MMM"
                                },
                                {
                                    "period": "YYYY",
                                    "format": "YYYY"
                                }
                            ],
                            "minPeriod": "ss",
                            "parseDates": true,
                            "position": "top",
                            "gridCount": 2,
                            "labelsEnabled": false,
                            "minVerticalGap": 36,
                            "titleFontSize": 0
                        },
                        "chartCursor": {
                            "bulletsEnabled": true,
                            "bulletSize": 3,
                            "categoryBalloonDateFormat": "JJ:NN:SS",
                            "pan": true,
                            "selectWithoutZooming": true,
                            "valueLineAxis": "stress_axis",
                            "valueLineBalloonEnabled": true
                        },
                        "chartScrollbar": {
                            "autoGridCount": true,
                            "backgroundColor": "#F9F9F9",
                            "color": "#888888",
                            "graph": "stress",
                            "graphFillColor": "#B2D7F9",
                            "graphLineColor": "#3CA2FF",
                            "graphType": "line",
                            "gridColor": "#CFCFCF",
                            "gridCount": 1,
                            "hideResizeGrips": true,
                            "maximum": 1.2,
                            "minimum": -1.2,
                            "offset": 100,
                            "scrollbarHeight": 50,
                            "selectedGraphFillColor": "#319CFF",
                            "selectedGraphLineColor": "#319CFF",
                            "enabled": true
                        },
                        "trendLines": [],
                        "graphs": [
                            {
                                "fillAlphas": 0.4,
                                "id": "stress",
                                "valueField": "Stress"
                            }
                        ],
                        "guides": [],
                        "valueAxes": [
                            {
                                "id": "stress_axis",
                                "maximum": 1.2,
                                "minimum": -1.2,
                                "precision": 1,
                                "strictMinMax": true,
                                "synchronizeWith": "Not set",
                                "dateFormats": [
                                    {
                                        "period": "fff",
                                        "format": "JJ:NN:SS.QQQ"
                                    },
                                    {
                                        "period": "ss",
                                        "format": "JJ:NN:SS"
                                    },
                                    {
                                        "period": "mm",
                                        "format": "JJ:NN"
                                    },
                                    {
                                        "period": "hh",
                                        "format": "JJ:NN"
                                    },
                                    {
                                        "period": "DD",
                                        "format": "MMM DD"
                                    },
                                    {
                                        "period": "WW",
                                        "format": "MMM DD"
                                    },
                                    {
                                        "period": "MM",
                                        "format": "MMM"
                                    },
                                    {
                                        "period": "YYYY",
                                        "format": "YYYY"
                                    }
                                ]
                            }
                        ],
                        "allLabels": [],
                        "balloon": {},
                        "export": {
                            "enabled": true
                        },
                        "titles": [
                            {
                                "id": "Title-1",
                                "size": 15,
                                "text": ""
                            }
                        ],
                        "dataProvider": data
                    });

    chartStress.zoomToIndexes(0, 50);
    chartStress.addListener("zoomed", handleZoom);
}