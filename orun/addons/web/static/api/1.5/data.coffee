
class RecordState
  @destroyed = 'destroyed'
  @created = 'created'
  @modified = 'modified'


class DataSourceState
  @inserting = 'inserting'
  @browsing = 'browsing'
  @editing = 'editing'
  @loading = 'loading'
  @inactive = 'inactive'


class DataSource
  constructor: (@scope) ->
    @recordIndex = 0
    @recordCount = null
    @loading = false
    @loadingRecord = false
    @masterSource = null
    @pageIndex = 0
    @pageLimit = 100
    @offset = 0
    @offsetLimit = 0
    @requestInterval = 300
    @pendingRequest = null
    @fieldName = null
    @children = []
    @modifiedData = null
    @uploading = 0
    @state = null
    @fieldChangeWatchers = []

  cancelChanges: ->
    if @state is DataSourceState.inserting and Katrid.Settings.UI.goToDefaultViewAfterCancelInsert
      @scope.record = null
      @scope.action.setViewType('list')
    else
      if @state is DataSourceState.editing
        r = @refresh([@scope.record.id])
        if r and $.isFunction(r.promise)
          r.done =>
            @setState(DataSourceState.browsing)
        else
          @setState(DataSourceState.browsing)
      else
        @scope.record = null
        @setState(DataSourceState.browsing)
    return

  saveAndClose: ->
    # Save changes and close dialog
    r = @saveChanges(false)
    if r and $.isFunction(r.promise)
      r.done (res) =>
        if res.ok and res.result
          @scope.result = res.result
        $(@scope.root).closest('.modal').modal('toggle')

  saveChanges: (autoRefresh=true) ->
    # Submit fields with dirty state only
    el = @scope.formElement
    if @validate()
      data = @getModifiedData(@scope.form, el, @scope.record)
      @scope.form.data = data

      beforeSubmit = el.attr('before-submit')
      if beforeSubmit
        beforeSubmit = @scope.$eval(beforeSubmit)

      #@scope.form.data = null

      if data
        @uploading++
        return @scope.model.write([data])
        .done (res) =>
          if res.ok
            @scope.form.$setPristine()
            @scope.form.$setUntouched()
            for child in @children
              delete child.modifiedData
            @setState(DataSourceState.browsing)
            if autoRefresh
              @refresh(res.result)
          else
            s = "<span>#{Katrid.i18n.gettext 'The following fields are invalid:'}<hr></span>"
            if res.message
              s = res.message
            else if res.messages
              for fld of res.messages
                msgs = res.messages[fld]
                field = @scope.view.fields[fld]
                elfield = el.find(""".form-field[name="#{field.name}"]""")
                elfield.addClass('ng-invalid ng-touched')
                s += "<strong>#{field.caption}</strong><ul>"
                for msg in msgs
                  s += "<li>#{msg}</li>"
                s += '</ul>'
              if elfield
                elfield.focus()

            Katrid.Dialogs.Alerts.error s
        .always =>
          @scope.$apply =>
            @uploading--
      else
        Katrid.Dialogs.Alerts.warn Katrid.i18n.gettext 'No pending changes'
    return

  copy: (id) ->
    @scope.model.copy(id)
    .done (res) =>
      @setState(DataSourceState.inserting)
      @scope.record = {}
      @scope.$apply =>
        @setFields(res.result)

  findById: (id) ->
    for rec in @scope.records
      if rec.id is id
        return rec

  hasKey: (id) ->
    for rec in @scope.records
      if rec.id is id
        true

  refresh: (data) ->
    if data
      # Refresh current record
      @scope.action.location.search 'id', data[0]
    else
      return @search @_params, @_page

  validate: ->
    if @scope.form.$invalid
      s = "<span>#{Katrid.i18n.gettext 'The following fields are invalid:'}</span><hr>"
      el = @scope.formElement
      for errorType of @scope.form.$error
        for child in @scope.form.$error[errorType]
          elfield = el.find(""".form-field[name="#{child.$name}"]""")
          elfield.addClass('ng-touched')
          field = @scope.view.fields[child.$name]
          s += "<span>#{field.caption}</span><ul><li>#{Katrid.i18n.gettext 'This field cannot be empty.'}</li></ul>"
      console.log(elfield)
      elfield.focus()
      Katrid.Dialogs.Alerts.error s
      return false
    return true

  getIndex: (obj) ->
    rec = @findById(obj.id)
    @scope.records.indexOf(rec)

  search: (params, page, fields) ->
    @_params = params
    @_page = page
    @_clearTimeout()
    @pendingRequest = true
    @loading = true
    page = page or 1
    @pageIndex = page
    domain = @scope.action.info.domain
    if domain
      domain = JSON.parse(domain)
    params =
      count: true
      page: page
      params: params
      fields: fields
      domain: domain
      limit: @limit

    def = new $.Deferred()

    @pendingRequest = setTimeout =>
      @scope.model.search(params, {count: true})
      .fail (res) =>
        def.reject(res)
      .done (res) =>
        if @pageIndex > 1
          @offset = (@pageIndex - 1) * @pageLimit + 1
        else
          @offset = 1
        @.scope.$apply =>
          if res.result.count?
            @.recordCount = res.result.count
          @.scope.records = res.result.data
          if @pageIndex is 1
            @offsetLimit = @scope.records.length
          else
            @offsetLimit = @offset + @scope.records.length - 1
        def.resolve(res)
      .always =>
        @pendingRequest = false
        @scope.$apply =>
          @loading = false
    , @requestInterval

    return def.promise()

  groupBy: (group) ->
    if not group
      @groups = []
      return
    @groups = [group]
    @scope.model.groupBy(group.context)
    .then (res) =>
      @scope.records = []
      grouping = group.context.grouping[0]
      for r in res.result
        s = r[grouping]
        if $.isArray(s)
          r._paramValue = s[0]
          s = s[1]
        else
          r._paramValue = s
        r.__str__ = s
        r.expanded = false
        r.collapsed = true
        r._searchGroup = group
        r._paramName = grouping
        row = {_group: r, _hasGroup: true}
        @scope.records.push(row)
      @scope.$apply()

  goto: (index) ->
    @scope.moveBy(index - @recordIndex)

  moveBy: (index) ->
    newIndex = @recordIndex + index - 1
    if newIndex > -1 and newIndex < @scope.records.length
      @recordIndex = newIndex + 1
      @scope.action.location.search('id', @scope.records[newIndex].id)

  _clearTimeout: ->
    if @pendingRequest
      @loading = false
      @loadingRecord = false
      clearTimeout(@pendingRequest)

  setMasterSource: (master) ->
    @masterSource = master
    master.children.push(@)

  applyModifiedData: (form, element, record) ->
    data = @getModifiedData(form, element, record)
    _id = _.hash(record)
    if data
      ds = @modifiedData
      if not ds?
        ds = {}
      obj = ds[_id]
      if not obj
        obj = {}
        ds[_id] = obj
      for attr, v of data
        obj[attr] = v
        record[attr] = v

      @modifiedData = ds
      @masterSource.scope.form.$setDirty()
    return data

  getModifiedData: (form, element, record) ->
    if record.$deleted
      if record.id
        return {
          id: record.id
          $deleted: true
        }
      return
    if form.$dirty or @_modifiedFields.length
      data = {}
      for el in $(element).find('.form-field.ng-dirty')
        nm = el.name
        if nm
          data[nm] = record[nm]

      for child in @children
        subData = data[child.fieldName] or []
        for attr, obj of child.modifiedData
          if obj.$deleted
            obj =
              action: 'DESTROY'
              id: obj.id
          else if obj.id
            obj =
              action: 'UPDATE'
              values: obj
          else
            obj =
              action: 'CREATE'
              values: obj
          subData.push(obj)
        if subData
          data[child.fieldName] = subData

      # Check invisible fields
      for f in @_modifiedFields
        data[f] = record[f]

      if data
        if record.id
          data.id = record.id
        return data

    return

  get: (id, timeout) ->
    @_clearTimeout()
    @setState(DataSourceState.loading)
    @loadingRecord = true
    def = new $.Deferred()

    _get = =>
      @scope.model.getById(id)
      .fail (res) =>
        def.reject(res)
      .done (res) =>
        @scope.$apply =>
          @_setRecord(res.result.data[0])
        def.resolve(res)
      .always =>
        @setState(DataSourceState.browsing)
        @scope.$apply =>
          @loadingRecord = false

    if timeout is 0
      return _get()
    if @requestInterval or timeout
      @pendingRequest = setTimeout _get, timeout or @requestInterval

    return def.promise()

  newRecord: ->
    @setState(DataSourceState.inserting)
    @scope.record = {}
    @scope.record.display_name = Katrid.i18n.gettext '(New)'
    @scope.model.getDefaults(@scope.getContext())
    .done (res) =>
      if res.result
        @scope.$apply =>
          @setFields(res.result)

  setFields: (values) ->
    for attr, v of values
      control = @scope.form[attr]
      if control
        if v
          v = @toClientValue(attr, v)
        control.$setViewValue v
        control.$render()
        # Force dirty (bug fix for boolean (false) value
        if v is false
          @scope.record[attr] = v
          control.$setDirty()
      else
        @_modifiedFields.push(attr)
        @scope.record[attr] = v

  editRecord: ->
    @setState(DataSourceState.editing)

  toClientValue: (attr, value) ->
    console.log(attr, value)
    field = @scope.view.fields[attr]
    if field
      if field.type is 'DateTimeField'
        value = new Date(value)
    return value

  setState: (state) ->
    # Clear modified fields information
    @_modifiedFields = []
    @state = state
    @changing =  @state in [DataSourceState.editing, DataSourceState.inserting]

  _setRecord: (rec) ->
    @scope.record = rec
    @scope.recordId = rec.id
    @state = DataSourceState.browsing

  next: ->
    @moveBy(1)

  prior: ->
    @moveBy(-1)

  nextPage: ->
    p = @recordCount / @pageLimit
    if Math.floor(p)
      p++
    if p > @pageIndex + 1
      @scope.action.location.search('page', @pageIndex + 1)

  prevPage: ->
    if @pageIndex > 1
      @scope.action.location.search('page', @pageIndex - 1)

  setRecordIndex: (index) ->
    @recordIndex = index + 1

  onFieldChange: (res) =>
    if res.ok and res.result.fields
      @scope.$apply =>
        for f, v of res.result.fields
          @scope.$set(f, v)

  expandGroup: (index, row) ->
    rg = row._group
    params =
      params: {}
    params.params[rg._paramName] = rg._paramValue
    @scope.model.search(params)
    .then (res) =>
      if res.ok and res.result.data
        @scope.$apply =>
          rg._children = res.result.data
          @scope.records.splice.apply(@scope.records, [index + 1, 0].concat(res.result.data))

  collapseGroup: (index, row) ->
    group = row._group
    @scope.records.splice(index + 1, group._children.length)
    delete group._children


class Record
  constructor: (@res) ->
    @data = @res.data


Katrid.Data =
  DataSource: DataSource
  Record: Record
  RecordState: RecordState
  DataSourceState: DataSourceState
