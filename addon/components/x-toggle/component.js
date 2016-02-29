import Ember from 'ember';
import layout from './template';

const { on, run, computed, observer } = Ember;

export default Ember.Component.extend({
  layout: layout,
  tagName: 'span',
  classNameBindings: ['toggled:x-toggle-container-checked', 'disabled:x-toggle-container-disabled'],
  classNames: ['x-toggle-container'],
  disabled: false,
  name: 'default',

  onLabelValue: computed('onLabel', function () {
    var on = this.get('onLabel');
    var index = on.indexOf(':');

    return index > -1 ? on.substr(0, index) : on;
  }),

  offLabelValue: computed('offLabel', function () {
    var off = this.get('offLabel');
    var index = off.indexOf(':');

    return index > -1 ? off.substr(0, index) : off;
  }),

  themeClass: computed('theme', function () {
    var theme = this.get('theme') || 'default';

    return 'x-toggle-' + theme;
  }),

  forId: computed(function () {
    return this.get('elementId') + '-x-toggle';
  }),

  // rawToggled is two-way bound to the DOM checkbox
  rawToggled: false,

  // toggled is the value that comes down to us. We don't ever write
  // it from within this component.
  toggled: Ember.computed({
    get() {},
    set(key, value) {
      var onIndex = this.get('onLabel').indexOf(':');
      var onState = onIndex > -1 ? this.get('onLabel').substr(onIndex + 1) : true;
      this._shush = true;
      this.set('rawToggled', onState === value);
      this._shush = false;
      return value;
    }
  }),

  // This will fire both due to user click and due to our own `set` in
  // upstreamChanged. But we guard against looping during our own `set`.
  userChanged: observer('rawToggled', function() {
    if (this._shush) { return; }

    var debounce = this.get('debounce');
    if (!debounce) {
      debounce = run.debounce(this, function () {
        var offIndex = this.get('offLabel').indexOf(':');
        var onIndex = this.get('onLabel').indexOf(':');
        var offState = offIndex > -1 ? this.get('offLabel').substr(offIndex + 1) : false;
        var onState = onIndex > -1 ? this.get('onLabel').substr(onIndex + 1) : true;

        this.sendAction('on-toggle', this.get('rawToggled') ? onState : offState);
        this.set('debounce', null);
      }, 500);
      this.set('debounce', debounce);
    }
  }),

  clearDebounce: on('willDestroyElement', function () {
    var debounce = this.get('debounce');
    if (debounce) {
      run.cancel(debounce);
      this.set('debounce', null);
    }
  })
});
