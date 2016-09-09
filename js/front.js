/**
 * Use to control elements of datepicker for highlighter
 * @date 8/25/2016
 * @author Nasir Mehmood <oknasir@gmail.com>
 */

Date.prototype.getUTCTime = function(){
    return new Date(
        this.getUTCFullYear(),
        this.getUTCMonth(),
        this.getUTCDate(),
        this.getUTCHours(),
        this.getUTCMinutes(),
        this.getUTCSeconds()
    ).getTime();
};

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// validate a date
var $validateDate = function (date) {
    return !isNaN(new Date(date.replace(/-/g, '/')).getDate());
};

// get payroll pending date
var $getPayrollEndDate = function (startdate, date) {

    var parts = date.split('-');
    parts[1] -= 1;
    var payrollDate = new Date(Date.UTC.apply(undefined, parts));
    parts = startdate.split('-');
    parts[1] -= 1;
    var timestamp = new Date(Date.UTC.apply(undefined, parts));

    timestamp.setUTCDate(timestamp.getUTCDate() - (Math.ceil(((parseInt((timestamp.getUTCTime() - payrollDate.getUTCTime()) / 1000)) / 3600) / 24) % 14));

    var ppStart = timestamp.getUTCTime();
    timestamp.setUTCDate(timestamp.getUTCDate() + 13);

    return [new Date(ppStart), new Date(timestamp.getUTCTime())];
};

// activate highlighter of datepicker for highlight-picker
var $dateHighlightRange = function ($this, style) {

    if (typeof style == 'undefined') style = 'active';

    var atd = $this.picker.find('.datepicker-days tbody tr td.' + style);
    var dates = $this.picker.find('.datepicker-days thead .datepicker-switch').html().split(' ');

    $this.picker.find('.datepicker-days tbody').data('year', dates[1]).data('month', (months.indexOf(dates[0]) + 1).toString()).data('highlight', $this.inputField.data('highlight'));

    $this.picker.addClass('highlight-picker');

    if (atd.length && atd.hasClass(style))
        highlightRows($this.inputField.data('highlight'), atd);
};

// highlight dates for input of highlight-picker
var highlightRows = function (range, dateE) {

    var trs = dateE.parent().parent().children();
    var atr = dateE.parent().index();

    if ($validateDate(range)) {

        var active = dateE.parent().parent().data('active');
        var startDate = dateE.parent().parent().data('year').toString();

        startDate += '-';
        if (dateE.hasClass('new'))
            startDate += (parseInt(dateE.parent().parent().data('month')) + 1).toString();
        else if (dateE.hasClass('old'))
            startDate += (dateE.parent().parent().data('month') - 1).toString();
        else
            startDate += dateE.parent().parent().data('month').toString();

        startDate += '-';
        startDate += dateE.html();

        var ppDates = $getPayrollEndDate(startDate, range);
        var rangeDate = new Date(startDate.replace(/-/g, '/'));

        var ppStartDate = ppDates[0];
        var ppEndDate = ppDates[1];

        var rangeDay = [ppStartDate.getDate(), ppEndDate.getDate()];
        var oldM = '';
        var newM = '';

        if (ppStartDate.getMonth() < rangeDate.getMonth() || ppStartDate.getFullYear() < rangeDate.getFullYear()) {
            rangeDay = [1, ppEndDate.getDate()];
            oldM = ppStartDate.getDate();
        } else if (rangeDate.getMonth() < ppEndDate.getMonth() || rangeDate.getFullYear() < ppEndDate.getFullYear()) {
            rangeDay = [ppStartDate.getDate(), ppEndDate.getDate() + 30];
            newM = ppEndDate.getDate();
        }

        if (dateE.hasClass('new')) {
            oldM = '';
            rangeDay = [ppStartDate.getDate(), ppEndDate.getDate() + 30];
            newM = ppEndDate.getDate();
        }
        else if (dateE.hasClass('old')) {
            rangeDay = [1, ppEndDate.getDate()];
            oldM = ppStartDate.getDate();
            newM = '';
        }

        trs.each(function (i, tr) {
            $(tr).children('td').each(function (j, td) {
                var $td = $(td);
                if ($td.hasClass('old')) {
                    if (oldM && parseInt($td.html()) >= oldM) {
                        $td.addClass('highlight');
                    }
                }
                else if ($td.hasClass('new')) {
                    if (newM && parseInt($td.html()) <= newM) {
                        $td.addClass('highlight');
                    }
                }
                else if (!$td.hasClass('old') && !$td.hasClass('new')) {
                    if (parseInt($td.html()) >= rangeDay[0] && parseInt($td.html()) <= rangeDay[1]) {
                        $td.addClass('highlight');
                    }
                }
            });
        });

        return true;
    }

    var crt = range.substr(range.length - 1);
    var cr = range.slice(0, -1);

    if (atr !== -1 && crt == 'w' && cr == '1')
        $(trs[atr]).addClass('active');
    else if (atr !== -1 && crt == 'm' && cr == '1/2') {
        var first = false;
        var trigger = [16, 30];
        trs.each(function (i, tr) {
            $(tr).children('td').each(function (j, td) {
                var $td = $(td);
                if (dateE.html() < 16 && $td.html() < 16)
                    first = true;
                if (!$td.hasClass('old') && !$td.hasClass('new'))
                    trigger[1] = parseInt($td.html());
            });
        });
        if (first)
            trigger = [1, 15];
        trs.each(function (i, tr) {
            $(tr).children('td').each(function (j, td) {
                var $td = $(td);
                if (!$td.hasClass('old') && !$td.hasClass('new') && $td.html() >= trigger[0] && $td.html() <= trigger[1])
                    $td.addClass('highlight');
            });
        });
    }
    else if (atr !== -1 && crt == 'm' && cr == '1') {
        trs.each(function (i, tr) {
            $(tr).children('td').each(function (j, td) {
                var $td = $(td);
                if (!$td.hasClass('old') && !$td.hasClass('new'))
                    $td.addClass('highlight');
            });
        });
    }
};

// trigger for highlight-picker on hover dates
$('body')
    .on('mouseenter', '.highlight-picker .datepicker-days tbody tr td', function () {
        var $this = $(this);
        var range = $this.parent().parent().data('highlight');
        if (range == '1w') {
            $this.parent().parent().children().removeClass('active');
            $this.parent().addClass('active');
            return false;
        }
        var lastR = range.substr(range.length - 1);
        if ($this.hasClass('old') || $this.hasClass('new'))
            $this = $this.parent().parent().find('td.active');
        if ($this.length && !$this.hasClass('highlight') && lastR == 'm') {
            $this.parent().parent().find('td').removeClass('highlight');
            highlightRows(range, $this);
        }
        else if ($this.length && $validateDate(range)) {
            $this.parent().parent().find('td').removeClass('highlight');
            highlightRows(range, $this);
        }
    })
    .on('mouseleave', '.highlight-picker .datepicker-days tbody', function () {
        var atd = $(this).find('td.active');
        if (atd.length == 0) {
            $(this).find('tr').removeClass('active');
            $(this).find('td').removeClass('highlight');
            return false;
        }
        var range = atd.parent().parent().data('highlight');
        if (atd.hasClass('active') && (range == '1w' || $validateDate(range))) {
            atd.parent().parent().children().removeClass('active');
            atd.parent().parent().find('td').removeClass('highlight');
            highlightRows(range, atd);
        }
        else if (atd.hasClass('active') && range.substr(range.length - 1) == 'm') {
            atd.parent().parent().find('td').removeClass('highlight');
            highlightRows(range, atd);
        }
    });
