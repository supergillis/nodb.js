requirejs.config({
  baseUrl: '../'
});

require(['active-persistence'], function(ActivePersistence) {
  var persistence = new ActivePersistence();

  var Person = persistence.create({
    name: 'Person',
    properties: {
      firstName: '',
      lastName: '',
      parent: null
    },
    indexes: {
      firstName: 'firstName',
      firstLetter: function() {
        return this.firstName ? this.firstName[0] : null;
      }
    },
    proto: {
      get name() {
        return this.firstName + ' ' + this.lastName;
      },
      set name(value) {
        var spaceIndex = value.indexOf(' ');
        if (spaceIndex === -1) {
          this.firstName = value;
          this.lastName = '';
        }
        else {
          this.firstName = value.substr(0, spaceIndex);
          this.lastName = value.substr(spaceIndex + 1);
        }
      }
    }
  });

  Person.create({
    firstName: 'Joske',
    lastName: 'Vermeulen'
  });

  Person.create({
    firstName: 'Gillis',
    lastName: 'Sandwich'
  });

  Person.create({
    firstName: 'Joseph',
    lastName: 'Boterham'
  });

  var emile = Person.create({
    firstName: 'Jean',
    lastName: 'Boterham',
    kaka: 'pipi'
  });

  emile.firstName = 'Emile';

  var js = Person.find('firstLetter', 'J');
  while (js.hasNext()) {
    var person = js.next();
    console.log('person', person);
    console.log('person.name', person.name);
  }

  var sw = Person.filter(function() {
    return this.lastName === 'Sandwich';
  });

  while (sw.hasNext()) {
    var person = sw.next();
    console.log('person', person);
    console.log('person.name', person.name);
  }
});
