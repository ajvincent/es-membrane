class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  static owners: Person[];
  static #manufactured = 0;

  readonly manufacturedOrder: number;

  constructor(owner: Person) {
    Vehicle.owners.push(owner);
    this.manufacturedOrder = Vehicle.#manufactured++;
  }
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class extending other classes", Fred, [hisBike], true);
