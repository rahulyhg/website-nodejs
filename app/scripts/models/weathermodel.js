/*global define*/

define([
    'underscore'
    ,'backbone'
    ,'apis/zipcodeapi'
    ,'apis/weatherapi'
], function (_, Backbone, ZipcodeAPI, WeatherAPI) {
    'use strict';

    var WeatherModel = Backbone.Model.extend({
        url: '',

        initialize: function() {

        },

        defaults: {
        },

        api : MS.API,

        askWeather : function(canvas,size) {
            var self = this;
            this.canvas = canvas;
            this.size = size;

            //$('#weatherSubmit').on("submit",function(event){
            $('#weatherForm').submit(function(e){
                e.preventDefault();
                e.stopPropagation();

                var weatherInput = $('#weatherInput').val();
                if (weatherInput != '' && !isNaN(weatherInput)
                    && weatherInput.length < 7 &&  weatherInput.length > 0) {
                    $.when(
                        self.getWeather(weatherInput)
                    ).then(
                        $('#weatherModal').modal('hide')
                    );
                } else {

                }
            });
        },

        getWeather : function(zipcode) {
            var self = this;

            this.api.Zipcode = new ZipcodeAPI([],{zipcode: zipcode});//60302});

            this.api.Zipcode.fetch({
                success: function () {
                    //self.output(self.api.Zipcode);
                    var zipData = self.api.Zipcode.get('places')[0];
                    var city = zipData['place name'];
                    var state = zipData['state abbreviation'];

                    self.api.Weather = new WeatherAPI([],{
                        city: city,
                        state: state
                    });

                    self.api.Weather.fetch({
                        data: { q: city + ',' + state },
                        success: function () {
                            var weatherData = self.api.Weather,
                                weatherStatic = weatherData.get('staticData'),
                                weatherMain = weatherData.get('main'),
                                weatherArr = weatherData.get('weather')[0];

                            var fahrenheit = {
                                temp: self.kelvinToFahrenheit(weatherMain.temp),
                                temp_max: self.kelvinToFahrenheit(weatherMain.temp_max),
                                temp_min: self.kelvinToFahrenheit(weatherMain.temp_min)
                            };

                            weatherData.set('fahrenheit', fahrenheit);
                            weatherData.set('condition', weatherStatic.conditions['_' + weatherArr.icon.replace(/\D/g, '')]);
                            weatherData.set('period', weatherStatic.periods[weatherArr.icon.replace(/[^a-z]/gi, '')]);
                            weatherData.set('description',weatherArr.description);

                            MS.Views.Weather.displayView({
                              weather: weatherData.toJSON()
                            });

                            self.setWeather();
                            //self.output(self.api.Weather);
                        }
                    });
                }
            });
        },

        setWeather: function() {
            var weatherAPI = this.api.Weather;

            $.when(
                this.displayWeather(weatherAPI),
                this.displaySunMoon(weatherAPI)
            ).then(
                this.setBackground(weatherAPI)
            );
        },

        setBackground: function(api) {
            this.canvas.Periods[api.get('period')[0]].shape.x = this.size.width/2;
            this.canvas.Periods[api.get('period')[0]].shape.y = this.size.height/2;
            this.canvas.Periods[api.get('period')[0]].shape.scaleX = this.size.width/300+.05;
            this.canvas.Periods[api.get('period')[0]].shape.scaleY = this.size.height/300+.05;
        },

        displayWeather: function(api) {
            this.canvas.Conditions[api.get('condition')[0]].init();
            this.canvas.Periods[api.get('period')[0]].init();
        },

        displaySunMoon: function(api) {
            this.canvas.SolarSystem[api.get('period')[1]].visible = true;
        },

        kelvinToFahrenheit: function(temp) {
            return Math.round((temp - 273.15) * 1.8000 + 32.00);
        },
        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        },

        output: function (api) {
            //console.log( api.toJSON());
        }
    });

    return WeatherModel;
});
