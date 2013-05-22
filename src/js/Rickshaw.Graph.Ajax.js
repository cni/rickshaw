Rickshaw.namespace('Rickshaw.Graph.Ajax');

Rickshaw.Graph.Ajax = Rickshaw.Class.create( {

    initialize: function(args) {

        this.dataURL = args.dataURL;

        this.onData = args.onData || function(d) { return d };
        this.onComplete = args.onComplete || function() {};
        this.onError = args.onError || function() {};

        this.num_ajax_errors = 0;
        this.num_appended = 0;

        this.args = args; // pass through to Rickshaw.Graph

        this.request();
    },

    request: function() {

        $.ajax( {
            url: this.dataURL,
            dataType: 'json',
            success: this.success.bind(this),
            error: this.error.bind(this)
        } );
        return(this.num_appended);
    },

    error: function() {

        console.log("error loading dataURL: " + this.dataURL);
        this.num_ajax_errors++;
        this.onError(this);
    },

    success: function(data, status) {

        this.num_ajax_errors = 0;

        data = this.onData(data);

        if(this.graph){
            // Update an existing graph
            this._splice({ data: data, append: true });
            this.graph.render();
        }else{
            this._splice({ data: data });
            this.graph = new Rickshaw.Graph(this.args);
            this.graph.render();
            this.onComplete(this);
        }
    },

    _splice: function(args) {

        if (!this.args.series)
            this.args.series = args.data;

        this.num_appended = 0;

        this.args.series.forEach( function(s) {

            var seriesKey = s.key || s.name;
            if (!seriesKey) throw "series needs a key or a name";

            args.data.forEach( function(d) {

                var dataKey = d.key || d.name;
                if (!dataKey) throw "data needs a key or a name";

                if (seriesKey == dataKey) {
                    if (args.append){
                        if (d['data'] && d['data'].length>0) {
                            this.num_appended = 1;
                            d['data'].forEach( function(i) {
                                s['data'].push(i);
                            });
                        }
                    }else{
                        var properties = ['color', 'name', 'data'];
                        properties.forEach( function(p) {
                        if (d[p]) s[p] = d[p];
                        } );
                    }
                }
            } );
        } );
    }
} );


