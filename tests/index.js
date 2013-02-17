require(['../active-persistence'], function(ActivePersistence) {
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

  var emile = Person.create({
    firstName: 'Emile',
    lastName: 'Van Ginderachter'
  });

  emile.firstName = 'Emiel';

  var persons = Person.all();
  while (persons.hasNext()) {
    var person = persons.next();
    console.log('person', person);
    console.log('person.name', person.name);
  }
});
