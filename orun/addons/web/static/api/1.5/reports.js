(function () {
  let _counter = 0;


  class Reports {
    static initClass() {
      this.currentReport = {};
      this.currentUserReport = {};
    }

    static get(repName) {}

    static renderDialog(action) {
      return Katrid.UI.Utils.Templates.renderReportDialog(action);
    }
  }
  Reports.initClass();


  class Report {
    constructor(action, scope) {
      this.action = action;
      this.scope = scope;
      this.info = this.action.info;
      Katrid.Reports.Reports.currentReport = this;
      if ((Params.Labels == null)) {
        Params.Labels = {
          exact: Katrid.i18n.gettext('Is equal'),
          in: Katrid.i18n.gettext('Selection'),
          contains: Katrid.i18n.gettext('Contains'),
          startswith: Katrid.i18n.gettext('Starting with'),
          endswith: Katrid.i18n.gettext('Ending with'),
          gt: Katrid.i18n.gettext('Greater-than'),
          lt: Katrid.i18n.gettext('Less-than'),
          between: Katrid.i18n.gettext('Between'),
          isnull: Katrid.i18n.gettext('Is Null')
        };
      }

      this.name = this.info.name;
      this.id = ++_counter;
      this.values = {};
      this.params = [];
      this.filters = [];
      this.groupables = [];
      this.sortables = [];
      this.totals = [];
    }

    getUserParams() {
      const report = this;
      const params = {
        data: [],
        file: report.container.find('#id-report-file').val()
      };
      for (let p of Array.from(this.params)) {
        params.data.push({
          name: p.name,
          op: p.operation,
          value1: p.value1,
          value2: p.value2,
          type: p.type
        });
      }

      const fields = report.container.find('#report-id-fields').val();
      params['fields'] = fields;

      const totals = report.container.find('#report-id-totals').val();
      params['totals'] = totals;

      const sorting = report.container.find('#report-id-sorting').val();
      params['sorting'] = sorting;

      const grouping = report.container.find('#report-id-grouping').val();
      params['grouping'] = grouping;

      return params;
    }

    loadFromXml(xml) {
      if (_.isString(xml)) {
        xml = $(xml);
      }
      const fields = [];

      for (let f of Array.from(xml.find('field'))) {
        f = $(f);
        const name = f.attr('name');
        const label = f.attr('label') || (this.info.fields[name] && this.info.fields[name].caption) || name;
        const groupable = f.attr('groupable');
        const sortable = f.attr('sortable');
        const total = f.attr('total');
        const param = f.attr('param');
        console.log(name, label, f);
        fields.push({
          name,
          label,
          groupable,
          sortable,
          total,
          param
        });
      }

      const params = (Array.from(xml.find('param')).map((p) => $(p).attr('name')));

      return this.load(fields, params);
    }

    saveDialog() {
      const params = this.getUserParams();
      const name = window.prompt(Katrid.i18n.gettext('Report name'), Katrid.Reports.Reports.currentUserReport.name);
      if (name) {
        Katrid.Reports.Reports.currentUserReport.name = name;
        $.ajax({
          type: 'POST',
          url: this.container.find('#report-form').attr('action') + '?save=' + name,
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          data: JSON.stringify(params)
        });
      }
      return false;
    }

    load(fields, params) {
      if (!fields) {
        ({ fields } = this.info);
      }
      if (!params) {
        params = [];
      }
      this.fields = fields;

      // Create params
      return (() => {
        const result = [];
        for (let p of Array.from(fields)) {
          if (p.groupable) {
            this.groupables.push(p);
          }
          if (p.sortable) {
            this.sortables.push(p);
          }
          if (p.total) {
            this.totals.push(p);
          }
          result.push(p.autoCreate = Array.from(params).includes(p.name));
        }
        return result;
      })();
    }

    loadParams() {
      console.log('load params', this.fields);
      return (() => {
        const result = [];
        for (let p of Array.from(this.fields)) {
          if (p.autoCreate) {
            result.push(this.addParam(p.name));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    addParam(paramName) {
      return (() => {
        const result = [];
        for (let p of Array.from(this.fields)) {
          if (p.name === paramName) {
            p = new Param(p, this);
            this.params.push(p);
            //$(p.render(@elParams))
            break;
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    getValues() {}


    export(format) {
      if (format == null) { format = 'pdf'; }
      const params = this.getUserParams();
      const svc = new Katrid.Services.Model('sys.action.report');
      svc.post('export_report', null, { args: [this.info.id], kwargs: { format, params } })
      .done(function(res) {
        if (res.result.open) {
          return window.open(res.result.open);
        }
      });
      return false;
    }

    preview() {
      return this.export();
    }

    renderFields() {
      let p;
      let el = $('<div></div>');
      const flds = ((() => {
        const result = [];
        for (p of Array.from(this.fields)) {         result.push(`<option value="${p.name}">${p.label}</option>`);
        }
        return result;
      })()).join('');
      const aggs = ((() => {
        const result1 = [];
        for (p of Array.from(this.fields)) {         if (p.total) {
            result1.push(`<option value="${p.name}">${p.label}</option>`);
          }
        }
        return result1;
      })()).join('');
      el = this.container.find('#report-params');
      let sel = el.find('#report-id-fields');
      sel.append($(flds))
      .select2({ tags: ((() => {
        const result2 = [];
        for (p of Array.from(this.fields)) {         result2.push({id: p.name, text: p.label});
        }
        return result2;
      })()) })
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
      if (Katrid.Reports.Reports.currentUserReport.params && Katrid.Reports.Reports.currentUserReport.params.fields) {
        console.log(Katrid.Reports.Reports.currentUserReport.params.fields);
        sel.select2('val', Katrid.Reports.Reports.currentUserReport.params.fields);
      }
      //sel.data().select2.updateSelection([{ id: 'vehicle', text: 'Vehicle'}])
      sel = el.find('#report-id-totals');
      sel.append(aggs)
      .select2({ tags: ((() => {
        const result3 = [];
        for (p of Array.from(this.fields)) {         if (p.total) {
            result3.push({ id: p.name, text: p.label });
          }
        }
        return result3;
      })()) })
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
      return el;
    }

    renderParams(container) {
      let p;
      const el = $('<div></div>');
      this.elParams = el;
      const loaded = {};

      const userParams = Katrid.Reports.Reports.currentUserReport.params;
      if (userParams && userParams.data) {
        for (p of Array.from(userParams.data)) {
          loaded[p.name] = true;
          this.addParam(p.name, p.value);
        }
      }

      for (p of Array.from(this.params)) {
        if (p.static && !loaded[p.name]) {
          $(p.render(el));
        }
      }
      return container.find('#params-params').append(el);
    }

    renderGrouping(container) {
      const opts = (Array.from(this.groupables).map((p) => `<option value="${p.name}">${p.label}</option>`)).join('');
      const el = container.find("#params-grouping");
      const sel = el.find('select').select2();
      return sel.append(opts)
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
    }

    renderSorting(container) {
      const opts = (Array.from(this.sortables).filter((p) => p.sortable).map((p) => `<option value="${p.name}">${p.label}</option>`)).join('');
      const el = container.find("#params-sorting");
      const sel = el.find('select').select2();
      return sel.append(opts)
      .select2("container").find("ul.select2-choices").sortable({
          containment: 'parent',
          start() { return sel.select2("onSortStart"); },
          update() { return sel.select2("onSortEnd"); }
      });
    }

    render(container) {
      this.container = container;
      let el = this.renderFields();
      if (this.sortables.length) {
        el = this.renderSorting(container);
      } else {
        container.find("#params-sorting").hide();
      }

      if (this.groupables.length) {
        el = this.renderGrouping(container);
      } else {
        container.find("#params-grouping").hide();
      }

      return el = this.renderParams(container);
    }
  }


  class Params {
    static initClass() {
      this.Operations = {
        exact: 'exact',
        in: 'in',
        contains: 'contains',
        startswith: 'startswith',
        endswith: 'endswith',
        gt: 'gt',
        lt: 'lt',
        between: 'between',
        isnull: 'isnull'
      };

      this.DefaultOperations = {
        CharField: this.Operations.exact,
        IntegerField: this.Operations.exact,
        DateTimeField: this.Operations.between,
        DateField: this.Operations.between,
        FloatField: this.Operations.between,
        DecimalField: this.Operations.between,
        ForeignKey: this.Operations.exact,
        sqlchoices: this.Operations.exact
      };

      this.TypeOperations = {
        CharField: [this.Operations.exact, this.Operations.in, this.Operations.contains, this.Operations.startswith, this.Operations.endswith, this.Operations.isnull],
        IntegerField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        FloatField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DecimalField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DateTimeField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        DateField: [this.Operations.exact, this.Operations.in, this.Operations.gt, this.Operations.lt, this.Operations.between, this.Operations.isnull],
        ForeignKey: [this.Operations.exact, this.Operations.in, this.Operations.isnull],
        sqlchoices: [this.Operations.exact, this.Operations.in, this.Operations.isnull]
      };

      this.Widgets = {
        CharField(param) {
          return `<div><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}" ng-model="param.value1" type="text" class="form-control"></div>`;
        },

        IntegerField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>`;
          }
          return `<div class="row"><div class="col-sm-6"><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}" type="number" ng-model="param.value1" class="form-control"></div>${secondField}</div>`;
        },

        DecimalField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}-2" ng-model="param.value2" type="text" class="form-control"></div>`;
          }
          return `<div class="col-sm-6"><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}" type="number" ng-model="param.value1" class="form-control"></div>${secondField}`;
        },

        DateTimeField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><label class="control-label">&nbsp;</label>
  <div class="input-group date"><input id="rep-param-id-${param.id}-2" datepicker ng-model="param.value2" class="form-control">
  <div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div>
  </div>
  </div>
  `;
          }
          return `<div class="row"><div class="col-xs-6"><label class="control-label">&nbsp;</label><div class="input-group date"><input id="rep-param-id-${param.id}" datepicker ng-model="param.value1" class="form-control"><div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div></div></div>${secondField}</div>`;
        },

        DateField(param) {
          let secondField = '';
          if (param.operation === 'between') {
            secondField = `<div class="col-xs-6"><label class="control-label">&nbsp;</label><div class="input-group date"><input id="rep-param-id-${param.id}-2" datepicker ng-model="param.value2" class="form-control"><div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div></div></div>`;
          }
          return `<div class="row"><div class="col-xs-6"><label class="control-label">&nbsp;</label><div class="input-group date"><input id="rep-param-id-${param.id}" datepicker ng-model="param.value1" class="form-control"><div class="input-group-addon"><span class="glyphicon glyphicon-th"></span></div></div></div>${secondField}</div>`;
        },

        ForeignKey(param) {
          const serviceName = param.params.info.model;
          let multiple = '';
          if (param.operation === 'in') {
            multiple = 'multiple';
          }
          return `<div><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}" ajax-choices="/api/rpc/${serviceName}/get_field_choices/" field="${param.name}" ng-model="param.value1" ${multiple}></div>`;
        },

        sqlchoices(param) {
          return `<div><label class="control-label">&nbsp;</label><input id="rep-param-id-${param.id}" ajax-choices="/api/reports/choices/" sql-choices="${param.name}" ng-model="param.value1"></div>`;
        }
      };
    }
  }
  Params.initClass();


  class Param {
    constructor(info, params) {
      this.info = info;
      this.params = params;
      this.name = this.info.name;
      this.label = this.info.label;
      this.static = this.info.param === 'static';
      this.field = this.params.info.fields && this.params.info.fields[this.name];
      this.type = this.info.type || (this.field && this.field.type) || 'CharField';
      if (this.info.sql_choices) {
        this.type = 'sqlchoices';
      }
      this.defaultOperation = this.info.default_operation || Params.DefaultOperations[this.type];
      this.operation = this.defaultOperation;
      // @operations = @info.operations or Params.TypeOperations[@type]
      this.operations = this.getOperations();
      this.exclude = this.info.exclude;
      this.id = ++_counter;
    }

    defaultValue() {
      return null;
    }

    setOperation(op, focus) {
      if (focus == null) { focus = true; }
      this.createControls(this.scope);
      const el = this.el.find(`#rep-param-id-${this.id}`);
      if (focus) {
        el.focus();
      }
    }

    createControls(scope) {
      const el = this.el.find("#param-widget");
      el.empty();
      let widget = Params.Widgets[this.type](this);
      widget = this.params.scope.compile(widget)(scope);
      return el.append(widget);
    }

    getOperations() { return (Array.from(Params.TypeOperations[this.type]).map((op) => ({ id: op, text: Params.Labels[op] }))); }

    operationTemplate() {
      const opts = this.getOperations();
      return `<div class="col-sm-4"><label class="control-label">${this.label}</label><select id="param-op-${this.id}" ng-model="param.operation" ng-init="param.operation='${this.defaultOperation}'" class="form-control" onchange="$('#param-${this.id}').data('param').change();$('#rep-param-id-${this.id}')[0].focus()">
  ${opts}
  </select></div>`;
    }

    template() {
      const operation = this.operationTemplate();
      return `<div id="param-${this.id}" class="row form-group" data-param="${this.name}" ng-controller="ParamController"><div class="col-sm-12">${operation}<div id="param-widget-${this.id}"></div></div></div>`;
    }

    render(container) {
      this.el = this.params.scope.compile(this.template())(this.params.scope);
      this.el.data('param', this);
      this.createControls(this.el.scope());
      return container.append(this.el);
    }
  }


  Katrid.uiKatrid.controller('ReportController', function($scope, $element, $compile) {
    const xmlReport = $scope.$parent.action.info.content;
    const report = new Report($scope.$parent.action, $scope);
    $scope.report = report;
    console.log(report);
    report.loadFromXml(xmlReport);
    report.render($element);
    return report.loadParams();
  });


  Katrid.uiKatrid.controller('ReportParamController', function($scope, $element) {
    $scope.$parent.param.el = $element;
    $scope.$parent.param.scope = $scope;
    return $scope.$parent.param.setOperation($scope.$parent.param.operation, false);
  });


  this.Katrid.Reports = {
    Reports,
    Report,
    Param
  };
}).call(this);