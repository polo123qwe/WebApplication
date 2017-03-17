var socket = io.connect('http://localhost:3002');
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var d;
var actualWeekdays = JSON.parse(JSON.stringify(weekdays))

socket.on('connect', function(data) {

    var margin = {
            top: 20,
            right: 20,
            bottom: 70,
            left: 40
        },

        width = $(".chartwrapper").width() - margin.left - margin.right,
        height = $(".chartwrapper").outerHeight(true) - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeDay("%d"));

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10);

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left * 1.5 + "," + margin.top + ")")

    socket.on('update', function(data) {
        // console.log(data);
        update(data);
    })

    //When update fails, we recieve an err event to notify the client
    socket.on('err', function(error) {
        console.log(error);
        alert(error.error);
    });

    function update(jsonObj) {

        d3.selectAll('svg > g > *').remove();

        d = new Date();
        actualWeekdays = sortWeekdays(weekdays[d.getDay()], actualWeekdays); // in case the server is running for several days

        x.domain(jsonObj.map(function(d) {
            return actualWeekdays[d._id - 1];
        }));
        y.domain([0, d3.max(jsonObj, function(d) {
            return d.msgs;
        })]);

        chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        chart.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Messages");

        chart.selectAll(".bar")
            .data(jsonObj)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(actualWeekdays[d._id - 1]);
            })
            .attr("y", function(d) {
                return y(d.msgs);
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                return height - y(d.msgs);
            });

    }

});

socket.on('broad', function(data) {
    $('#future').html(data);
});


$('form').submit(function(e) {
    e.preventDefault();
    var formData = {};
    formData.guild_id = $('#guild_id').val();
    formData.author_id = $('#author_id').val();
    socket.emit('formupdate', formData);
});

function sortWeekdays(limit, array) {
    while (array[array.length - 1] != limit) {
        array = array.concat(array.splice(0, 2));
    }
    return array;
}
