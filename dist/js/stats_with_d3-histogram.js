
(function(){
    'use strict';

        var classes;
        var className = [];
        var classLessons = [];
        var classNameLessons = [];
        var counter = 0;
        var selectHTML = '<option value="Välj">Välj lektion</option>';

        //connect to Google Spreadsheet
        var ds = new Miso.Dataset({
            importer : Miso.Dataset.Importers.GoogleSpreadsheet,
            parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
            key : "11lD3mj-ajKuJyssfN1_dW1ZJoato2X8bzqvilI1e_CE",
            worksheet : "1"
        });


        // get the data
        ds.fetch({ 
            success : function() {
                console.log(ds.columnNames(), ds.columnNames().length);
            },
            error : function() {
                console.log("Something went wrong. Are you sure you are connected to the internet?");
            }
        });

        // this function could be used if something need to be done after ds.fetch is done)

        _.when(ds.fetch()).then(function() {

            // gets the URL-parameters
            function getURLParam (oTarget, sVar) {
              return decodeURI(oTarget.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
            }

            // gets the values for klass and mal and replaces the + in the URL with blank spaces
            var re = /[+]/gi;
            var klassString = getURLParam(window.location, "klass").replace(re, ' ');

            // sets the class name on the page
            document.getElementById('classes').innerHTML = "Klass: " + klassString;
            
            // filter the data on the class parameter
            className = this.where({
                // copy over the data for this columns
                columns: ['Tidstämpel', 'Klass', 'Lektionsmal', 'Maluppfyllnad'],
                // and only where the values are > 1
                rows: function(row) {
                    return row.Klass == klassString;
                    //return row.Klass == classes.column('Klass').data[i];
                }
            });
                
            // Get the different lektionsmal from this class
            classLessons = className.countBy('Lektionsmal');
   
            for (var j = 0; j < classLessons.length; j++) {

                classNameLessons[counter] = className.where({
                    // copy over the one column
                    columns: ['Tidstämpel', 'Klass', 'Lektionsmal', 'Maluppfyllnad'],
                    // and only where the values are > 1
                    rows: function(row) {
                        return row.Lektionsmal == classLessons.column('Lektionsmal').data[j];
                    }
                });

                //Sort the data on the variabel Maluppfyllnad
                console.log("Före: " + classNameLessons[counter].column('Maluppfyllnad').data);

                classNameLessons[counter].column('Maluppfyllnad').data.sort(function(a, b) {
                    return a - b;
                });

                console.log("Efter sortering: " + classNameLessons[counter].column('Maluppfyllnad').data);

                // adds an option-value to the select box for each Lektionsmal
                selectHTML = selectHTML + '<option value="' + counter + '">' + classNameLessons[counter].column('Lektionsmal').data[0] + '</option>';
                counter = counter + 1;

                //console.log("Count: " + classNameLessons[0].countBy("Maluppfyllnad").toJSON());
                console.log(classNameLessons[0].toJSON());
            }

            //print out the selectbox on the page
            document.getElementById('select').innerHTML = selectHTML;

            var width = 700;
            var height = 500;
            var padding = 50;


            var canvas = d3.select(document.getElementById('bargraph')).append("svg")
              .attr("width", width + padding) 
              .attr("height", height + padding)
              .append("g")
                .attr("transform", "translate(30,0)")

            var drawBarchart = function(chosenValue){

              document.getElementById('mal').innerHTML = classNameLessons[chosenValue].column('Lektionsmal').data[0];

              document.getElementById('bargraph').innerHTML = "";

              var canvas = d3.select(document.getElementById('bargraph')).append("svg")
                .attr("width", width + padding) 
                .attr("height", height + padding)
                .append("g")
                  .attr("transform", "translate(30,0)")

              var map = classNameLessons[chosenValue].column('Maluppfyllnad').data

             //var map = data.map( function (i) { return parseInt(i.age); });  //return just the values we'll use in the histogram
              console.log(map);



              var histogram = d3.layout.histogram () // get the layout for histogram 
                .bins(5) // set number of bins
                (map)

              console.log("Histogram: " + histogram);

              var y = d3.scale.linear()
                //.domain([0, 12])
                .domain([0, d3.max(histogram.map(function (i) { return i.length; }))])
                .range([0, height]); 

              var y2 = d3.scale.linear() //used for the left axis
                //.domain([0, 12])
                .domain([0, d3.max(histogram.map(function (i) { return i.length; }))])
                .range([height, 0]); //turns the axis from bottom to top

              var x = d3.scale.linear()
                .domain([0, 5])
                .range([1, width]);


              var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(5)
                .tickValues([1, 2, 3, 4, 5])
                .orient("bottom");

              var yAxis = d3.svg.axis()
                .scale(y2)
                .ticks(5)
                .tickValues([2, 4, 6, 8, 10])
                .orient("left");

              var group = canvas.append("g")
                .attr("transform", "translate(0, " + height + ")")
                .call(xAxis);

              var group = canvas.append("g")
                .attr("transform", "translate(0, 0)")
                .call(yAxis);
                
              var bars = canvas.selectAll(".bar")
                .data(histogram)
                .enter()
                .append("g")

              bars.append("rect")
                .attr("x", function (d) {return x(d.x); })
                //.attr("y", function (d) { return 500 - d.y * 20; })  // turns the bars on a horisontal level up
                .attr("y", function (d) { return 500 - y(d.y); })  // turns the bars on a horisontal level up
                .attr("width", function (d) {return x(d.dx) - 2; })
                .attr("height", function (d) { return y(d.y); })
                //.attr("height", function (d) { return d.y * 20; })
                .attr("fill", "green")

              bars.append("text")
                .attr("x", function (d) { return x(d.x);})
                .attr("y", function (d) { return 500 - y(d.y);})
                //.attr("y", function (d) { return 500 - d.y * 20;})
                .attr("fill", "#fff")
                .attr("text-anchor", "middle")
                .attr("dy", "20px")
                .attr("dx", function (d) { return x(d.dx)/2; })
                .text(function (d) { return d.y; })


                document.getElementById('mean').innerHTML = "Medelvärde: " + classNameLessons[chosenValue].mean("Maluppfyllnad").toFixed(1);
            };

            // draw the Barchart and texts on the page for the chosen value
            /*
            var drawBarchart = function(chosenValue){
                document.getElementById('mal').innerHTML = classNameLessons[chosenValue].column('Lektionsmal').data[0];
                
                barchart.draw(classNameLessons[chosenValue].countBy("Maluppfyllnad").toJSON());
                

                document.getElementById('mean').innerHTML = "Medelvärde: " + classNameLessons[chosenValue].mean("Maluppfyllnad").toFixed(1);
            };
            */
            // put an eventlistener on the select-box
            document.getElementById('select').addEventListener ("change", function() { drawBarchart(this.value);});
          
        });
        








        /**
            * A reusable bar chart. Required data format:
            * [ { name : x-axis-bar-label, value : N }, ...]
            *
            *  Sample use:
            *  var bargraph = d3.select('#bargraph')
            *    .append('svg')
            *    .chart('BarChart')
            *    .yFormat(d3.format("d"))
            *    .height(400)
            *    .width(800)
            *    .max(1.0);
            *  bargraph.draw(bardata);
            */
            d3.chart('BarChart', {

              initialize: function() {
                var chart = this;

                // chart margins to account for labels.
                // we may want to have setters for this.
                // not sure how necessary that is tbh.
                chart.margins = {
                  top : 10,
                  bottom : 15,
                  left : 50,
                  right : 0,
                  padding : 10
                };

                // default chart ranges
                chart.x =  d3.scale.linear();
                chart.y = d3.scale.linear();

                chart.base
                  .classed('Barchart', true);

                // non data driven areas (as in not to be independatly drawn)
                chart.areas = {};

                // cache for selections that are layer bases.
                chart.layers = {};

                // make sections for labels and main area
                //  _________________
                // |Y|    bars      |
                // | |              |
                // | |              |
                // | |              |
                // | |______________|
                //   |      X       |

                // -- areas
                chart.areas.ylabels = chart.base.append('g')
                  .classed('ylabels', true)
                  .attr('width', chart.margins.left)
                  .attr('transform',
                    'translate('+(chart.margins.left-1)+','+(chart.margins.top + 1)+')');

                // -- actual layers
                chart.layers.bars = chart.base.append('g')
                  .classed('bars', true)
                  .attr('transform',
                    'translate(' + chart.margins.left + ',' + (chart.margins.top + 1)+')');

                chart.layers.xlabels = chart.base.append('g')
                  .classed('xlabels', true)
                  .attr('height', chart.margins.bottom);

                chart.on("change:width", function() {
                  chart.x.range([0, chart.w - chart.margins.left]);
                  chart.layers.bars.attr('width', chart.w - chart.margins.left);
                  chart.layers.xlabels.attr('width', chart.w - chart.margins.left);
                });

                chart.on("change:height", function() {
                  chart.y.range([chart.h - chart.margins.bottom - chart.margins.top, 0]);
                  chart.areas.ylabels
                    .attr('height', chart.h - chart.margins.bottom - chart.margins.top - 1);
                  chart.layers.bars
                    .attr('height', chart.h - chart.margins.bottom - chart.margins.top);
                  chart.layers.xlabels
                    .attr('transform', 'translate(' + chart.margins.left + ',' +
                    (chart.h - chart.margins.bottom + 1) + ')');
                });

                // make actual layers
                chart.layer('bars', chart.layers.bars, {
                    // data format:
                    // [ { name : x-axis-bar-label, value : N }, ...]
                    dataBind : function(data) {

                    chart.data = data;

                    // how many bars?
                    chart.bars = data.length;

                    // compute box size
                    chart.bar_width = (chart.w - chart.margins.left - ((chart.bars - 1) *
                      chart.margins.padding)) / chart.bars;

                    // adjust the x domain - the number of bars.
                    chart.x.domain([0, chart.bars]);

                    // adjust the y domain - find the max in the data.
                    chart.datamax = chart.usermax ||
                      d3.extent(data, function(d) { return d.value; })[1];

                    chart.y.domain([0, chart.datamax]);

                    // draw yaxis
                    var yAxis = d3.svg.axis()
                      .scale(chart.y)
                      .orient('left')
                      .ticks(5)
                      .tickFormat(chart._yformat || d3.format('.0%'));

                    chart.areas.ylabels
                      .call(yAxis);

                    return this.selectAll('rect')
                      .data(data, function(d) { return d.name; });
                  },
                  insert : function() {
                    return this.append('rect')
                      .classed('bar', true)
                      .classed('highlight', function(d) {
                        return d.highlight;
                      });
                  },

                  events: {
                    exit: function() {
                      this.remove();
                    }
                  }
                });

                // a layer for the x text labels.
                chart.layer('xlabels', chart.layers.xlabels, {
                  dataBind : function(data) {
                    // first append a line to the top.
                    this.append('line')
                      .attr('x1', 0)
                      .attr('x2', chart.w - chart.margins.left)
                      .attr('y1', 0)
                      .attr('y2', 0)
                      .style('stroke', '#222')
                      .style('stroke-width', '1')
                      .style('shape-rendering', 'crispEdges');


                    return this.selectAll('text')
                      .data(data, function(d) { return d.name; });
                  },
                  insert : function() {
                    return this.append('text')
                      .classed('label', true)
                      .attr('text-anchor', 'middle')
                      .attr('x', function(d, i) {
                        return chart.x(i) - 0.5 + chart.bar_width/2;
                      })
                      .attr('dy', '1em')
                      .text(function(d) {
                        return d.name;
                      });
                  },
                  events: {
                    exit: function() {
                      this.remove();
                    }
                  }
                });

                // on new/update data
                // render the bars.
                var onEnter = function() {
                  this.attr('x', function(d, i) {
                        return chart.x(i) - 0.5;
                      })
                      .attr('y', function(d) {
                        return chart.h - chart.margins.bottom -
                          chart.margins.top - chart.y(chart.datamax - d.value) - 0.5;
                      })
                      .attr('val', function(d) {
                        return d.value;
                      })
                      .attr('width', chart.bar_width)
                      .attr('height', function(d) {
                        return chart.y(chart.datamax - d.value);
                      });
                };

                chart.layer('bars').on('enter', onEnter);
                chart.layer('bars').on('update', onEnter);
              },

              // return or set the max of the data. otherwise
              // it will use the data max.
              max : function(datamax) {
                if (!arguments.length) {
                  return this.usermax;
                }

                this.usermax = datamax;

                if (this.data) this.draw(this.data);

                return this;
              },

              yFormat: function(format) {
                if (!arguments.length) {
                  return this._yformat;
                }
                this._yformat = format;
                return this;
              },

              width : function(newWidth) {
                if (!arguments.length) {
                  return this.w;
                }
                // save new width
                this.w = newWidth;

                // adjust the x scale range
                this.x =  d3.scale.linear()
                  .range([this.margins.left, this.w - this.margins.right]);

                // adjust the base width
                this.base.attr('width', this.w);

                this.trigger("change:width");
                if (this.data) this.draw(this.data);

                return this;
              },

              height : function(newHeight) {
                if (!arguments.length) {
                  return this.h;
                }

                // save new height
                this.h = newHeight;

                // adjust the y scale
                this.y = d3.scale.linear()
                  .range([this.h - this.margins.top, this.margins.bottom]);

                // adjust the base width
                this.base.attr('height', this.h);

                this.trigger("change:height");
                if (this.data) this.draw(this.data);
                return this;
              }
            });

/*
            var barchart = d3.select(document.getElementById("bargraph"))
              .append('svg')
              .chart('BarChart', {
                transform: function(data) {
                  return data.map(function(d) {
                    return { name : d.Maluppfyllnad, value : d.count }; // here you tell what key variabel you need
                  });
                }
              })
              .yFormat(d3.format("d"))
              .height(300) // here you define the height
              .width(700); // here you define the width

*/              
            /** original data format, now made with the Miso Dataset.js instead
            barchart.draw([
              { Maluppfyllnad : '1', count : 2, a : '1', b : 2 },
              { Maluppfyllnad : '2', count : 3, a : '1', b : 2 },
              { Maluppfyllnad : '3', count : 4, a : '1', b : 2 },
              { Maluppfyllnad : '4', count : 4, a : '1', b : 2 },
              { Maluppfyllnad : '5', count : 2, a : '1', b : 2 },
              { Maluppfyllnad : 'mean', count : 2.8, a : '1', b : 2 }
            ]);
*/
            


})();
