# nodb.js for an Orthogonally Persistent JavaScript

In the previous chapter we have introduced V8Ken, an orthogonally persistent
JavaScript engine. This is a JavaScript engine with a persistent heap, which
means that if the engine crashes and we restart it, that all objects in the heap are
still accessible and that the engine will continue from its last consistent
snapshot.

In this chapter, we introduce the nodb.js framework. The goal of the nodb.js
framework is to overcome the problems that are inherent to orthogonally
persistent languages. It provides the programmer with abstractions to organize
and query persistent data. This increases maintainability by allowing the
programmer to focus on the application being developed, rather than rolling his
or her own ad hoc framework to manage the persistent data.

Throughout this chapter we will implement a simple webshop application as
running example to illustrate the use of the nodb.js framework. The webshop
application should define abstracts for items, with a name and a price, and a cart,
which can contain multiple items.

## Models

Suppose you want to develop a webshop server application. In a traditional
server application one would first set up the database and define the schema for
items, carts, users... In an orthogonally persistent language however, there is no
notion of a database. The developer can immediately start writing the
application logic. However, without specific object definitions or schemata
there is no effective way to manage data. Such an undifferentiated pool of
objects can be hard to manage, comprehend and debug.

The nodb.js framework tries to reduce the lack of structure by introducing
explicit models. Models are the equivalent of schemata in databases as they can
specify properties and constraints on its instances. In other words, an instance of
a model can only have the properties specified by its model and instance values
will have to meet the the constraints defined on its corresponding property.

### Defining Models

Models are defined using the nodb.create function. Consider the example below
which shows an example of an Item model that could be used in the webshop
application.

*Declaration of the Item model.*

    var Item = nodb.create({
      name: ’Item’,
      properties: {
        name: nodb.string,
        brand: nodb.string,
        price: nodb.number
      }
    });

The name property defines the name of the model. The properties property
is an object with the names of the properties with the according types. This
model has three properties, one name of type nodb.string, one brand of type
nodb.string and one price of type nodb.number.

### Types and Validation

Each property of a model has a specific type. Values assigned to specific
properties of instances are validated upon initialization and assignment. An
exception is thrown when a value is not valid for the type of the assigned
property.

These are the default types made available by the nodb.js framework.

* nodb.any Any value can be assigned to a property with this type.
* nodb.boolean Only boolean values can be assigned to a property with this
type.
* nodb.number Only numeric values can be assigned to a property with this
type. This includes decimal numbers.
* nodb.integer Only integer values can be assigned to a property with this
type.
* nodb.string Only string values can be assigned to a property with this type.

If the above types do not satisfy the needs of the application, then it is
possible to implement custom types. To implement a custom type, an object
must be created with nodb.Type as prototype and it must define a
validate(instance, key, value) function.

For example, the following type is a type that only allows even numbers.

*Declaration of a type that only allows even numbers.*

    var evenNumberType = Object.create(nodb.Type, {
      validate: {
        value: function(instance, key, value) {
          return value % 2 === 0;
        }
      }
    });

Whenever we assign a an uneven number to the evenNumberType, an
exception is thrown. Consider the example below which illustrates the
assignment of an uneven number to a property with evenNumberType as its type.

*Example code using the type that only allows even numbers.*

    var Test = nodb.create({
      name: ’Test’,
      properties: {
        foo: evenNumberType
      }
    });
    
    var test = Test.create({
      foo: 1
    });

If we would run the above example, it would result in an exception: Invalid
value for property ’foo’ for model ’Test’!.

### Creating Instances

Now that we have defined the Item model, it is possible to create instances. An
instance can be created using the create function defined by the model.

*Instantiations of the Item model.*

    var chair1 = Item.create({
      name: ’Fingal’,
      brand: ’Ikea’,
      price: 45.99
    });
    
    var chair2 = Item.create({
      name: ’Markus’,
      brand: ’Ikea’,
      price: 159.00
    });

The create function expects a single argument, i.e. an object containing the
initial values for the instance being created. When no argument is given, all the
values will be uninitialized, i.e. undefined.

When an initial value for a non-existing property is passed, an exception will
be thrown.

*Invalid instantiation of the Item model.*

    var chair1 = Item.create({
      name: ’Fingal’,
      brand: ’Ikea’,
      price: 45.99,
      color: ’black’
    });

The execution of the above example throws an exception: Given values for
undefined properties: color. This is expected behavior because the Item model
does not have a color property.

Adding a property to an instance after it is created does not result in throwing
an exception. We can successfully execute the following piece of code.

