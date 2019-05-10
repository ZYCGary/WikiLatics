let backgroundColors = [
    'rgba(255,99,132,1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
];

module.exports = function (groupData, chartTitle, callback) {
    let pieChartData = {
        type: 'pie',
        data: {
            datasets: [{
                data: [],
                backgroundColor: [],
                label: 'dataset 1'
            }],
            labels: []
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: chartTitle
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    let datasets = pieChartData.data.datasets[0],
        labels = pieChartData.data.labels;

    // console.log(groupData)
    for (let index in groupData) {
        datasets.data.push(groupData[index].revs.length);
        datasets.backgroundColor.push(backgroundColors[index]);
        labels.push(groupData[index].editor);
    }

    callback(pieChartData);
};