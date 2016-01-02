(function(){
    'use strict';

        // global variabels

          var startHTML = '<h1>Lektionsutvärdering</h1> \
                          \
                          <form method="get" action="evaluation.html" target="_blank">\
                            <div class="input-group">\
                              <div class="input-group" id="klassinput"></div>\
                              <div class="input-group" id="malinput"></div>\
                              <div id="hiddenForm"></div>\
                              <input type="submit" class="btn btn-primary" value="Starta ny lektionsutvärdering">\
                            </div>\
                          </form>'


          var startStatsHTML =  '<h1>Statistik över tidigare lektionsmål</h1>\
                          \
                          <select name="klass" id="selectKlassStats"></select>\
                          <span id="selectMalStats"></span>\
                          <h2 id="malTitle"></h2>\
                          <div id="bargraph"></div>\
                          <h2 id="mean"></h2>'
          var classes;
          var className = [];
          var classLessons = [];
          var classNameLessons = [];
          var counter = 0;
          var ds, idSpreadsheet, idKlass, idMal, idUtvardering, baseURL;

          //connect to name Google Spreadsheet
          var dsName = new Miso.Dataset({
              importer : Miso.Dataset.Importers.GoogleSpreadsheet,
              parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
              key : "1hu-JDIRDCDIJjFfZMHq6jeUokl4YKkxGh8ctuS4H0ik",
              worksheet : "1"
          });

          // get the data
          dsName.fetch({ 
              success : function() {
                  //console.log(dsName.columnNames(), dsName.columnNames().length);

              },
              error : function() {
                  console.log("Something went wrong. Are you sure you are connected to the internet?");
              }
          });

          
          // this function could be used if something need to be done after ds.fetch is done)
          _.when(dsName.fetch()).then(function() {

              // filter the data on the Epost parameter
              function checkPassword() {

                  var inputEmail = document.getElementById('inputEmail').value;
                  var inputPassword = document.getElementById('inputPassword').value;

                  var nameDetails = dsName.where({
                      // copy over the data for this columns
                      columns: ['Namn', 'Epost', 'Password', 'idSpreadsheet', 'baseURL', 'idKlass', 'idMal', 'idUtvardering'],
                      // and only where the values are > 1
                      rows: function(row) {
                          return row.Epost == inputEmail
                      }             
                  });

                  // check if both email and password matches
                  if (nameDetails.column('Epost').data[0] ==  inputEmail && nameDetails.column('Password').data[0] ==  inputPassword) {
                      

                      //connect to Google Spreadsheet for this teacher
                      ds = new Miso.Dataset({
                          importer : Miso.Dataset.Importers.GoogleSpreadsheet,
                          parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
                          key : nameDetails.column('idSpreadsheet').data[0],
                          worksheet : "1"
                      });

                      // get the data
                      ds.fetch({ 
                          success : function() {
                              //console.log(ds.columnNames(), ds.columnNames().length);
                          },
                          error : function() {

                              console.log("Something went wrong. Are you sure you are connected to the internet?");
                          }
                      });

                      // this function could be used if something need to be done after ds.fetch is done)
                      _.when(ds.fetch()).then(function() {

                          //document.getElementById('main-content').innerHTML = startHTML;
                          document.getElementById('meny').innerHTML = '<span class="page-header"><a href="#" class="menu-link" id="newLessonGoal">Ny lektionsutvärdering</a>' + 
                          ' <a href="#" class="menu-link" id="linkToStats">Kolla statistik</a>' + 
                          ' <a href="#" class="menu-link" id="logOut">Logga ut</a> </span>'
                          idSpreadsheet = nameDetails.column('idSpreadsheet').data[0];
                          idKlass = nameDetails.column('idKlass').data[0];
                          idMal = nameDetails.column('idMal').data[0];
                          idUtvardering = nameDetails.column('idUtvardering').data[0]
                          baseURL = nameDetails.column('baseURL').data[0];
                          // call the startview function and send the data connected to that email with it

                          startView();
                      });

                  } else {
                      // alert when wrong email or password
                      document.getElementById('wrongPassword').innerHTML = "Fel användarnamn eller lösenord. Försök igen!";

                  }
              }

              // put an event listner on the submit button for login
              document.getElementById('form-submit').addEventListener ("click", function() { checkPassword();});


              var reloadPage = function(){
                  document.location.reload(false);
              };

              function startView () {

                    // starttext for selectbox
                    document.getElementById('main-content').innerHTML = startHTML;
                    var selectHTMLClass = '<option>Välj klass</option>';
                    var selectLessongoalsHTML = '<option value="Välj">Välj lektionsmål</option>';
                    document.getElementById('hiddenForm').innerHTML = '<input id="idKlass" name="idKlass" value="' + idKlass +'" type="hidden">' +
                                     '<input id="idMal" name="idMal" value="' + idMal +'" type="hidden">' +
                                     '<input id="idUtvardering" name="idUtvardering" value="' + idUtvardering +'" type="hidden">' +
                                     '<input id="baseURL" name="baseURL" value="' + baseURL +'" type="hidden">';



                    
                        //Get the different classes and sort by the variabel Klass
                        classes = ds.countBy('Klass');
                        //console.log("Före: " +classes.column('Klass').data);

                        classes.sort(function(rowA, rowB) {
                            if (rowA.Klass > rowB.Klass) {
                                return 1;
                            }
                            if (rowA.Klass < rowB.Klass) {
                                return -1;
                            }
                            return 0;
                        });

                        //console.log("Efter: " + classes.column('Klass').data);

                        for (var j = 0; j < classes.length; j++) {
                            selectHTMLClass = selectHTMLClass + '<option value="' + classes.column('Klass').data[j] + '">' + classes.column('Klass').data[j] + '</option>';
                        }

                        document.getElementById('klassinput').innerHTML = "<strong>Klass: </strong> <select name='klass' id='klass'></select> <a href='#' id='nyklass'> Ange ny klass</a>"
                        document.getElementById('klass').innerHTML = selectHTMLClass;
                        //document.getElementById('selectKlassStats').innerHTML = selectHTMLClass;


                        //Get the different lessongoals and sort by the variabel Lektionsmal
                        var lessongoals = ds.countBy('Lektionsmal');
                        //console.log("Före: " +lessongoals.column('Lektionsmal').data);

                        lessongoals.sort(function(rowA, rowB) {
                            if (rowA.Lektionsmal > rowB.Lektionsmal) {
                                return 1;
                            }
                            if (rowA.Lektionsmal < rowB.Lektionsmal) {
                                return -1;
                            }
                            return 0;
                        });

                        //console.log("Efter: " + lessongoals.column('Lektionsmal').data);

                        for (var j = 0; j < lessongoals.length; j++) {
                            selectLessongoalsHTML = selectLessongoalsHTML + '<option value="' + lessongoals.column('Lektionsmal').data[j] + '">' + lessongoals.column('Lektionsmal').data[j] + '</option>';
                        }

                        document.getElementById('malinput').innerHTML = "<strong>Lektionsmål: </strong> <select name='mal' id='mal'></select> <a href='#' id='nyttmal'> Ange nytt lektionsmål</a>"
                        document.getElementById('mal').innerHTML = selectLessongoalsHTML;
                        

                        // on click show input form for new class
                        document.getElementById("nyklass").addEventListener("click", function( event ) {
                            document.getElementById("klassinput").innerHTML = "<label>Ange klass <input id='klass' class='form-control' placeholder='Klass Skola (ämne)' name='klass' required></label>" 
                        }, false);

                        
                        // on click show input form for new lessongoal
                        document.getElementById("nyttmal").addEventListener("click", function( event ) {
                            document.getElementById("malinput").innerHTML = "<label>Mål med lektionen <input id='mal' class='form-control' placeholder='Beskriv lektionsmålet' name='mal' required></label>" 
                        }, false);


                        document.getElementById('newLessonGoal').addEventListener ("click", function() { startView ();});
                        document.getElementById('linkToStats').addEventListener ("click", function() { lessonView ();});
                        document.getElementById('logOut').addEventListener ("click", function() { reloadPage ();});


              }

              function lessonView () {  

                      //connect to Google Spreadsheet for this teacher
                      ds = new Miso.Dataset({
                          importer : Miso.Dataset.Importers.GoogleSpreadsheet,
                          parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
                          key : idSpreadsheet,
                          worksheet : "1"
                      });

                      // get the data
                      ds.fetch({ 
                          success : function() {

                              //console.log("new " + ds.columnNames(), ds.columnNames().length);
     


                              document.getElementById('main-content').innerHTML = startStatsHTML;


                              document.getElementById("malTitle").innerHTML = ""
                              document.getElementById("bargraph").innerHTML = ""
                              document.getElementById("mean").innerHTML = ""


                              var selectHTMLClass = '<option value="Välj">Välj klass</option>';
                              var selectHTML = '<select name="select" id="selectLessonGoal"> <option value="Välj">Välj lektion</option>';


                              //Get the different classes and sort by the variabel Klass
                                var classes = ds.countBy('Klass');

                                //console.log("Före: " +classes.column('Klass').data);

                                classes.sort(function(rowA, rowB) {
                                    if (rowA.Klass > rowB.Klass) {
                                        return 1;
                                    }
                                    if (rowA.Klass < rowB.Klass) {
                                        return -1;
                                    }
                                    return 0;
                                });

                                //console.log("Efter: " + classes.column('Klass').data);

                                for (var j = 0; j < classes.length; j++) {
                                    selectHTMLClass = selectHTMLClass + '<option value="' + classes.column('Klass').data[j] + '">' + classes.column('Klass').data[j] + '</option>';
                                }

                                document.getElementById('selectKlassStats').innerHTML = selectHTMLClass;
                                document.getElementById('selectKlassStats').addEventListener ("change", function() { lessonViewGoal ();});

                                             },
                          error : function() {

                              console.log("Something went wrong. Are you sure you are connected to the internet?");
                          }
                      });
                }  

                function lessonViewGoal () {
                      
                      
                      document.getElementById('malTitle').innerHTML = "";
                      document.getElementById('bargraph').innerHTML = "";
                      document.getElementById('mean').innerHTML = "";
                      

                      var selectHTML = '<select name="select" id="selectLessonGoal"> <option value="Välj">Välj lektion</option>';
                      var klassString = document.getElementById('selectKlassStats').value
                      

                      // filter the data on the class parameter
                      className = ds.where({
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
                          //console.log("Före: " + classNameLessons[counter].column('Maluppfyllnad').data);

                          classNameLessons[counter].column('Maluppfyllnad').data.sort(function(a, b) {
                              return a - b;
                          });

                          //console.log("Efter: " + classNameLessons[counter].column('Maluppfyllnad').data);

                          // adds an option-value to the select box for each Lektionsmal
                          selectHTML = selectHTML + '<option value="' + counter + '">' + classNameLessons[counter].column('Lektionsmal').data[0] + '</option>';
                          counter = counter + 1;
                      }


                      //print out the selectbox on the page
                      document.getElementById('selectMalStats').innerHTML = selectHTML + "</select>";

                      // draw the Barchart and texts on the page for the chosen value
                      var drawBarchart = function(chosenValue){
                          document.getElementById('malTitle').innerHTML = klassString + ": " + 
                          classNameLessons[chosenValue].column('Lektionsmal').data[0] + " (medel " +
                          classNameLessons[chosenValue].mean("Maluppfyllnad").toFixed(1) + ")";
                          barchart.draw(classNameLessons[chosenValue].countBy("Maluppfyllnad").toJSON());
                      };

                      // put an eventlistener on the select-box
                      document.getElementById('selectMalStats').addEventListener ("change", function() { drawBarchart(document.getElementById('selectLessonGoal').value);});
                      
                  
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
       }     



          });

})();