*Instantiation of the Item model and setting extra properties.*

    var chair1 = Item.create({
      name: ’Fingal’,
      brand: ’Ikea’,
      price: 45.99
    });
    chair1.color = ’black’;
    
    console.log(chair1.color); // output: black

In JavaScript strict mode, however, this will result in an exception, since all
instances created by a model are frozen. When adding a new property to a frozen
object in strict mode, this will result in a TypeError [Ecm11].

### Defining Prototypes

Not only can we define properties for a model, we can also pass an object to the
model that will serve as prototype for its instances. All the elements of that
object will then be available in the instances of the model.
39For example, we can define a function toString on all the instances of the Item
model. This function returns a string representation of an Item instance.

*Declaration of the prototype for the Item model.*

    var Item = nodb.create({
      name: ’Item’,
      properties: {
        name: nodb.string,
        brand: nodb.string,
        price: nodb.number
      },
      proto: {
        toString: function() {
          return this.name + ’, ’ + this.brand;
        }
      }
    });

We can now use the toString function on all instances of the Item model.

*Example code using the prototype functions declared in the Item model.*

    console.log(chair1.toString()); // output: Fingal, Ikea
    console.log(chair2.toString()); // output: Markus, Ikea

Note that the prototype object passed as argument is not used as the actual
prototype of the instances. All properties of the given prototype are copied to
the existing prototype. This is illustrated in the example below.

*Example code to show that the prototype is copied to the model, instead of using its
reference.*

    var ItemPrototype = {
      toString: function() {
        return this.name + ’, ’ + this.brand;
      }
    };
    
    var Item = nodb.create({
      name: ’Item’,
      properties: {
        name: nodb.string,
        brand: nodb.string,
        price: nodb.number
      },
      proto: ItemPrototype
    });
    
    console.log(Object.getPrototypeOf(chair1) == ItemPrototype); // output: false

### Extending Models

Models support inheritance in order to avoid duplicate code and duplicate
properties for related models.

Suppose we want a new type of item, e.g. a colored item. Its model would
have the same properties of a regular item’s model, but with an extra property,
i.e. the color of the item. We don’t want to copy all the properties from the I
tem model, instead we can extend the Item model by calling the function extend
defined by the model.

*Declaration of the ColoredItem model that extends the Item model.*

    var ColoredItem = Item.extend({
      name: ’ColoredItem’,
      properties: {
        color: nodb.string
      }
    });

ColoredItem is now a model that inherits all the properties from the Item
model, plus its own properties, i.e. color.

We can now create colored items the same way we created regular items.

*Instantiations of the ColoredItem model.*

    var chair1 = ColoredItem.create({
      name: ’Fingal’,
      brand: ’Ikea’,
      price: 45.99,
      color: ’black’
    });
    
    var chair2 = ColoredItem.create({
      name: ’Markus’,
      brand: ’Ikea’,
      price: 159.00,
      color: ’blue’
    });

Instances of the ColoredItem model also inherit from the prototype of the I
tem model.

*Example code using the inherited prototype functions declared in the Item model.*

    console.log(chair1.toString()); // output: Fingal, Ikea
    console.log(chair2.toString()); // output: Markus, Ikea

If we want, we can also override methods on the prototype of the extended
model. Suppose we want the toString function to also add the color to the string
representation of the instance. Then we need to override the toString function
when extending the Item model.

*Declaration of the prototype of the ColoredItem model overwriting the prototype
of the Item model.*

    var ColoredItem = Item.extend({
      name: ’ColoredItem’,
      properties: {
        color: nodb.string
      },
      proto: {
        toString: function() {
          return this.name + ’ (’ + this.color + ’), ’ + this.brand;
        }
      }
    });

*Example code using the overwritten prototype functions declared in the ColoredI
tem model.*

    console.log(chair1.toString()); // output: Fingal (black), Ikea
    console.log(chair2.toString()); // output: Markus (blue), Ikea

### Relations

In the nodb.js framework it is also possible to define relations between models.
Relations between models allow us to express complex queries. This will be
shown in the following section, namely section 4.2
Each model has two extra predefined properties that allow type validation
for instances of models:

* one Only instances of this model can be assigned to a property with this
type, i.e. the Item.one type can only refer to an instance of the Item model.
* many Only a collection of instances of this model can be assigned to a
property with this type, i.e. the Item.many type can only refer to a
collection of instances instance of the Item model.

To complete the example models of the webshop application we will also
need models that represent a cart and a cart entry. The models for Cart and
CartEntry are shown in the example below.

