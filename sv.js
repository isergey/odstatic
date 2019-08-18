(function () {
    'use strict';
    var candidatesByOik = {};
    var oikByUik = {};
    var votePlaces = {};
    $.get('./candidate-oik.csv').then(function (data) {
        var res = Papa.parse(data);
        res.data.forEach(function (row) {
            var candidates = candidatesByOik[row[2]];
            if (candidates === undefined) {
                candidates = [];
                candidatesByOik[row[2]] = candidates;
            }
            candidates.push({
                fio: row[0],
                mo: row[1],
                oik: row[2],
                party: row[3],
            });
        });
        return $.get('./oik-uik.csv');
    }).then(function (data) {
        var res = Papa.parse(data);
        // console.log('data', res.data.map(i => i).forEeach);
        res.data.filter(function (item) {
            return item[0] !== '';
        }).forEach(function (row) {
            row[2].split(',').forEach(function (uik) {
                oikByUik[uik] = {
                    oik: row[1],
                    mo: row[0],
                }
            });
        });
        return $.get('./vote-places.csv');
    }).then(function (data) {
        var res = Papa.parse(data);
        res.data.forEach(function (row) {
           votePlaces[row[1]] = {
               mo: row[0],
               uik: row[1],
               address: row[2],
               place:row[3],
           };
        });
    }).catch(function (error) {
        console.error(error);
    });

    var $districtSelect = $('#sv-app-district-select');
    $districtSelect.select2({
        placeholder: 'Выберите район',

    });

    var $streetSelect = $('#sv-app-street-select');
    $streetSelect.select2({
        placeholder: 'Выберите улицу',
        ajax: {
            url: 'https://okrug.od.spb.ru/addresses/search_address/',
            dataType: 'json',
            data: function (params) {
                var query = {
                    district: $districtSelect.val(),
                    term: params.term
                }
                return query;
            },
            processResults: function (data) {
                return {
                  results: data.results
                };
              }
        },
        
    });

    var $houseSelect = $('#sv-app-house-select');
    $houseSelect.select2({
        placeholder: 'Выберите дом',
        ajax: {
            url: 'https://okrug.od.spb.ru/addresses/search_house/',
            dataType: 'json',
            data: function (params) {
                var query = {
                    address: $streetSelect.val(),
                    term: params.term
                }
                return query;
            },
            processResults: function (data) {
                return {
                  results: data.results
                };
              }
        },
        
    });

    $districtSelect.on('change', function () {
        console.log($districtSelect.val());
    });

    $houseSelect.on('change.select2', function () {
        var uik = $houseSelect.select2('data')[0].uik;
        // var uik = oikByUik[$houseSelect.select2('data')[0].uik];
        console.log('uik', uik);
        var oikData = oikByUik[uik];
        drawCandidates(candidatesByOik[oikData.oik]);
        drawVotePlace(votePlaces[uik]);
    });

    var $candidatesContainer = $('#sv-candidates');

    function drawCandidates(candidates) {
        var tpl = [
            '<h3>Кандидаты</h3>',
            '<table class="table">',
            '<tr>',
            '<th>Кандидат</th>',
            '<th>Партия</th>',
            '</tr>',
        ];

        candidates.forEach(function (candidate) {
            var candidateTpl = [
                '<tr>',
                ['<td>', candidate.fio, '</td>'].join(''),
                ['<td>', candidate.party, '</td>'].join(''),
                '</tr>',
            ];
            tpl.push(candidateTpl.join(''));
        });
        tpl.push('</table>');
        $candidatesContainer.html(tpl.join(''))
    }

    var $votePlaceContainer = $('#sv-vote-place');
    function drawVotePlace(voitePlace) {
        var tpl = [
            '<h3>Место голосования</h3>',
            '<table class="table">',
            '<tr>',
            '<th>Муниципалитет</th>',
            '<td>' + voitePlace.mo + '</td>',
            '</tr><tr>',
            '<th>УИК</th>',
            '<td>' + voitePlace.uik + '</td>',
            '</tr><tr>',
            '<th>Адрес</th>',
            '<td>' + voitePlace.address + '</td>',
            '</tr><tr>',
            '<th>Место голосования</th>',
            '<td>' + voitePlace.place + '</td>',
            '</tr>',
            '</table>'
        ];
        
        $votePlaceContainer.html(tpl.join(''));
    }
})();