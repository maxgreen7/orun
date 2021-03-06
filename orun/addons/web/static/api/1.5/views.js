(function () {
  class SearchMenu {
    constructor(element, parent, options) {
      this.element = element;
      this.parent = parent;
      this.options = options;
      this.input = this.parent.find('.search-view-input');
      this.input.on('input', evt => {
        console.log('change val');
        if (this.input.val().length) {
          return this.show();
        } else {
          return this.close();
        }
    }).on('keydown', evt => {
        switch (evt.which) {
          case $.ui.keyCode.BACKSPACE:
            if (this.input.val() === '') {
              const item = this.searchView.query.items[this.searchView.query.items.length-1];
              this.searchView.onRemoveItem(evt, item);
            }
            break;
        }
        }).on('blur', evt => {
        this.input.val('');
        return this.close();
      });
    }

    link() {
      return this.element.hide();
    }

    show() {
      this.element.show();
      return this.searchView.first();
    }

    close() {
      this.element.hide();
      return this.reset();
    }

    expand(item) {
      const { scope } = this.searchView;
      return scope.model.getFieldChoices(item.ref.name, scope.search.text)
      .then(res => {
        if (res.ok) {
          return Array.from(res.result).map((obj) =>
            this.searchView.loadItem(item.item, obj, item));
        }
      });
    }

    collapse(item) {
      for (let i of Array.from(item.children)) {
        i.destroy();
      }
      return item.children = [];
    }

    reset() {
      return (() => {
        const result = [];
        for (let i of Array.from(this.searchView.items)) {
          if (i.children && i.children.length) {
            this.collapse(i);
            result.push(i.reset());
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    select(evt, item) {
      if (this.options.select) {
        if (item.parentItem) {
          item.parentItem.value = item.value;
          item = item.parentItem;
        }
        item.searchString = this.input.val();
        this.options.select(evt, item);
        return this.input.val('');
      }
    }
  }


  class SearchQuery {
    constructor(searchView) {
      this.searchView = searchView;
      this.items = [];
      this.groups = [];
    }

    add(item) {
      if (Array.from(this.items).includes(item)) {
        item.facet.addValue(item);
        item.facet.refresh();
      } else {
        this.items.push(item);
        this.searchView.renderFacets();
      }
      if (item instanceof SearchGroup) {
        this.groups.push(item);
      }
      this.searchView.change();
      item.onSelect();
    }

    remove(item) {
      this.items.splice(this.items.indexOf(item), 1);
      if (item instanceof SearchGroup) {
        this.groups.splice(this.groups.indexOf(item), 1);
      }
      item.onRemove();
      console.log('item remove', item);
      this.searchView.change();
    }

    getParams() {
      let r = [];
      for (let i of Array.from(this.items)) {
        r = r.concat(i.getParamValues());
      }
      return r;
    }
  }


  // TODO remove this class
  class FacetView {
    constructor(item) {
      this.item = item;
      this.values = [{searchString: this.item.getDisplayValue(), value: this.item.value}];
    }

    addValue(item) {
      this.item = item;
      return this.values.push({searchString: this.item.getDisplayValue(), value: this.item.value});
    }

    templateValue() {
      const sep = ` <span class="facet-values-separator">${Katrid.i18n.gettext('or')}</span> `;
      return (Array.from(this.values).map((s) => s.searchString)).join(sep);
    }

    template() {
      const s = `<span class="facet-label">${this.item.getFacetLabel()}</span>`;
      return `<div class="facet-view">
  ${s}
  <span class="facet-value">${this.templateValue()}</span>
  <span class="fa fa-sm fa-remove facet-remove"></span>
  </div>`;
    }

    link(searchView) {
      const html = $(this.template());
      this.item.facet = this;
      this.element = html;
      const rm = html.find('.facet-remove');
      rm.click(evt => {
        return searchView.onRemoveItem(evt, this.item);
      });
      return html;
    }

    refresh() {
      return this.element.find('.facet-value').html(this.templateValue());
    }
  }


  class SearchItem {
    constructor(name, item, parent, ref, menu) {
      this.name = name;
      this.item = item;
      this.parent = parent;
      this.ref = ref;
      this.menu = menu;
      this.label = this.item.attr('label') || (this.ref && this.ref['caption']) || this.name;
    }

    templateLabel() {
      return ` Pesquisar <i>${this.label}</i> por: <strong>\${search.text}</strong>`;
    }

    template() {
      let s = '';
      if (this.expandable) {
        s = "<a class=\"expandable\" href=\"#\"></a>";
      }
      if (this.value) {
        s = `<a class="search-menu-item indent" href="#">${this.value[1]}</a>`;
      } else {
        s += `<a href=\"#\" class=\"search-menu-item\">${this.templateLabel()}</a>`;
      }
      return `<li>${s}</li>`;
    }

    link(scope, $compile, parent) {
      const html = $compile(this.template())(scope);
      if (parent != null) {
        html.insertAfter(parent.element);
        parent.children.push(this);
        this.parentItem = parent;
      } else {
        html.appendTo(this.parent);
      }

      this.element = html;

      this.itemEl = html.find('.search-menu-item').click(evt => evt.preventDefault()).mousedown(evt => {
        return this.select(evt);
      }).mouseover(function(evt) {
        const el = html.parent().find('>li.active');
        if (el !== html) {
          el.removeClass('active');
          return html.addClass('active');
        }
      });

      this.element.data('searchItem', this);

      this.expand = html.find('.expandable').on('mousedown', evt => {
        this.expanded = !this.expanded;
        evt.stopPropagation();
        evt.preventDefault();
        $(evt.target).toggleClass('expandable expanded');
        if (this.expanded) {
          return this.searchView.menu.expand(this);
        } else {
          return this.searchView.menu.collapse(this);
        }
    }).click(evt => evt.preventDefault());
      return false;
    }

    select(evt) {
      if (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
      this.menu.select(evt, this);
      return this.menu.close();
    }

    getFacetLabel() {
      return this.label;
    }

    getDisplayValue() {
      if (this.value) {
        return this.value[1];
      }
      return this.searchString;
    }

    getValue() {
      return (Array.from(this.facet.values).map((s) => s.value || s.searchString));
    }

    getParamValue(name, value) {
      const r = {};
      if ($.isArray(value)) {
        r[name] = value[0];
      } else {
        r[name + '__icontains'] = value;
      }
      return r;
    }

    getParamValues() {
      const r = [];
      for (let v of Array.from(this.getValue())) {
        r.push(this.getParamValue(this.name, v));
      }
      if (r.length > 1) {
        return [{'OR': r}];
      }
      return r;
    }

    destroy() {
      return this.element.remove();
    }

    remove() {
      this.searchView.removeItem(this);
    }

    reset() {
      this.expanded = false;
      this.expand.removeClass('expanded');
      return this.expand.addClass('expandable');
    }

    onSelect() {
      // do nothing
    }

    onRemove() {
      this.facet.element.remove();
      delete this.facet;
    }
  }


  class SearchField extends SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      if (ref.type === 'ForeignKey') {
        this.expandable = true;
        this.children = [];
      } else {
        this.expandable = false;
      }
    }
  }


  class SearchFilter extends SearchItem {
    link(scope, $compile, parent) {
      const ul = this.searchView.toolbar.find('.search-view-filter-menu');
      var el = $(`<li><a href="javascript:void(0)">${this.label}</a></li>`);
      this._toggleMenuEl = el;
      var me = this;
      el.click(function(evt) {
        evt.preventDefault();
        let e = $(this);
        if (me.facet) me.remove();
        else me.select();
      });
      return ul.append(el);
    }

    select(el) {
      super.select(null);
    }

    getFacetLabel() {
      console.log('get facet label');
      return '<span class="fa fa-filter"></span>';
    }

    getDisplayValue() {
      return this.label;
    }

    onSelect() {
      this._toggleMenuEl.addClass('selected');
    }

    onRemove() {
      this._toggleMenuEl.removeClass('selected');
      super.onRemove();
    }

  }


  class SearchGroup extends SearchItem {
    constructor(name, item, parent, ref, menu) {
      super(name, item, parent, ref, menu);
      const ctx = item.attr('context');
      if (typeof ctx === 'string') {
        this.context = JSON.parse(ctx);
      } else {
        this.context =
          {grouping: [name]};
      }
    }

    getFacetLabel() {
      return '<span class="fa fa-bars"></span>';
    }

    templateLabel() {
      return Katrid.i18n.gettext('Group by:') + ' ' + this.label;
    }

    getDisplayValue() {
      return this.label;
    }
  }


  class SearchView {
    constructor(scope, options) {
      this.inputKeyDown = this.inputKeyDown.bind(this);
      this.onSelectItem = this.onSelectItem.bind(this);
      this.onRemoveItem = this.onRemoveItem.bind(this);
      this.scope = scope;
      this.query = new SearchQuery(this);
      this.items = [];
      this.filters = [];
    }

    createMenu(scope, el, parent) {
      const menu = new SearchMenu(el, parent, {select: this.onSelectItem});
      menu.searchView = this;
      return menu;
    }

    template() {
      let html;
      return html = `\
  <div class="search-area">
    <div class="search-view">
      <div class="search-view-facets"></div>
      <input class="search-view-input" role="search" placeholder="${Katrid.i18n.gettext('Search...')}" ng-model="search.text">
      <span class="search-view-more fa fa-search-plus"></span>
    </div>
    <div class="col-sm-12">
    <ul class="search-dropdown-menu search-view-menu" role="menu"></ul>
    </div>
  </div>\
  `;
    }

    inputKeyDown(ev) {
      switch (ev.keyCode) {
        case Katrid.UI.keyCode.DOWN:
          this.move(1);
          ev.preventDefault();
          break;
        case Katrid.UI.keyCode.UP:
          this.move(-1);
          ev.preventDefault();
          break;
        case Katrid.UI.keyCode.ENTER:
          this.selectItem(ev, this.element.find('.search-view-menu > li.active'));
          break;
      }
    }

    move(distance) {
      const fw = distance > 0;
      distance = Math.abs(distance);
      while (distance !== 0) {
        distance--;
        let el = this.element.find('.search-view-menu > li.active');
        if (el.length) {
          el.removeClass('active');
          if (fw) {
            el = el.next();
          } else {
            el = el.prev();
          }
          el.addClass('active');
        } else {
          if (fw) {
            el = this.element.find('.search-view-menu > li').first();
          } else {
            el = this.element.find('.search-view-menu > li').last();
          }
          el.addClass('active');
        }
      }
    }

    selectItem(ev, el) {
      el.data('searchItem').select(ev);
    }

    link(scope, el, attrs, controller, $compile) {
      const html = $compile(this.template())(scope);
      el.replaceWith(html);
      html.addClass(attrs.class);

      this.$compile = $compile;
      this.view = scope.views.search;
      this.viewContent = $(this.view.content);
      this.element = html;
      this.toolbar = this.element.closest('.data-heading').find('.toolbar').first();
      this.searchView = html.find('.search-view');
      this.searchView.find('.search-view-input').keydown(this.inputKeyDown);

      html.find('.search-view-more').click(evt => {
        $(evt.target).toggleClass('fa-search-plus fa-search-minus');
        return this.viewMoreToggle();
      });
      this.menu = this.createMenu(scope, $(html.find('.search-dropdown-menu.search-view-menu')), html);
      this.menu.searchView = this;
      this.menu.link();

      // input key control events
      this.menu.input.on('keydown', function(evt) {});

      // add items to menu
      for (let item of Array.from(this.viewContent.children())) {
        this.loadItem($(item));
      }
    }

    loadItem(item, value, parent, cls) {
      const tag = item.prop('tagName');
      if ((cls == null)) {
        if (tag === 'FIELD') {
          cls = SearchField;
        } else if (tag === 'FILTER') {
          cls = SearchFilter;
        } else if (tag === 'GROUP') {
          for (let grouping of Array.from(item.children())) {
            this.loadItem($(grouping), null, null, SearchGroup);
          }
          return;
        }
      }

      const name = item.attr('name');
      item = new cls(name, item, this.menu.element, this.view.fields[name], this.menu);
      item.searchView = this;
      if (value) {
        item.expandable = false;
        item.value = value;
      }
      item.link(this.scope, this.$compile, parent);

      return this.items.push(item);
    }

    renderFacets() {
      return (() => {
        const result = [];
        for (let item of Array.from(this.query.items)) {
          if (!item.facet) {
            const f = new FacetView(item);
            const el = f.link(this);
            result.push(el.insertBefore(this.menu.input));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    viewMoreToggle() {
      this.viewMore = !this.viewMore;
      return this.scope.$apply(() => {
        return this.scope.search.viewMoreButtons = this.viewMore;
      });
    }

    first() {
      this.element.find('.search-view-menu > li.active').removeClass('active');
      return this.element.find('.search-view-menu > li').first().addClass('active');
    }

    onSelectItem(evt, obj) {
      return this.query.add(obj);
    }

    onRemoveItem(evt, obj) {
      return this.query.remove(obj);
    }

    removeItem(obj) {
      this.query.remove(obj);
    }

    change() {
      if (this.query.groups.length || (this.scope.dataSource.groups && this.scope.dataSource.groups.length)) {
        this.scope.action.applyGroups(this.query.groups);
      }
      if (this.query.groups.length === 0) {
        return this.scope.action.setSearchParams(this.query.getParams());
      }
    }
  }


  Katrid.UI.Views = {
    SearchView,
    SearchMenu
  };
}).call(this);