*Declaration of the CartEntry and the Cart models.*

    var CartEntry = nodb.create({
      name: ’CartEntry’,
      properties: {
        item: Item.one,
        quantity: nodb.number
      }
    });
    
    var Cart = nodb.create({
      name: ’Cart’,
      properties: {
        name: nodb.string,
        entries: CartEntry.many
      }
    });

The CartEntry model represents an item in a cart which has an item and a
An entry could, for example, be four chairs, or one table. Then we
have the Cart model that has a name and multiple cart entries. A cart could, for
example, contain four chairs and one table.
quantity.

The price of a cart entry is calculated by multiplying the price of the item with
the quantity. With that formula we can add a getter for the price to the prototype
of the CartEntry, as shown in the example below.

*Declaration of the prototype for the CartEntry model.*

    var CartEntry = nodb.create({
      name: ’CartEntry’,
      properties: {
        item: Item.one,
        quantity: nodb.number
      },
      proto: {
        get price() {
          return this.quantity * this.item.price;
        }
      }
    });

The example below shows the use of the getter we defined in the above
example.

*Example code using the getter function declared in the prototype of the CartEntry
model.*

    var entry1 = CartEntry.create({
      item: chair1,
      quantity: 2
    });
    
    console.log(entry1.price); // 91.98

We could do the same for the Cart model, but first we need to know how to
perform queries.

## Querying

Querying with the nodb.js framework is achieved using collections and iterators.
Using the functions iterators provide, we can write complex queries.

When an instance of a model is instantiated, the model keeps track of that
instance. This allows the model to keep track of all its instances. In essence,
models are collections that contain their instances. This way, all the instances of
a model can be iterated and allow the application to execute queries on
instances of models.

### Collections and Iterators

Collections are a set of objects which collect instances of a particular model. As
stated above, every model is a collection and so are the values of the many type.
Every collection can be iterated. This way we can iterate all objects in a
collection. Iterators define several core functions with which we can formulate
more complex queries.

Below you can find an overview of the core functions iterators provide.

* collect() Return an array of all remaining elements of this iterator;
* concat(other) Return a lazy iterator that iterates the remaining elements
of this iterator and afterwards all remaining elements of the other iterator.
For example, a.concat(b) will first iterate all elements of a and afterwards
all elements of b.
* each(callback(element)) This function calls the function callback for each
remaining element in the iterator with the current element as parameter.
* filter(predicate) Returns a lazy iterator that will only iterate elements
that fulfill the given predicate. For example, a.filter(e => e > 0) will only
iterate the elements of a that are greater than zero.
* fold(initialValue, combiner(previousValue, element)) Reduces the
iterator to a single value by iteratively combining each element of the
iterator with an existing value using the provided function. For example,
[2, 3, 4].fold(1, (prev, e)=> prev * e) will return 1 ∗ 2 ∗ 3 ∗ 4.
* map(mapper) Returns a lazy iterator that iterates the remaining elements of
the iterator with each element replaced by the result of mapper(element).
For example, [2, 3, 4].map((e)=> e * 2) will return an iterator over [4,
6, 8].

Iterators also define auxiliary functions which make use of the core functions:

* max(optional comparator) Returns the biggest element as defined by the >
operator or by the given comparator.
* min(optional comparator) Returns the smallest element as defined by the
< operator or by the given comparator.
* reduce() Auxiliary function that essentially calls fold with the first element
of the iterator as initial value. For example, [2, 3, 4].reduce((prev, e)=>
prev * e) will return 2 ∗ 3 ∗ 4.
* sort(comparator) Returns a new iterator that iterates the remaining
elements in a sorted order specified by the given comparator.
* sum() Auxiliary function that essentially calls fold with 0 as initial value and
the + operator as combiner.

As stated above, the concat, filter and map functions are lazy. This means
that, if we for example call map on an iterator with 1000 elements, we will only
execute the the map callback upon iterating the mapped iterator. Thus the initial
call to map will not perform calculations. Only when we start iterating the
mapped iterator the map callback is executed. This laziness is convenient to limit
the amount of calculations performed.

### Querying Models

As stated in the previous section, models are collections and can thus be iterated
over. Consider the example below where we log all item names to the console.

*Example code showing the usage of the each function on an iterator.*

    ColoredItem.iterator().each(function(item) {
      console.log(item.toString());
    });
    
ColoredItem.iterator().each(...) can even be written shorter as ColoredItem.each(...).

*Example code showing the usage of the each function on a collection.*

    ColoredItem.each(function(item) {
      console.log(item.toString());
    });

