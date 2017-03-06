var socket = io.connect('http://localhost:3002');
socket.on('connect', function(data) {

    var margin = {
            top: 20,
            right: 20,
            bottom: 70,
            left: 40
        },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    socket.on('update', function(data) {
        console.log(data);
        update(data);
    })

    function update(jsonObj) {

        x.domain(jsonObj.map(function(d) {
            return d._id;
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
            .call(d3.axisLeft(y).ticks(10, "%"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Frequency");


        chart.selectAll(".bar").remove();

        chart.selectAll(".bar")
            .data(jsonObj)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d._id);
            })
            .attr("y", function(d) {
                return y(d.msgs);
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                return height - y(d.msgs);
            });

    }

    //socket.emit('join', svg);
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
