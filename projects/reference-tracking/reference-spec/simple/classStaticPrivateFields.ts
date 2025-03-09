class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  static #owners: Person[];

  constructor(owner: Person) {
    //this.owner = owner;
    Vehicle.#owners.push(owner);
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class static private fields", Fred, [hisBike], true);