By using iterators we can, for example, easily print all black colored items to
the console.

*Example code showing the usage of the filter function on a collection.*

    ColoredItem.filter(function(item) {
      return item.color === ’black’;
    }).each(function(item) {
      console.log(item.toString());
    });

### Completing the Webshop Example

As stated before, instances in a many property are also stored in collections. We
can thus use the iterator functions to implement the price getter in the
prototype of the Cart model. The price of a cart is the same as the sum of all its
entries. This calculation can be accomplished using the fold function defined on
the collection using the + operator as folder and using an initial value of 0.

*Declaration of the prototype for the Cart model using the fold function on the
entries of the cart.*

    var Cart = nodb.create({
      name: ’Cart’,
      properties: {
        name: nodb.string,
        entries: CartEntry.many
      },
      proto: {
        get price() {
          return this.entries.fold(0, function(prev, entry) {
            return prev + entry.price;
          });
        }
      }
    });

Below you can find an example demonstrating the price getter defined on a
cart.

*Example code using the prototype functions declared in the Cart model.*

    var cart = Cart.create();
    cart.entries.add(CartEntry.create({
      item: chair1,
      quantity: 2
    }));
    
    cart.entries.add(CartEntry.create({
      item: chair2,
      quantity: 3
    }));
    
    console.log(cart.price); // output: 568.98

### Comparison with Relational Algebra

Below you can find a table that compares relational algebra, expressed in SQL,
with nodb.js queries.

This table shows that we can express the most important queries in relational
algebra using the nodb.js framework. The most important difference is that we
specify how we want to retrieve data, not which data we want to retrieve. This
gives more responsibility to the programmer.

*Table of comparison of relational algebra and nodb.js querying.*

<table>
  <tr>
    <th></th>
    <th>SQL</th>
    <th>nodb.js</th>
  </tr>
  <tr>
    <th>Select</th>
    <td>
SELECT * FROM items;
SELECT * FROM items
WHERE name = ’Fingal’;
    </td>
    <td>
Item.each(i => ...)
Item.filter(i => i.name
=== ’Fingal’)
.each(i => ...)
    </td>
  </tr>
  <tr>
    <th>Project</th>
    <td>
SELECT price FROM items;
SELECT price FROM items
WHERE name = ’Fingal’;
    </td>
    <td>
Item.map(i => i.price)
.each(p => ...)
Item.filter(i => i.name
=== ’Fingal’)
.map(i => i.price)
.each(p => ...)
    </td>
  </tr>
  <tr>
    <th>Cartesian Product</td>
    <td>
SELECT name, price
FROM items
WHERE price > 100;
    </td>
    <td>
Item.filter(i => i.price
> 100)
.map(i => {
name: i.name,
price: i.price
})
.each(o => ...)
    </td>
  </tr>
  <tr>
    <th>Natural Join</th>
    <td>
SELECT i.name, i.price,
c.quantity
FROM cartentry c price: e.item..price,
NATURAL JOIN item i quantity: e.quantity
ON c.name = i.name;
    </td>
    <td>
CartEntry.map(e => {
name: e.item.name,
})
.each(j => ...)
    </td>
  </tr>
</table>

## Revisions

In the previous chapter we stated that V8Ken consists of an event-loop in which
each turn is an ACID transaction. Singly, these transactions do not provide the
fine-grained control some applications might require. That is why we introduce
revisions. Revisions can span multiple Ken turns and there can be multiple
revisions in one Ken turn. Thus, they allow more fine-grained transactions.
Revisions are based on worlds [WOKK11]:

> The world is a new language construct that reifies the notion of
> program state. All computation takes place inside a world, which
> captures all of the side effects - changes to global and local variables,
> arrays, objects’ instance variables, etc. - that happen inside it.
> Worlds are first-class values: they can be stored in variables, passed
> as arguments to functions, etc. They can even be garbage-collected
> just like any other object. A new world can be “sprouted” from an
> existing world at will. The state of a child world is derived from the
> state of its parent, but the side effects that happen inside the child
> do not affect the parent. At any time, the side effects captured in the
> child world can be propagated to its parent via a commit operation.

Suppose we define a point p - with a property x set to 1 and a property y set
to 2 - in a world A. Afterwards we sprout this world into a new world B. In world
B we change the y property of p to 3. Then we sprout another world from world A
and get a new world C. In world C we change the y property of p to 7. In Figure 4.1
the values of the properties of p for each world are shown.

*Views of the same object in three different worlds.*

