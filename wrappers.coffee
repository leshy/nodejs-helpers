_ = require 'underscore'

exports.wrap =

    # will execute an asyc function once, and cache the result for the next time
    once: (f) ->
        options =
            state: 0
            data: undefined
            callbacks: []

        gotData = (data...) ->
            options.data = data
            options.state = 2
            _.each options.callbacks, (callback) ->
                callback.apply @, options.data

        ret = (callback) ->
            if options.state is 2
                _.defer -> callback.apply @, options.data

            options.callbacks.push callback

            if options.state is 0
                options.state = 1
                f gotData

        ret
