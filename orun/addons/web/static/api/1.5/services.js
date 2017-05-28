// Generated by CoffeeScript 1.10.0
(function() {
  var Model, RequestManager, Service, requestManager,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  RequestManager = (function() {
    function RequestManager() {
      this.requestId = 0;
      this.requests = {};
    }

    RequestManager.prototype.request = function() {
      var def, reqId;
      reqId = ++requestManager.requestId;
      def = new $.Deferred();
      this.requests[reqId] = def;
      def.requestId = reqId;
      return def;
    };

    return RequestManager;

  })();

  if (Katrid.socketio) {
    console.log('socketio defined');
    requestManager = new RequestManager();
    Katrid.socketio.on('connect', function() {
      return console.log("I'm connected!");
    });
    Katrid.socketio.on('api', function(data) {
      var def;
      if (_.isString(data)) {
        data = JSON.parse(data);
      }
      def = requestManager.requests[data['req-id']];
      return def.resolve(data);
    });
  }

  Service = (function() {
    function Service(name1) {
      this.name = name1;
    }

    Service.prototype["delete"] = function(name, params, data) {};

    Service.prototype.get = function(name, params) {
      var rpcName;
      if (Katrid.Settings.servicesProtocol === 'ws') {
        return Katrid.socketio.emit('api', {
          channel: 'rpc',
          service: this.name,
          method: name,
          data: data,
          args: params
        });
      } else {
        rpcName = Katrid.Settings.server + '/api/rpc/' + this.name + '/' + name + '/';
        return $.get(rpcName, params);
      }
    };

    Service.prototype.post = function(name, params, data) {
      var def, rpcName;
      if (Katrid.Settings.servicesProtocol === 'io') {
        def = requestManager.request();
        Katrid.socketio.emit('api', {
          "req-id": def.requestId,
          "req-method": 'POST',
          service: this.name,
          method: name,
          data: data,
          args: params
        });
        return def;
      } else {
        rpcName = Katrid.Settings.server + '/api/rpc/' + this.name + '/' + name + '/';
        if (params) {
          rpcName += '?' + $.param(params);
        }
        return $.ajax({
          method: 'POST',
          url: rpcName,
          data: JSON.stringify(data),
          contentType: "application/json; charset=utf-8",
          dataType: 'json'
        });
      }
    };

    return Service;

  })();

  Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.searchName = function(name) {
      return this.post('search_name', {
        name: name
      });
    };

    Model.prototype.createName = function(name) {
      return this.post('create_name', null, {
        name: name
      });
    };

    Model.prototype.search = function(data, params) {
      data = {
        kwargs: data
      };
      return this.post('search', params, data);
    };

    Model.prototype.destroy = function(id) {
      return this.post('destroy', null, {
        kwargs: {
          ids: [id]
        }
      });
    };

    Model.prototype.getById = function(id) {
      return this.post('get', null, {
        kwargs: {
          id: id
        }
      });
    };

    Model.prototype.getDefaults = function() {
      return this.post('get_defaults');
    };

    Model.prototype.copy = function(id) {
      return this.post('copy', null, {
        args: [id]
      });
    };

    Model.prototype._prepareFields = function(view) {
      var f, ref, results, v;
      ref = view.fields;
      results = [];
      for (f in ref) {
        v = ref[f];
        if (v.choices) {
          results.push(v.displayChoices = _.object(v.choices));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Model.prototype.getViewInfo = function(data) {
      return this.post('get_view_info', null, {
        kwargs: data
      }).done((function(_this) {
        return function(res) {
          return _this._prepareFields(res.result);
        };
      })(this));
    };

    Model.prototype.loadViews = function(data) {
      return this.post('load_views', null, {
        kwargs: data
      }).done((function(_this) {
        return function(res) {
          var obj, ref, results, view;
          ref = res.result;
          results = [];
          for (view in ref) {
            obj = ref[view];
            results.push(_this._prepareFields(obj));
          }
          return results;
        };
      })(this));
    };

    Model.prototype.getFieldChoices = function(field, term) {
      console.log('get field choices', field, term);
      return this.get('get_field_choices', {
        args: field,
        q: term
      });
    };

    Model.prototype.doViewAction = function(data) {
      return this.post('do_view_action', null, {
        kwargs: data
      });
    };

    Model.prototype.write = function(data, params) {
      return this.post('write', params, {
        kwargs: {
          data: data
        }
      }).done(function() {
        return Katrid.Dialogs.Alerts.success(Katrid.i18n.gettext('Record saved successfully.'));
      }).fail(function(res) {
        if (res.status === 500 && res.responseText) {
          return alert(res.responseText);
        } else {
          return Katrid.Dialogs.Alerts.error(Katrid.i18n.gettext('Error saving record changes'));
        }
      });
    };

    Model.prototype.groupBy = function(grouping) {
      return this.post('group_by', null, {
        kwargs: grouping
      });
    };

    Model.prototype.autoReport = function() {
      return this.post('auto_report', null, {
        kwargs: {}
      });
    };

    Model.prototype.onFieldChange = function(field, record) {
      return this.post('field_change', null, {
        kwargs: {
          field: field,
          record: record
        }
      });
    };

    return Model;

  })(Service);

  this.Katrid.Services = {
    Service: Service,
    Model: Model
  };

}).call(this);

//# sourceMappingURL=services.js.map