Revisions use the same concept as worlds but we decided to name them to revisions as they only track the state of instances of models. This avoids confusion with worlds, which track the state of all objects. To summarize, revisions contain the state of all the instances created with the nodb.js framework. Different revisions can have different state for the same instances, which allows us control the scope of side effects.

Consider the example below.

*Instantiation of the ColoredItem model.*
    var chair1 = ColoredItem.create({
      name: 'Fingal',
      brand: 'Ikea',
      price: 45.99,
      color: 'black'
    });

Executing the above example will create a new instance of ColoredItem in the current revision.
Now, when we branch the current revision and change the name of chair1 in the branched revision
then the parent revision will not be affected. Thus the change of name is scoped to the branched
revision only.

*Example code showing the usage of revisions.*

var rev1 = nodb.revision.branch();
rev1.in(function() {
chair1.name = ’nodb.js’;
console.log(chair1.name); // output: nodb.js
});
console.log(chair1.name); // output: Fingal

One can also branch multiple revisions from the same parent.

*Example code showing the usage of multiple revisions at the same time.*

    var rev1 = nodb.revision.branch();
    rev1.in(function() {
      chair1.name = ’branch1’;
      console.log(chair1.name); // output: branch1
    });
    
    var rev2 = nodb.revision.branch();
    rev2.in(function() {
      chair1.name = ’branch2’;
      console.log(chair1.name); // output: branch2
    });
    
    console.log(chair1.name); // output: Fingal

When we are ready editing items in the new revision, we can commit the
changes to the parent revision. This is accomplished calling rev1.commit() as
shown in the example below.

*Example code showing the usage of the commit function on a revision.*

    rev1.commit();
    console.log(chair1.name); // output: nodb.js

Suppose we run the webshop application, described in the previous section,
and a customer wants to double the quantity of all the items in his or her cart.
Consider the example below where we iterate over all entries of the cart and try
to double their quantity.

*Example code showing the simulation of throwing an exception without revisions.*

    cart.entries.each(function(entry) {
      if (!isInStock(entry.item, entry.quantity * 2))
        throw ’Not enough items available!’;
      entry.quantity *= 2;
    });

When an extra item is not available however, we cannot add it to our cart and
an exception is thrown. The problem is that we might already have doubled an
item in the cart before the exception was thrown. To undo this change, we would
have to keep track of all quantities and restore them when an exception occurs.
This style of programming is error-prone.
We can solve the problem above using revisions. Before doubling all the
items in the cart, we branch the current revision and continue working in that
revision.

*Example code showing the simulation of throwing an exception with revisions.*

    var rev1 = nodb.revision.branch();
    rev1.in(function() {
      cart.entries.each(function(entry) {
        if (!isInStock(entry.item, entry.quantity * 2))
          throw ’Not enough items available!’;
        entry.quantity *= 2;
      });
    });
    rev1.commit();

First we branch the current revision. This gives us a new revision which has
the same state for all instances as its parent revision. Next we execute the same
statement as in the previous example, but the changes made to the entries are
now only visible in the scope of rev1. Now, when an extra item is not available,
an exception is thrown which might get rev1 in an inconsistent state. If that is
the case, we can choose not to commit the revision and so the inconsistent state
stays within rev1. Eventually, rev1 will get garbage collected together with the
uncommitted inconsistent state.

## Summary

The goal of the nodb.js framework was to bring essential features of database
management systems to our orthogonal persistent JavaScript engine.

We have introduced an alternative to schema definition with nodb.js models.
Using models we can specify properties and constraints on its instances. Each
property has a specific type. Values assigned to specific properties of instances
are validated upon initialization and assignment.

Models are more powerful than schema definitions in the sense that they
can be extended and thus increasing reusability. Models can also specify
business logic for its instances. In fact, models look more like classes of the
object-oriented programming paradigm. However, the focus with models lies on
structuring data, querying and relations, not on abstraction.

Relations, collections and iterators allow defining complex queries that can
express the most important operations in relational algebra.

Lastly, we introduced revisions, a fine-grained transaction mechanism, that
allow the application to control the scope of side effects. Revisions contain the
state of all the instances created with the nodb.js framework. Different revisions
can have different state for the same instances. Changes made in a branched
revision can be committed to the parent revision.


[Ecm11] Standard Ecma. Ecma-262 ecmascript language specification, 2011.
[WOKK11] Alessandro Warth, Yoshiki Ohshima, Ted Kaehler, and Alan Kay.
Worlds: Controlling the scope of side effects. In ECOOP 2011–
Object-Oriented Programming, pages 179–203. Springer, 2011.
