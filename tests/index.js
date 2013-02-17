require(['../active-persistence'], function(ActivePersistence) {
  var Person = ActivePersistence.create({
    name: 'Person',
    properties: {
      firstName: '',
      lastName: '',
      parent: null
    },
    prototype: {
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

  var gillis = Person.create({
    firstName: 'Gillis',
    lastName: 'Van Ginderachter'
  });

  gillis.firstName = 'steste';
  console.log('firstName', gillis.firstName);
  console.log('lastName', gillis.lastName);
  console.log('name', gillis.name);
});
