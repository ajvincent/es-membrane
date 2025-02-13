class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  static owners: Person[];

  constructor(owner: Person) {
    Vehicle.owners.push(owner);
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class extending other classes", Fred, [hisBike], true);
