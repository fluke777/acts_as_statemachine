YUI.add('acts_as_statemachine', function(Y) { var GDC = Y.GDC;

var ActsAsStateMachine = function(userValues) {
  var attributeConfig = {
    // current state, object is in
    state: {
        value: undefined
    },
    // all states, object has
    states: {
        value: []
    },
    // events, object knows, with associated rules for transitions
    events: {
      value: {}
    }
  };
  this.addAttrs(attributeConfig, userValues);
};

ActsAsStateMachine.prototype = {
  addState: function(state) {
    var states = this.get('states');
    states.push(state);
    this.set('states', states);
  },
  addEvent: function(event, fun) {
    var events = this.get('events');
    
    // Simple hacks, allows us to have nicer API,
    // maybe might be implemented as an object, rather than giving each instance a method, don't know
    var rules = [];
    rules.transition = function(rule) {
      this.push(rule);
    };
    
    fun.call(this, rules);
    
    events[event] = rules;
    this.set('events', events);
    
    this[event] = function() {
      this._makeTransitions(event);
    };
  },
  _makeTransitions: function(event) {
    var transitions = this.get('events')[event] || [],
        currentState = this.get('state'),
        currentTransition,
        funName;
    
    transitions = transitions.filter(function(t) {
      return t.from === currentState;
    });

    if (!transitions.length) {
      throw "NoTransitionDefined";
    } else if (transitions.length === 1) {
      currentTransition = transitions[0];
      funName = currentTransition.from + '_' + currentTransition.to;
      this[funName] && this[funName].call(this);
      this.set('state', currentTransition.to);
    } else {
      throw "MoreTransitionsFound";
    }
  }
};

Y.augment(ActsAsStateMachine, Y.Attribute);
Y.ActsAsStateMachine = ActsAsStateMachine;
},  '0.0.1', {requires: [
    'attribute'
]});
