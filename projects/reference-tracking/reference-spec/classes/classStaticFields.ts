import "es-search-references-guest";

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  static owners: Person[] = [];

  constructor(owner: Person) {
    Vehicle.owners.push(owner);
  }
}

const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);

searchReferences("class static fields", Fred, [hisCar], true);
