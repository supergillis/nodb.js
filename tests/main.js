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
    lastName: 'Vermeulen',
    age: 15
  });

  Person.create({
    firstName: 'Gillis',
    lastName: 'Sandwich',
    age: 22
  });

  Person.create({
    firstName: 'Joseph',
    lastName: 'Boterham',
    age: 32
  });

  var emile = Person.create({
    firstName: 'Jean',
    lastName: 'Boterham',
    age: 41,
    kaka: 'pipi'
  });

  emile.firstName = 'Emile';

  console.log('** Names starting with J');

  var js = Person.find('firstLetter', 'J');
  while (js.hasNext()) {
    var person = js.next();
    console.log('person.name', person.name);
  }

  console.log('** Last name is Sandwich');

  var sw = Person.filter(function(person) {
    return person.lastName === 'Sandwich';
  });

  while (sw.hasNext()) {
    var person = sw.next();
    console.log('person.name', person.name);
  }

  console.log('** All names');

  var names = Person.all().map(function(person) {
    return person.name;
  });
  while (names.hasNext()) {
    console.log(names.next());
  }

  console.log('** Sum of ages');

  var ages = Person.all().map(function(person) {
    return person.age;
  }).sum();

  console.log(ages);

  console.log('** Maximum age');

  var maximum = Person.all().map(function(person) {
    return person.age;
  }).max();

  console.log(maximum);
});
