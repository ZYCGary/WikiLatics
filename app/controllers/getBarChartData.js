let backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ],
    borderColors = [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];


/** this function is used to reform the labels of the charts data */
let fixLabels = function (labels) {
    labels = labels.sort();

    // fix labels: add missing years
    let oldest = Number(labels[0]);
    let latest = Number(labels.reverse()[0]);
    if (oldest === latest) {
        labels = [oldest.toString()];
    } else {
        labels = [];
        while (oldest <= latest) {
            labels.push(oldest.toString());
            oldest++;
        }
    }
    return labels;
};


module.exports = function (groupData, chartTitle, callback) {
    let barChartData = {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            title: {
                display: true,
                text: chartTitle
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };

    // get labels (years)
    groupData.forEach(function (editor) {
        editor.revs.forEach(function (rev) {
            rev.timestamp = rev.timestamp.slice(0, 4);
            // console.log(rev.timestamp);
            if (barChartData.data.labels.indexOf(rev.timestamp) === -1) {
                barChartData.data.labels.push(rev.timestamp);
            }
        });
    });

    // fix labels: sort and add missing years
    barChartData.data.labels = fixLabels(barChartData.data.labels);

    // get datasets of barChartData
    groupData.forEach(function (editor) {
        // init this editor's data
        let chartDataset = {
            label: editor.editor,
            backgroundColor: '',
            borderColor: '',
            borderWidth: 1,
            data: new Array(barChartData.data.labels.length + 1).join(0).split('')
        };

        // count the number of reversions by year
        editor.revs.forEach(function (rev) {
            let indexOfYear = barChartData.data.labels.indexOf(rev.timestamp);
            if (indexOfYear >= 0) {
                chartDataset.data[indexOfYear]++;
            }
            // console.log(indexOfYear)
        });

        // console.log(chartDataset.data);
        barChartData.data.datasets.push(chartDataset);
    });

    // dye chart data
    for (let index in barChartData.data.datasets) {
        barChartData.data.datasets[index].backgroundColor = backgroundColors[index];
        barChartData.data.datasets[index].borderColor = borderColors[index];
    }

    // console.log(barChartData);
    callback(barChartData);
};