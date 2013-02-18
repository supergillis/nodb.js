requirejs.config({
  baseUrl: '../'
});

require(['active-persistence'], function(ActivePersistence) {
  var Person = ActivePersistence.create({
    name: 'Person',
    properties: {
      firstName: '',
      lastName: '',
      parent: null
    },
    indexes: {
      firstName: function() {
        return this.firstName;
      },
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
    firstName: 'Gillis',
    lastName: 'Van Ginderachter'
  });

  Person.create({
    firstName: 'Joseph',
    lastName: 'Van Ginderachter'
  });

  var emile = Person.create({
    firstName: 'Jean',
    lastName: 'Van Ginderachter'
  });

  var js = Person.find('firstLetter', 'J');
  while (js.hasNext()) {
    var person = js.next();
    console.log('person', person);
    console.log('person.name', person.name);
  }
});
