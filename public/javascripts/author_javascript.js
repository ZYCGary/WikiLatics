/** reset DOM of results */
function resetAuthorDOM() {
    $('#author-title').empty();
    $('#table-1-tbody').empty();
    $('#table-2-tbody').empty();
}


/** hide DOM of results, ready to show show results */
function hideAuthorDOM() {
    $('#author-msg').hide();
    $('#author-result').hide();
}


/** show search results */
function showAuthorResult(data) {
    $('#author-result').show();
    let resultWithContribution = data.resultWithContribution,
        resultWithTimestamp = data.resultWithTimestamp,
        html1 = '',
        html2 = '';

    // build table-1
    resultWithContribution.forEach((article) => {
        html1 += '<tr>' +
            '<td>' + article._id.title + '</td>' +
            '<td>' + article.revCount + '</td>' +
            '<td>' + article._id.user + '</td>' +
            '</tr>'
    });
    $('#table-1-tbody').html(html1);

    // build table-2
    resultWithTimestamp.forEach((article) => {
        html2 += '<tr>' +
            '<td>' + article.title + '</td>' +
            '<td>' + article.revid + '</td>' +
            '<td>' + article.user + '</td>' +
            '<td>' + article.timestamp + '</td>' +
            '</tr>'
    });
    $('#table-2-tbody').html(html2);
}

$(document).ready(() => {
    hideAuthorDOM();

    /** switch between tables */
    let flag = 1;
    $('#author-switch-btn').click(() => {
        if (flag === 1) {
            $('#table-1').hide();
            $('#table-2').show();
            $('#author-switch-btn').text('Hide Timestamp')
            flag = 2;
        } else {
            $('#table-1').show();
            $('#table-2').hide();
            $('#author-switch-btn').text('Show Timestamp')
            flag = 1;
        }
    });

    /** an Ajax request for individual analytics */
    $('#author-search-btn').click(() => {
        let authorName = $('#author').val();

        $.post('/author/analytic', {author: authorName}, (rdata) => {
            resetAuthorDOM();
            hideAuthorDOM();

            if (rdata.error) {
                $('#author-msg').text(rdata.error).show();
            } else {
                showAuthorResult(rdata);
            }
        })
    })
});