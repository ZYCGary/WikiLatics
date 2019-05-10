let url = 'http://localhost:3000';

let buildTbody = (tdata) => {
    let html = '',
        i = 1;

    for (data of tdata) {
        html += '<tr>' +
            '<td>' + i + '</td>' +
            '<td>' + data.title + '</td>' +
            '<td>' + data.revCount + '</td>' +
            '</tr>';
        i++;
    }

    return html;
};


$(document).ready(() => {
    /** draw charts (bar & pie) */
    $.getJSON('/overall/chartdata', null, function (rdata) {
        let barData = rdata[0],
            pieData = rdata[1];
        let $barChart = $('#overall-barChart'),
            $pieChart = $('#overall-pieChart');

        $('#loading-msg').remove();
        let barChart = new Chart($barChart, barData);
        let pieChart = new Chart($pieChart, pieData);
        $pieChart.hide();
    });

    /** switch between two charts */
    let flag = 1;
    $('#overall-switch-btn').click(() => {
        if (flag === 1) {
            console.log(flag);
            $('#overall-barChart').hide();
            $('#overall-pieChart').show();
            flag = 2;
        } else {
            console.log(flag);
            $('#overall-barChart').show();
            $('#overall-pieChart').hide();
            flag = 1;
        }
    });

    /** revision rank search **/
    let $rankSearchBtn = $('#rank-search-btn');

    $rankSearchBtn.click(() => {
        let $rank = $('#rank').val(),
            $maxRevTh = $('#maxRev-th'),
            $minRevTh = $('#minRev-th'),
            $maxRevTbody = $('#maxRev-tbody'),
            $minRevTbody = $('#minRev-tbody');

        $.post(url + '/overall/revrank', {rank: $rank}, (data) => {
            let rank = data.rank,
                maxRev = data.rankByRev.maxRev,
                minRev = data.rankByRev.minRev;

            $maxRevTh.text('Top ' + rank + ' Articles With Most Number Of Reversions');
            $minRevTh.text('Top ' + rank + ' Articles With Lest Number Of Reversions');
            $maxRevTbody.html(buildTbody(maxRev));
            $minRevTbody.html(buildTbody(minRev));
        });
    });
});