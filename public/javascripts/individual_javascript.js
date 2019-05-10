/** reset DOM of results */
function resetIndividualDOM() {
    $('#individual-article-title').empty();
    $('#individual-revision-count').empty();
    $('#individual-tbody').empty();

    // clear canvas
    $('#chart-one').html('<canvas id="chart-1"></canvas>');
    $('#chart-two').html('<canvas id="chart-2"></canvas>');
    $('#chart-three').html('<canvas id="chart-3"></canvas>');
}

/** hide DOM of results, ready to show show results */
function hideIndividualDOM() {
    $('#individual-msg-err').hide();
    $('#individual-msg-suc').hide();
    $('#individual-result').hide();
    $('#individual-charts').hide();
}


/** show search results */
function showIndividualResult(data) {
    $('#individual-msg-suc').text(data.success).show();
    $('#individual-result').show();
    $('#individual-article-title').text('Article Title:' + data.articleTitle);
    $('#individual-revision-count').text('Num of reversion:' + data.revCount);
    let regularUsers = data.topFiveRegularUsers,
        html = '';
    if (regularUsers) {
        regularUsers.forEach((user) => {
            html += '<tr>' +
                '<td>' + user.editor + '</td>' +
                '<td>' + user.revs.length + '</td>' +
                '</tr>'
        });
    }
    $('#individual-tbody').html(html);
}


/** show three charts */
function drawCharts(data) {
    $('#individual-charts').show();
    $('#chart-3').show();
    $('#chart-3-tab').show();
    let data1 = data.chartOne,
        data2 = data.chartTwo,
        data3 = data.chartThree;
    let chartOne = new Chart($('#chart-1'), data1);
    let chartTwo = new Chart($('#chart-2'), data2);
    if (data3) {
        let chartThree = new Chart($('#chart-3'), data3);
    } else {
        $('#chart-3').hide();
        $('#chart-3-tab').hide();
    }
}


$(document).ready(() => {
    hideIndividualDOM();

    // an Ajax request for individual analytics
    $('#article-search-btn').click(() => {
        let articleTitle = $('#article-title').val();

        $.post(url + '/individual/analytic', {title: articleTitle}, (rdata) => {
            resetIndividualDOM();
            hideIndividualDOM();
            if (rdata.error === 'Cannot find this article!') {
                $('#individual-msg-err').text(rdata.error).show();
            } else {
                if (rdata.error === 'Cannot find any regular user.') {
                    $('#individual-msg-err').text(rdata.error).attr('class', 'err').show();
                }
                showIndividualResult(rdata);
                drawCharts(rdata);
            }
        });
    });
});
